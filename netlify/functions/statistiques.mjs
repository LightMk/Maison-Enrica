import { getStore } from "@netlify/blobs"

const stockage = getStore("statistiques-maison-enrica")

function reponseJSON(donnees, statut = 200) {
    return new Response(JSON.stringify(donnees), {
        status: statut,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    })
}

async function utilisateurAutorise(requete) {
    const url = process.env.SUPABASE_URL
    const cle = process.env.SUPABASE_SECRET_KEY
    const autorisation = requete.headers.get("authorization") || ""

    if (!url || !cle || !autorisation.startsWith("Bearer ")) return false

    const jeton = autorisation.slice(7)

    const reponseUtilisateur = await fetch(`${url}/auth/v1/user`, {
        headers: {
            apikey: cle,
            Authorization: `Bearer ${jeton}`
        }
    })

    if (!reponseUtilisateur.ok) return false
    const utilisateur = await reponseUtilisateur.json()
    if (!utilisateur?.id) return false

    const reponseRole = await fetch(`${url}/rest/v1/administrateurs?id=eq.${encodeURIComponent(utilisateur.id)}&select=role`, {
        headers: {
            apikey: cle,
            Authorization: `Bearer ${jeton}`,
            Accept: "application/json"
        }
    })

    if (!reponseRole.ok) return false
    const roles = await reponseRole.json()
    return roles.some((ligne) => ligne.role === "admin" || ligne.role === "redacteur")
}

export default async (requete) => {
    if (requete.method !== "GET") {
        return reponseJSON({ erreur: "Méthode non autorisée" }, 405)
    }

    try {
        if (!(await utilisateurAutorise(requete))) {
            return reponseJSON({ erreur: "Accès non autorisé" }, 401)
        }

        const [statistiques, compteur] = await Promise.all([
            stockage.get("visites-statistiques", { consistency: "strong", type: "json" }),
            stockage.get("visites-site", { consistency: "strong", type: "json" })
        ])

        const resultat = statistiques || {
            premieres_visites: 0,
            retours: 0,
            regions: {},
            appareils: {}
        }

        resultat.visites = Number(compteur?.visites || 0)
        return reponseJSON(resultat)
    } catch (erreur) {
        console.error("Erreur statistiques :", erreur)
        return reponseJSON({ erreur: "Statistiques temporairement indisponibles" }, 500)
    }
}

export const config = {
    path: "/.netlify/functions/statistiques",
    rateLimit: {
        windowLimit: 30,
        windowSize: 60,
        aggregateBy: ["ip", "domain"]
    }
}
