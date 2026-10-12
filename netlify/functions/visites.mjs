import { getStore } from "@netlify/blobs"

/* ==========================================================
   STATISTIQUES DE VISITES AGRÉGÉES
   - aucun nom, e-mail ou IP n'est stocké
   - pays/région et appareil sont conservés uniquement en totaux
   - le navigateur indique seulement s'il s'agit d'un retour
   ========================================================== */

const stockage = getStore("statistiques-maison-enrica")
const cleCompteur = "visites-site"
const cleStatistiques = "visites-statistiques"

function reponseJSON(donnees, statut = 200) {
    return new Response(JSON.stringify(donnees), {
        status: statut,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    })
}

async function lireCompteur() {
    const donnees = await stockage.get(cleCompteur, {
        consistency: "strong",
        type: "json"
    })

    return Number(donnees?.visites || 0)
}

async function incrementerJSON(cle, modifier, valeurInitiale) {
    for (let tentative = 0; tentative < 5; tentative++) {
        const entree = await stockage.getWithMetadata(cle, {
            consistency: "strong",
            type: "json"
        })

        if (entree === null) {
            const nouveau = modifier(structuredClone(valeurInitiale))
            const creation = await stockage.setJSON(cle, nouveau, { onlyIfNew: true })
            if (creation.modified) return nouveau
            continue
        }

        const nouveau = modifier(entree.data)
        const miseAJour = await stockage.setJSON(cle, nouveau, { onlyIfMatch: entree.etag })
        if (miseAJour.modified) return nouveau
    }

    throw new Error("Impossible de mettre à jour les statistiques.")
}

function detecterAppareil(userAgent = "") {
    const texte = userAgent.toLowerCase()
    if (/ipad|tablet/.test(texte)) return "Tablette"
    if (/mobi|android|iphone/.test(texte)) return "Téléphone"
    return "Ordinateur"
}

function ajouterValeur(objet, cle) {
    objet[cle] = Number(objet[cle] || 0) + 1
}

export default async (requete, contexte) => {
    try {
        if (requete.method === "GET") {
            return reponseJSON({ visites: await lireCompteur() })
        }

        if (requete.method !== "POST") {
            return reponseJSON({ erreur: "Méthode non autorisée" }, 405)
        }

        let retour = false
        try {
            const corps = await requete.json()
            retour = corps?.retour === true
        } catch (erreur) {
            // Corps vide accepté pour rester compatible avec l'ancienne version.
        }

        const geo = contexte?.geo || {}
        const pays = geo.country?.name || "Pays non déterminé"
        const region = geo.subdivision?.name || geo.city || "Région non déterminée"
        const cleRegion = `${pays} · ${region}`
        const appareil = detecterAppareil(requete.headers.get("user-agent") || "")

        const compteur = await incrementerJSON(
            cleCompteur,
            (donnees) => ({ visites: Number(donnees?.visites || 0) + 1 }),
            { visites: 0 }
        )

        await incrementerJSON(
            cleStatistiques,
            (donnees) => {
                donnees.visites = Number(donnees.visites || 0) + 1
                donnees.premieres_visites = Number(donnees.premieres_visites || 0) + (retour ? 0 : 1)
                donnees.retours = Number(donnees.retours || 0) + (retour ? 1 : 0)
                donnees.regions ||= {}
                donnees.appareils ||= {}
                ajouterValeur(donnees.regions, cleRegion)
                ajouterValeur(donnees.appareils, appareil)
                donnees.derniere_mise_a_jour = new Date().toISOString()
                return donnees
            },
            {
                visites: 0,
                premieres_visites: 0,
                retours: 0,
                regions: {},
                appareils: {}
            }
        )

        return reponseJSON({ visites: compteur.visites })
    } catch (erreur) {
        console.error("Erreur compteur de visites :", erreur)
        return reponseJSON({ erreur: "Compteur temporairement indisponible" }, 500)
    }
}

export const config = {
    path: "/.netlify/functions/visites",
    rateLimit: {
        windowLimit: 30,
        windowSize: 60,
        aggregateBy: ["ip", "domain"]
    }
}
