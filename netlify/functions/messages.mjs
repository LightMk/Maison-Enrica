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
    const cleSecrete = process.env.SUPABASE_SECRET_KEY

    // La clé secrète reste uniquement dans les variables Netlify.
    // Elle ne doit jamais être placée dans le JavaScript public.
    if (!url || !cleSecrete) {
        return reponseJSON({ erreur: "Réception interne non configurée" }, 503)
    }

    try {
        const donnees = await requete.json()
        const nom = String(donnees.nom || "").trim()
        const contact = String(donnees.contact || "").trim()
        const objet = String(donnees.objet || "").trim()
        const message = String(donnees.message || "").trim()
        const canal = ["whatsapp", "email", "site"].includes(donnees.canal) ? donnees.canal : "site"
        const site = String(donnees.site || "").trim()

        // Champ invisible anti-robot.
        if (site) return reponseJSON({ succes: true }, 201)

        if (
            nom.length < 2 || nom.length > 100 ||
            contact.length < 3 || contact.length > 120 ||
            objet.length < 2 || objet.length > 160 ||
            message.length < 5 || message.length > 2000
        ) {
            return reponseJSON({ erreur: "Message invalide" }, 400)
        }

        const reponse = await fetch(`${url}/rest/v1/messages_contact`, {
            method: "POST",
            headers: {
                apikey: cleSecrete,
                Authorization: `Bearer ${cleSecrete}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal"
            },
            body: JSON.stringify({
                nom,
                contact,
                objet,
                message,
                canal,
                statut: "nouveau"
            })
        })

        if (!reponse.ok) throw new Error("Insertion impossible")
        return reponseJSON({ succes: true }, 201)
    } catch (erreur) {
        console.error("Erreur message contact :", erreur)
        return reponseJSON({ erreur: "Réception interne temporairement indisponible" }, 500)
    }
}

export const config = {
    path: "/.netlify/functions/messages",
    rateLimit: {
        windowLimit: 5,
        windowSize: 3600,
        aggregateBy: ["ip", "domain"]
    }
}
