import { getStore } from "@netlify/blobs"

// AJOUT : compteur persistant stocké côté serveur avec Netlify Blobs.
// Le navigateur ne peut donc pas inventer ou modifier directement le total.
const stockage = getStore("statistiques-maison-enrica")
const cleCompteur = "visites-site"

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

async function incrementerCompteur() {
    // Les écritures conditionnelles évitent au maximum que deux visites
    // simultanées écrasent le même compteur.
    for (let tentative = 0; tentative < 5; tentative++) {
        const entree = await stockage.getWithMetadata(cleCompteur, {
            consistency: "strong",
            type: "json"
        })

        if (entree === null) {
            const creation = await stockage.setJSON(
                cleCompteur,
                { visites: 1 },
                { onlyIfNew: true }
            )

            if (creation.modified) {
                return 1
            }

            continue
        }

        const totalActuel = Number(entree.data?.visites || 0)
        const nouveauTotal = totalActuel + 1

        const miseAJour = await stockage.setJSON(
            cleCompteur,
            { visites: nouveauTotal },
            { onlyIfMatch: entree.etag }
        )

        if (miseAJour.modified) {
            return nouveauTotal
        }
    }

    throw new Error("Impossible de mettre à jour le compteur après plusieurs tentatives.")
}

export default async (requete) => {
    try {
        if (requete.method === "GET") {
            return reponseJSON({ visites: await lireCompteur() })
        }

        if (requete.method === "POST") {
            return reponseJSON({ visites: await incrementerCompteur() })
        }

        return reponseJSON({ erreur: "Méthode non autorisée" }, 405)
    } catch (erreur) {
        console.error("Erreur compteur de visites :", erreur)
        return reponseJSON({ erreur: "Compteur temporairement indisponible" }, 500)
    }
}
