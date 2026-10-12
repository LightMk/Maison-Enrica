import {
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    configurationSupabaseValide
} from "./supabase-config.js"

/* ==========================================================
   CONTENUS DYNAMIQUES PUBLICS
   - actualités
   - événements
   - besoins actuels
   - centre de notifications interne
   Les contenus restent lisibles sans JavaScript : les zones
   dynamiques affichent alors simplement leur message d'attente.
   ========================================================== */

const configurationActive = configurationSupabaseValide()

async function lireTable(nomTable, requete) {
    if (!configurationActive) return []

    const reponse = await fetch(`${SUPABASE_URL}/rest/v1/${nomTable}?${requete}`, {
        headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Accept: "application/json"
        }
    })

    if (!reponse.ok) {
        throw new Error(`Lecture impossible : ${nomTable}`)
    }

    return reponse.json()
}

function formaterDate(dateTexte) {
    if (!dateTexte) return ""

    const date = new Date(dateTexte)
    if (Number.isNaN(date.getTime())) return ""

    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })
}

function creerBoutonPartage(titre, url, reseau) {
    const lien = document.createElement("a")
    const adresse = encodeURIComponent(url)
    const texte = encodeURIComponent(titre)

    lien.className = "partage-contenu"
    lien.target = "_blank"
    lien.rel = "noopener noreferrer"

    if (reseau === "whatsapp") {
        lien.href = `https://wa.me/?text=${texte}%20${adresse}`
        lien.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>WhatsApp</span>'
        lien.setAttribute("aria-label", `Partager « ${titre} » sur WhatsApp`)
    } else {
        lien.href = `https://www.facebook.com/sharer/sharer.php?u=${adresse}`
        lien.innerHTML = '<i class="fa-brands fa-facebook-f" aria-hidden="true"></i><span>Facebook</span>'
        lien.setAttribute("aria-label", `Partager « ${titre} » sur Facebook`)
    }

    return lien
}

function ajouterPartage(conteneur, titre, ancre) {
    const zone = document.createElement("div")
    const url = `${window.location.origin}${window.location.pathname}${ancre}`

    zone.className = "partage-ligne"
    zone.append(
        creerBoutonPartage(titre, url, "whatsapp"),
        creerBoutonPartage(titre, url, "facebook")
    )
    conteneur.append(zone)
}

function afficherActualites(actualites) {
    const liste = document.querySelector("#liste-actualites")
    if (!liste) return

    liste.replaceChildren()

    if (!actualites.length) {
        liste.innerHTML = '<p class="contenu-vide">Aucune actualité publiée pour le moment.</p>'
        return
    }

    actualites.forEach((actualite) => {
        const article = document.createElement("article")
        const identifiant = `actualite-${actualite.id}`
        article.className = "carte-dynamique actualite-carte"
        article.id = identifiant

        if (actualite.image_url) {
            const image = creerImage(actualite.image_url, actualite.titre)
            image.className = "contenu-image"
            article.append(image)
        }

        const meta = document.createElement("p")
        meta.className = "contenu-meta"
        meta.textContent = formaterDate(actualite.created_at)

        const titre = document.createElement("h3")
        titre.textContent = actualite.titre

        const contenu = document.createElement("p")
        contenu.className = "contenu-texte"
        contenu.textContent = actualite.contenu

        article.append(meta, titre, contenu)

        if (actualite.source_url) {
            const source = document.createElement("a")
            source.className = "lien-source"
            source.href = actualite.source_url
            source.target = "_blank"
            source.rel = "noopener noreferrer"
            source.textContent = "Voir la publication d’origine"
            article.append(source)
        }

        ajouterPartage(article, actualite.titre, `#${identifiant}`)
        liste.append(article)
    })
}

function telechargerCalendrier(evenement) {
    const debut = new Date(evenement.date_debut)
    const fin = evenement.date_fin ? new Date(evenement.date_fin) : new Date(debut.getTime() + 60 * 60 * 1000)

    function formatICS(date) {
        return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
    }

    const contenu = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Maison Enrica//Evenement//FR",
        "BEGIN:VEVENT",
        `UID:${evenement.id}@maisonenrica.org`,
        `DTSTAMP:${formatICS(new Date())}`,
        `DTSTART:${formatICS(debut)}`,
        `DTEND:${formatICS(fin)}`,
        `SUMMARY:${(evenement.titre || "Événement Maison Enrica").replace(/[,;]/g, " ")}`,
        `DESCRIPTION:${(evenement.description || "").replace(/\n/g, " ").replace(/[,;]/g, " ")}`,
        `LOCATION:${(evenement.lieu || "").replace(/[,;]/g, " ")}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n")

    const fichier = new Blob([contenu], { type: "text/calendar;charset=utf-8" })
    const lien = document.createElement("a")
    lien.href = URL.createObjectURL(fichier)
    lien.download = "evenement-maison-enrica.ics"
    lien.click()
    URL.revokeObjectURL(lien.href)
}

function afficherEvenements(evenements) {
    const liste = document.querySelector("#liste-evenements")
    if (!liste) return

    liste.replaceChildren()

    if (!evenements.length) {
        liste.innerHTML = '<p class="contenu-vide">Aucun événement publié pour le moment.</p>'
        return
    }

    evenements.forEach((evenement) => {
        const article = document.createElement("article")
        const identifiant = `evenement-${evenement.id}`
        article.className = "carte-dynamique evenement-carte"
        article.id = identifiant

        if (evenement.image_url) {
            const image = creerImage(evenement.image_url, evenement.titre)
            image.className = "contenu-image"
            article.append(image)
        }

        const date = document.createElement("p")
        date.className = "contenu-meta"
        date.textContent = formaterDate(evenement.date_debut)

        const titre = document.createElement("h3")
        titre.textContent = evenement.titre

        const description = document.createElement("p")
        description.className = "contenu-texte"
        description.textContent = evenement.description

        article.append(date, titre, description)

        if (evenement.lieu) {
            const lieu = document.createElement("p")
            lieu.className = "contenu-lieu"
            lieu.innerHTML = '<i class="fa-solid fa-location-dot" aria-hidden="true"></i>'
            lieu.append(document.createTextNode(` ${evenement.lieu}`))
            article.append(lieu)
        }

        const calendrier = document.createElement("button")
        calendrier.className = "bouton-calendrier"
        calendrier.type = "button"
        calendrier.innerHTML = '<i class="fa-regular fa-calendar-plus" aria-hidden="true"></i> Ajouter à mon calendrier'
        calendrier.addEventListener("click", () => telechargerCalendrier(evenement))
        article.append(calendrier)

        ajouterPartage(article, evenement.titre, `#${identifiant}`)
        liste.append(article)
    })
}

function afficherBesoins(besoins) {
    const liste = document.querySelector("#liste-besoins")
    if (!liste) return

    liste.replaceChildren()

    if (!besoins.length) {
        liste.innerHTML = '<p class="contenu-vide">Les besoins actuels seront publiés ici après validation par les responsables.</p>'
        return
    }

    besoins.forEach((besoin) => {
        const article = document.createElement("article")
        const identifiant = `besoin-${besoin.id}`
        article.className = `carte-dynamique besoin-carte priorite-${besoin.priorite}`
        article.id = identifiant

        const priorite = document.createElement("span")
        priorite.className = "priorite-besoin"
        priorite.textContent = besoin.priorite === "urgente"
            ? "Besoin urgent"
            : besoin.priorite === "importante" ? "Priorité importante" : "Besoin actuel"

        const titre = document.createElement("h3")
        titre.textContent = besoin.titre

        const description = document.createElement("p")
        description.className = "contenu-texte"
        description.textContent = besoin.description

        const contribuer = document.createElement("a")
        contribuer.className = "btn besoin-action"
        contribuer.href = `contact/contact.html?objet=${encodeURIComponent(`Contribution : ${besoin.titre}`)}#form-contact`
        contribuer.textContent = "Je souhaite contribuer"

        article.append(priorite, titre, description, contribuer)
        ajouterPartage(article, besoin.titre, `#${identifiant}`)
        liste.append(article)
    })
}

function lireNotificationsVues() {
    try {
        return new Set(JSON.parse(localStorage.getItem("maison-enrica-notifications-vues") || "[]"))
    } catch (erreur) {
        return new Set()
    }
}

function memoriserNotificationsVues(ids) {
    try {
        localStorage.setItem("maison-enrica-notifications-vues", JSON.stringify(ids))
    } catch (erreur) {
        // Le centre reste utilisable si le stockage local est indisponible.
    }
}

function creerCentreNotifications(notifications) {
    if (document.querySelector("#centre-notifications")) return

    const vues = lireNotificationsVues()
    const nouvelles = notifications.filter((notification) => !vues.has(notification.id))

    const centre = document.createElement("div")
    centre.className = "centre-notifications"
    centre.id = "centre-notifications"
    centre.innerHTML = `
        <button class="notifications-bouton" type="button" aria-expanded="false" aria-controls="notifications-panneau" aria-label="Ouvrir les notifications">
            <i class="fa-regular fa-bell" aria-hidden="true"></i>
            <span class="notifications-badge" ${nouvelles.length ? "" : "hidden"}>${nouvelles.length}</span>
        </button>
        <section class="notifications-panneau" id="notifications-panneau" hidden aria-labelledby="notifications-titre">
            <div class="notifications-entete">
                <div>
                    <span class="mini-insigne">Maison Enrica</span>
                    <h2 id="notifications-titre">À ne pas manquer</h2>
                </div>
                <button class="notifications-fermer" type="button" aria-label="Fermer les notifications"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
            </div>
            <div class="notifications-liste"></div>
        </section>
    `

    document.body.append(centre)

    const bouton = centre.querySelector(".notifications-bouton")
    const panneau = centre.querySelector(".notifications-panneau")
    const fermer = centre.querySelector(".notifications-fermer")
    const liste = centre.querySelector(".notifications-liste")
    const badge = centre.querySelector(".notifications-badge")

    if (!notifications.length) {
        liste.innerHTML = '<p class="notifications-vide">Aucune nouvelle information pour le moment.</p>'
    } else {
        notifications.slice(0, 8).forEach((notification) => {
            const lien = document.createElement("a")
            lien.className = "notification-item"
            lien.href = notification.url
            lien.innerHTML = `
                <span class="notification-icone"><i class="${notification.icone}" aria-hidden="true"></i></span>
                <span><small>${notification.categorie}</small><strong></strong></span>
            `
            lien.querySelector("strong").textContent = notification.titre
            liste.append(lien)
        })
    }

    function ouvrirPanneau() {
        panneau.hidden = false
        bouton.setAttribute("aria-expanded", "true")
        badge.hidden = true
        memoriserNotificationsVues(notifications.map((notification) => notification.id))
    }

    function fermerPanneau() {
        panneau.hidden = true
        bouton.setAttribute("aria-expanded", "false")
        bouton.focus()
    }

    bouton.addEventListener("click", () => {
        if (panneau.hidden) ouvrirPanneau()
        else fermerPanneau()
    })

    fermer.addEventListener("click", fermerPanneau)
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !panneau.hidden) fermerPanneau()
    })
}

function creerNotifications(actualites, evenements, besoins) {
    const notifications = []

    actualites.forEach((item) => notifications.push({
        id: `actualite-${item.id}`,
        categorie: "Actualité",
        titre: item.titre,
        icone: "fa-regular fa-newspaper",
        url: `/#actualite-${item.id}`
    }))

    evenements.forEach((item) => notifications.push({
        id: `evenement-${item.id}`,
        categorie: "Événement",
        titre: item.titre,
        icone: "fa-regular fa-calendar",
        url: `/#evenement-${item.id}`
    }))

    besoins.filter((item) => item.priorite === "urgente" || item.priorite === "importante").forEach((item) => notifications.push({
        id: `besoin-${item.id}`,
        categorie: item.priorite === "urgente" ? "Besoin urgent" : "Besoin",
        titre: item.titre,
        icone: "fa-solid fa-hand-holding-heart",
        url: `/#besoin-${item.id}`
    }))

    return notifications
}

async function chargerContenusDynamiques() {
    if (!configurationActive) {
        afficherActualites([])
        afficherEvenements([])
        afficherBesoins([])
        creerCentreNotifications([])
        return
    }

    try {
        const [actualites, evenements, besoins] = await Promise.all([
            lireTable("actualites", "select=id,titre,contenu,source_url,image_url,created_at&statut=eq.publie&order=created_at.desc&limit=6"),
            lireTable("evenements", "select=id,titre,description,date_debut,date_fin,lieu,image_url&statut=eq.publie&order=date_debut.asc&limit=6"),
            lireTable("besoins", "select=id,titre,description,priorite,created_at&statut=eq.actif&order=created_at.desc&limit=6")
        ])

        afficherActualites(actualites)
        afficherEvenements(evenements)
        afficherBesoins(besoins)
        creerCentreNotifications(creerNotifications(actualites, evenements, besoins))
    } catch (erreur) {
        afficherActualites([])
        afficherEvenements([])
        afficherBesoins([])
        creerCentreNotifications([])
        console.error("Contenus dynamiques Maison Enrica indisponibles :", erreur)
    }
}

chargerContenusDynamiques()

// ==========================================================
// COMMENTAIRES PUBLICS MODÉRÉS
// ==========================================================
function afficherCommentaires(commentaires) {
    const liste = document.querySelector("#liste-commentaires")
    if (!liste) return

    liste.replaceChildren()

    if (!commentaires.length) {
        liste.innerHTML = '<p class="contenu-vide">Aucun commentaire publié pour le moment.</p>'
        return
    }

    commentaires.forEach((commentaire) => {
        const article = document.createElement("article")
        article.className = "commentaire-carte"

        const nom = document.createElement("strong")
        nom.textContent = commentaire.nom

        const date = document.createElement("time")
        date.dateTime = commentaire.created_at
        date.textContent = formaterDate(commentaire.created_at)

        const message = document.createElement("p")
        message.textContent = commentaire.message

        article.append(nom, date, message)
        liste.append(article)
    })
}

async function chargerCommentaires() {
    if (!document.querySelector("#liste-commentaires")) return

    if (!configurationActive) {
        afficherCommentaires([])
        return
    }

    try {
        const commentaires = await lireTable(
            "commentaires",
            "select=id,nom,message,created_at&statut=eq.publie&order=created_at.desc&limit=12"
        )
        afficherCommentaires(commentaires)
    } catch (erreur) {
        afficherCommentaires([])
    }
}

const formulaireCommentaire = document.querySelector("#commentaire-formulaire")

formulaireCommentaire?.addEventListener("submit", async (event) => {
    event.preventDefault()

    const statut = document.querySelector("#commentaire-statut")
    const bouton = formulaireCommentaire.querySelector('button[type="submit"]')
    const donnees = new FormData(formulaireCommentaire)

    bouton.disabled = true
    statut.textContent = "Envoi en cours…"

    try {
        const reponse = await fetch("/.netlify/functions/commentaires", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                nom: donnees.get("nom"),
                message: donnees.get("message"),
                site: donnees.get("site")
            })
        })

        if (!reponse.ok) throw new Error("Envoi impossible")

        formulaireCommentaire.reset()
        statut.textContent = "Merci. Votre commentaire sera visible après validation par Maison Enrica."
    } catch (erreur) {
        statut.textContent = "Le commentaire n’a pas pu être envoyé pour le moment."
    } finally {
        bouton.disabled = false
    }
})

chargerCommentaires()



// ==========================================================
// CONTENUS ADMINISTRABLES DU SITE
// Les contenus historiques restent visibles en secours.
// Ils sont remplacés uniquement si Supabase renvoie une liste publiée.
// ==========================================================
function creerImage(url, alt) {
    const image = document.createElement("img")
    image.src = url
    image.alt = alt
    image.loading = "lazy"
    image.decoding = "async"
    return image
}

function afficherProjetsAdministrables(projets) {
    const dynamique = document.querySelector("#projets-dynamiques")
    const statique = document.querySelector("#projets-statiques")
    if (!dynamique) return

    dynamique.replaceChildren()
    statique?.setAttribute("hidden", "")
    dynamique.hidden = false

    if (!projets.length) {
        dynamique.innerHTML = '<p class="contenu-vide">Aucun projet publié pour le moment.</p>'
        return
    }

    projets.forEach((projet, index) => {
        const ligne = document.createElement("article")
        ligne.className = index % 2 === 0 ? "flex1 reverse projet-admin-public" : "flex1 projet-admin-public"

        const texte = document.createElement("div")
        texte.className = "chantier"

        const badge = document.createElement("span")
        badge.className = "insigne"
        badge.textContent = projet.badge || "Projet Maison Enrica"

        const titre = document.createElement("h3")
        titre.textContent = projet.titre

        const description = document.createElement("p")
        description.textContent = projet.description

        const action = document.createElement("a")
        action.className = "btn"
        action.href = `../contact/contact.html?objet=${encodeURIComponent("Devenir donateur")}#form-contact`
        action.textContent = "Soutenir ce projet"

        const imageZone = document.createElement("div")
        if (projet.image_url) imageZone.append(creerImage(projet.image_url, projet.titre))

        texte.append(badge, titre, description, action)
        if (index % 2 === 0) ligne.append(texte, imageZone)
        else ligne.append(imageZone, texte)
        dynamique.append(ligne)
    })

 }

function afficherRealisationsAdministrables(realisations) {
    const dynamique = document.querySelector("#realisations-dynamiques")
    const statique = document.querySelector("#realisations-statiques")
    if (!dynamique) return

    dynamique.replaceChildren()
    statique?.setAttribute("hidden", "")
    dynamique.hidden = false

    if (!realisations.length) {
        dynamique.innerHTML = '<p class="contenu-vide">Aucune réalisation publiée pour le moment.</p>'
        return
    }

    realisations.forEach((realisation) => {
        const carte = document.createElement("article")
        carte.className = "card-realisation"

        const badge = document.createElement("span")
        badge.className = "insigne"
        badge.textContent = realisation.badge || "Réalisation"

        if (realisation.media_url) {
            if (realisation.media_type === "video") {
                const video = document.createElement("video")
                video.controls = true
                video.playsInline = true
                video.preload = "none"
                video.src = realisation.media_url
                if (realisation.poster_url) video.poster = realisation.poster_url
                video.setAttribute("aria-label", realisation.titre)
                carte.append(video)
            } else {
                carte.append(creerImage(realisation.media_url, realisation.titre))
            }
        }

        const titre = document.createElement("h3")
        titre.textContent = realisation.titre
        const description = document.createElement("p")
        description.textContent = realisation.description

        carte.prepend(badge)
        carte.append(titre, description)
        dynamique.append(carte)
    })

 }

function afficherPartenairesAdministrables(partenaires) {
    const dynamique = document.querySelector("#partenaires-dynamiques")
    const statique = document.querySelector("#partenaires-statiques")
    if (!dynamique) return

    dynamique.replaceChildren()
    statique?.setAttribute("hidden", "")
    dynamique.hidden = false

    if (!partenaires.length) {
        dynamique.innerHTML = '<p class="contenu-vide">Aucun partenaire publié pour le moment.</p>'
        return
    }
    partenaires.forEach((partenaire) => {
        const carte = document.createElement("article")
        carte.className = "cardI partenaire-admin-public"

        const image = creerImage(partenaire.logo_url, `Logo de ${partenaire.nom}`)
        if (partenaire.site_url) {
            const lien = document.createElement("a")
            lien.href = partenaire.site_url
            lien.target = "_blank"
            lien.rel = "noopener noreferrer"
            lien.setAttribute("aria-label", `Visiter le site de ${partenaire.nom}`)
            lien.append(image)
            carte.append(lien)
        } else {
            carte.append(image)
        }
        dynamique.append(carte)
    })

 }

function afficherResponsablesAdministrables(responsables) {
    const dynamique = document.querySelector("#responsables-dynamiques")
    const statique = document.querySelector("#responsables-statiques")
    if (!dynamique) return

    dynamique.replaceChildren()
    statique?.setAttribute("hidden", "")
    dynamique.hidden = false

    if (!responsables.length) {
        dynamique.innerHTML = '<p class="contenu-vide">Aucun responsable publié pour le moment.</p>'
        return
    }
    responsables.forEach((responsable) => {
        const carte = document.createElement("article")
        carte.className = "cardI"

        if (responsable.photo_url) carte.append(creerImage(responsable.photo_url, responsable.nom))

        const nom = document.createElement("h3")
        nom.textContent = responsable.nom
        const fonction = document.createElement("p")
        fonction.textContent = responsable.fonction
        carte.append(nom, fonction)

        if (responsable.description) {
            const description = document.createElement("small")
            description.textContent = responsable.description
            carte.append(description)
        }
        dynamique.append(carte)
    })

 }

async function chargerContenusAdministrables() {
    if (!configurationActive) return

    try {
        const demandes = []
        const cibles = []

        if (document.querySelector("#projets-dynamiques")) {
            demandes.push(lireTable("projets_site", "select=id,titre,description,badge,image_url,ordre&statut=eq.publie&order=ordre.asc"))
            cibles.push("projets")
        }
        if (document.querySelector("#realisations-dynamiques")) {
            demandes.push(lireTable("realisations_site", "select=id,titre,description,badge,media_type,media_url,poster_url,ordre&statut=eq.publie&order=ordre.asc"))
            cibles.push("realisations")
        }
        if (document.querySelector("#partenaires-dynamiques")) {
            demandes.push(lireTable("partenaires_site", "select=id,nom,logo_url,site_url,ordre&statut=eq.publie&order=ordre.asc"))
            cibles.push("partenaires")
        }
        if (document.querySelector("#responsables-dynamiques")) {
            demandes.push(lireTable("responsables_site", "select=id,nom,fonction,description,photo_url,ordre&statut=eq.publie&order=ordre.asc"))
            cibles.push("responsables")
        }

        const resultats = await Promise.all(demandes)
        resultats.forEach((donnees, index) => {
            const cible = cibles[index]
            if (cible === "projets") afficherProjetsAdministrables(donnees)
            if (cible === "realisations") afficherRealisationsAdministrables(donnees)
            if (cible === "partenaires") afficherPartenairesAdministrables(donnees)
            if (cible === "responsables") afficherResponsablesAdministrables(donnees)
        })
    } catch (erreur) {
        console.warn("Les contenus administrables utilisent temporairement leur version statique.", erreur)
    }
}

chargerContenusAdministrables()
