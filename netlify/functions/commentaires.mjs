function reponseJSON(donnees, statut = 200) {
    return new Response(JSON.stringify(donnees), {
        status: statut,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    })
}

export default async (requete) => {
    if (requete.method !== "POST") {
        return reponseJSON({ erreur: "Méthode non autorisée" }, 405)
    }

    const url = process.env.SUPABASE_URL
    const cle = process.env.SUPABASE_PUBLISHABLE_KEY

    if (!url || !cle) {
        return reponseJSON({ erreur: "Configuration commentaires indisponible" }, 503)
    }

    try {
        const donnees = await requete.json()
        const nom = String(donnees.nom || "").trim()
        const message = String(donnees.message || "").trim()
        const site = String(donnees.site || "").trim()

        // Champ invisible anti-robot : un humain normal le laisse vide.
        if (site) return reponseJSON({ succes: true }, 201)

        if (nom.length < 2 || nom.length > 80 || message.length < 5 || message.length > 1000) {
            return reponseJSON({ erreur: "Commentaire invalide" }, 400)
        }

        const reponse = await fetch(`${url}/rest/v1/commentaires`, {
            method: "POST",
            headers: {
                apikey: cle,
                "Content-Type": "application/json",
                Prefer: "return=minimal"
            },
            body: JSON.stringify({
                nom,
                message,
                statut: "en_attente"
            })
        })

        if (!reponse.ok) {
            throw new Error("Insertion impossible")
        }

        return reponseJSON({ succes: true }, 201)
    } catch (erreur) {
        console.error("Erreur commentaire :", erreur)
        return reponseJSON({ erreur: "Commentaire temporairement indisponible" }, 500)
    }
}

export const config = {
    path: "/.netlify/functions/commentaires",
    rateLimit: {
        windowLimit: 5,
        windowSize: 3600,
        aggregateBy: ["ip", "domain"]
    }
}
