import {
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    configurationSupabaseValide
} from "./config.js"

/* ==========================================================
   ADMINISTRATION MAISON ENRICA
   Syntaxe volontairement simple, variables en français et
   fonctions séparées pour faciliter la compréhension.
   ========================================================== */

const element = id => document.getElementById(id)

const connexion = element("login-panel")
const tableauDeBord = element("dashboard")
const formulaireConnexion = element("login-form")
const navigation = element("admin-navigation")
const boutonDeconnexion = element("logout-button")
const boutonMenu = element("menu-admin")
const barreLaterale = element("admin-sidebar")

let supabase = null
let utilisateurConnecte = null

function afficherMessageConnexion(message, type = "neutre") {
    const zone = element("login-message")
    if (!zone) return

    zone.textContent = message
    zone.classList.toggle("erreur", type === "erreur")
    zone.classList.toggle("succes", type === "succes")
}

async function chargerClientSupabase() {
    const sources = [
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm",
        "https://esm.sh/@supabase/supabase-js@2.57.0"
    ]

    for (const source of sources) {
        try {
            const moduleSupabase = await import(source)
            if (typeof moduleSupabase.createClient === "function") return moduleSupabase.createClient
        } catch (erreur) {
            console.warn("Chargement Supabase impossible depuis :", source, erreur)
        }
    }

    throw new Error("Le module Supabase n'a pas pu être chargé. Vérifiez la connexion internet puis rechargez la page.")
}

function afficherMessage(message, erreur = false) {
    const zone = element("status-message")
    zone.textContent = message
    zone.classList.toggle("erreur", erreur)
    zone.hidden = false

    window.setTimeout(() => {
        zone.hidden = true
    }, 4500)
}

function afficherConnexion() {
    utilisateurConnecte = null
    connexion.hidden = false
    tableauDeBord.hidden = true
    navigation.hidden = true
    boutonDeconnexion.hidden = true
}

function afficherAdministration(utilisateur) {
    utilisateurConnecte = utilisateur
    connexion.hidden = true
    tableauDeBord.hidden = false
    navigation.hidden = false
    boutonDeconnexion.hidden = false
    element("account-label").textContent = utilisateur.email || "Compte autorisé"
}

async function verifierAdministrateur(utilisateur) {
    const resultat = await supabase
        .from("administrateurs")
        .select("role")
        .eq("id", utilisateur.id)
        .maybeSingle()

    if (resultat.error) throw resultat.error
    return resultat.data?.role === "admin"
}

function changerVue(idVue, bouton) {
    document.querySelectorAll(".vue-admin").forEach((vue) => {
        vue.hidden = vue.id !== idVue
        vue.classList.toggle("active", vue.id === idVue)
    })

    document.querySelectorAll(".onglet").forEach((onglet) => {
        onglet.classList.toggle("actif", onglet === bouton)
    })

    const noms = {
        "vue-dashboard": "Vue d’ensemble",
        "vue-actualites": "Actualités",
        "vue-evenements": "Événements",
        "vue-besoins": "Besoins du foyer",
        "vue-projets": "Projets",
        "vue-realisations": "Réalisations",
        "vue-partenaires": "Partenaires",
        "vue-responsables": "Responsables",
        "vue-messages": "Messages",
        "vue-infos": "Informations publiques",
        "vue-commentaires": "Commentaires",
        "vue-statistiques": "Visiteurs"
    }

    element("titre-vue").textContent = noms[idVue] || "Administration"
    barreLaterale.classList.remove("ouverte")
}

document.querySelectorAll(".onglet").forEach((bouton) => {
    bouton.addEventListener("click", () => {
        changerVue(bouton.dataset.cible, bouton)
    })
})

boutonMenu.addEventListener("click", () => {
    barreLaterale.classList.toggle("ouverte")
})

const boutonVoirMotDePasse = element("voir-mot-de-passe")
boutonVoirMotDePasse?.addEventListener("click", () => {
    const champ = element("password")
    const visible = champ.type === "text"
    champ.type = visible ? "password" : "text"
    boutonVoirMotDePasse.textContent = visible ? "Afficher" : "Masquer"
    boutonVoirMotDePasse.setAttribute("aria-label", visible ? "Afficher le mot de passe" : "Masquer le mot de passe")
})

function creerActions(modifier, supprimer) {
    const zone = document.createElement("div")
    zone.className = "element-admin-actions"

    const boutonModifier = document.createElement("button")
    boutonModifier.type = "button"
    boutonModifier.className = "secondaire"
    boutonModifier.textContent = "Modifier"
    boutonModifier.addEventListener("click", modifier)

    const boutonSupprimer = document.createElement("button")
    boutonSupprimer.type = "button"
    boutonSupprimer.className = "danger"
    boutonSupprimer.textContent = "Supprimer"
    boutonSupprimer.addEventListener("click", supprimer)

    zone.append(boutonModifier, boutonSupprimer)
    return zone
}

function texteVide(conteneur, message) {
    conteneur.replaceChildren()
    const texte = document.createElement("p")
    texte.className = "texte-secondaire"
    texte.textContent = message
    conteneur.append(texte)
}

// ----------------------------------------------------------
// ACTUALITÉS
// ----------------------------------------------------------
function reinitialiserActualite() {
    element("news-form").reset()
    element("news-id").value = ""
    element("news-editor-title").textContent = "Nouvelle actualité"
    element("news-save").textContent = "Enregistrer"
    element("news-cancel").hidden = true
}

async function chargerActualites() {
    const resultat = await supabase
        .from("actualites")
        .select("id,titre,contenu,source_url,statut,created_at")
        .order("created_at", { ascending: false })

    if (resultat.error) throw resultat.error

    const actualites = resultat.data || []
    element("news-count").textContent = String(actualites.length)
    const liste = element("news-list")
    liste.replaceChildren()

    if (!actualites.length) {
        texteVide(liste, "Aucune actualité enregistrée.")
        return
    }

    actualites.forEach((actualite) => {
        const article = document.createElement("article")
        article.className = "element-admin"

        const statut = document.createElement("small")
        statut.textContent = actualite.statut

        const titre = document.createElement("h3")
        titre.textContent = actualite.titre

        const contenu = document.createElement("p")
        contenu.textContent = actualite.contenu

        article.append(statut, titre, contenu)
        article.append(creerActions(
            () => {
                element("news-id").value = actualite.id
                element("news-title").value = actualite.titre
                element("news-content").value = actualite.contenu
                element("news-source").value = actualite.source_url || ""
                element("news-status").value = actualite.statut
                element("news-editor-title").textContent = "Modifier l’actualité"
                element("news-save").textContent = "Enregistrer les modifications"
                element("news-cancel").hidden = false
                element("news-title").focus()
            },
            async () => {
                if (!confirm(`Supprimer définitivement « ${actualite.titre} » ?`)) return
                const suppression = await supabase.from("actualites").delete().eq("id", actualite.id)
                if (suppression.error) return afficherMessage(suppression.error.message, true)
                reinitialiserActualite()
                await chargerActualites()
                afficherMessage("Actualité supprimée.")
            }
        ))
        liste.append(article)
    })
}

element("news-form").addEventListener("submit", async (event) => {
    event.preventDefault()

    const id = element("news-id").value
    const donnees = {
        titre: element("news-title").value.trim(),
        contenu: element("news-content").value.trim(),
        source_url: element("news-source").value.trim() || null,
        statut: element("news-status").value,
        updated_at: new Date().toISOString()
    }

    const resultat = id
        ? await supabase.from("actualites").update(donnees).eq("id", id)
        : await supabase.from("actualites").insert(donnees)

    if (resultat.error) return afficherMessage(`Enregistrement impossible : ${resultat.error.message}`, true)

    reinitialiserActualite()
    await chargerActualites()
    afficherMessage(id ? "Actualité modifiée." : "Actualité enregistrée.")
})

element("news-cancel").addEventListener("click", reinitialiserActualite)

// ----------------------------------------------------------
// ÉVÉNEMENTS
// ----------------------------------------------------------
function reinitialiserEvenement() {
    element("event-form").reset()
    element("event-id").value = ""
    element("event-editor-title").textContent = "Nouvel événement"
    element("event-save").textContent = "Enregistrer"
    element("event-cancel").hidden = true
}

function datePourChamp(dateTexte) {
    if (!dateTexte) return ""
    const date = new Date(dateTexte)
    const decalage = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - decalage).toISOString().slice(0, 16)
}

async function chargerEvenements() {
    const resultat = await supabase
        .from("evenements")
        .select("id,titre,description,date_debut,lieu,statut,created_at")
        .order("date_debut", { ascending: true })

    if (resultat.error) throw resultat.error

    const evenements = resultat.data || []
    element("events-count").textContent = String(evenements.length)
    const liste = element("event-list")
    liste.replaceChildren()

    if (!evenements.length) {
        texteVide(liste, "Aucun événement enregistré.")
        return
    }

    evenements.forEach((evenement) => {
        const article = document.createElement("article")
        article.className = "element-admin"
        article.innerHTML = `<small></small><h3></h3><p></p>`
        article.querySelector("small").textContent = `${evenement.statut} · ${new Date(evenement.date_debut).toLocaleDateString("fr-FR")}`
        article.querySelector("h3").textContent = evenement.titre
        article.querySelector("p").textContent = evenement.description

        article.append(creerActions(
            () => {
                element("event-id").value = evenement.id
                element("event-title").value = evenement.titre
                element("event-description").value = evenement.description
                element("event-date").value = datePourChamp(evenement.date_debut)
                element("event-location").value = evenement.lieu || ""
                element("event-status").value = evenement.statut
                element("event-editor-title").textContent = "Modifier l’événement"
                element("event-save").textContent = "Enregistrer les modifications"
                element("event-cancel").hidden = false
                element("event-title").focus()
            },
            async () => {
                if (!confirm(`Supprimer définitivement « ${evenement.titre} » ?`)) return
                const suppression = await supabase.from("evenements").delete().eq("id", evenement.id)
                if (suppression.error) return afficherMessage(suppression.error.message, true)
                reinitialiserEvenement()
                await chargerEvenements()
                afficherMessage("Événement supprimé.")
            }
        ))
        liste.append(article)
    })
}

element("event-form").addEventListener("submit", async (event) => {
    event.preventDefault()

    const id = element("event-id").value
    const donnees = {
        titre: element("event-title").value.trim(),
        description: element("event-description").value.trim(),
        date_debut: new Date(element("event-date").value).toISOString(),
        lieu: element("event-location").value.trim() || null,
        statut: element("event-status").value,
        updated_at: new Date().toISOString()
    }

    const resultat = id
        ? await supabase.from("evenements").update(donnees).eq("id", id)
        : await supabase.from("evenements").insert(donnees)

    if (resultat.error) return afficherMessage(`Enregistrement impossible : ${resultat.error.message}`, true)

    reinitialiserEvenement()
    await chargerEvenements()
    afficherMessage(id ? "Événement modifié." : "Événement enregistré.")
})

element("event-cancel").addEventListener("click", reinitialiserEvenement)

// ----------------------------------------------------------
// BESOINS
// ----------------------------------------------------------
function reinitialiserBesoin() {
    element("need-form").reset()
    element("need-id").value = ""
    element("need-editor-title").textContent = "Nouveau besoin"
    element("need-save").textContent = "Enregistrer"
    element("need-cancel").hidden = true
}

async function chargerBesoins() {
    const resultat = await supabase
        .from("besoins")
        .select("id,titre,description,priorite,statut,created_at")
        .order("created_at", { ascending: false })

    if (resultat.error) throw resultat.error

    const besoins = resultat.data || []
    element("needs-count").textContent = String(besoins.filter((besoin) => besoin.statut === "actif").length)
    const liste = element("need-list")
    liste.replaceChildren()

    if (!besoins.length) {
        texteVide(liste, "Aucun besoin enregistré.")
        return
    }

    besoins.forEach((besoin) => {
        const article = document.createElement("article")
        article.className = "element-admin"
        article.innerHTML = `<small></small><h3></h3><p></p>`
        article.querySelector("small").textContent = `${besoin.priorite} · ${besoin.statut}`
        article.querySelector("h3").textContent = besoin.titre
        article.querySelector("p").textContent = besoin.description

        article.append(creerActions(
            () => {
                element("need-id").value = besoin.id
                element("need-title").value = besoin.titre
                element("need-description").value = besoin.description
                element("need-priority").value = besoin.priorite
                element("need-status").value = besoin.statut
                element("need-editor-title").textContent = "Modifier le besoin"
                element("need-save").textContent = "Enregistrer les modifications"
                element("need-cancel").hidden = false
                element("need-title").focus()
            },
            async () => {
                if (!confirm(`Supprimer définitivement « ${besoin.titre} » ?`)) return
                const suppression = await supabase.from("besoins").delete().eq("id", besoin.id)
                if (suppression.error) return afficherMessage(suppression.error.message, true)
                reinitialiserBesoin()
                await chargerBesoins()
                afficherMessage("Besoin supprimé.")
            }
        ))
        liste.append(article)
    })
}

element("need-form").addEventListener("submit", async (event) => {
    event.preventDefault()

    const id = element("need-id").value
    const donnees = {
        titre: element("need-title").value.trim(),
        description: element("need-description").value.trim(),
        priorite: element("need-priority").value,
        statut: element("need-status").value,
        updated_at: new Date().toISOString()
    }

    const resultat = id
        ? await supabase.from("besoins").update(donnees).eq("id", id)
        : await supabase.from("besoins").insert(donnees)

    if (resultat.error) return afficherMessage(`Enregistrement impossible : ${resultat.error.message}`, true)

    reinitialiserBesoin()
    await chargerBesoins()
    afficherMessage(id ? "Besoin modifié." : "Besoin enregistré.")
})

element("need-cancel").addEventListener("click", reinitialiserBesoin)

// ----------------------------------------------------------
// INFORMATIONS PUBLIQUES
// ----------------------------------------------------------
async function chargerInformations() {
    const resultat = await supabase
        .from("informations_publiques")
        .select("cle,valeur,updated_at")
        .order("cle", { ascending: true })

    if (resultat.error) throw resultat.error

    const liste = element("info-list")
    liste.replaceChildren()

    if (!resultat.data?.length) {
        texteVide(liste, "Aucune information dynamique enregistrée.")
        return
    }

    resultat.data.forEach((information) => {
        const ligne = document.createElement("div")
        ligne.className = "ligne-info"

        const cle = document.createElement("strong")
        cle.textContent = information.cle

        const valeur = document.createElement("p")
        valeur.textContent = information.valeur

        const bouton = document.createElement("button")
        bouton.type = "button"
        bouton.className = "secondaire"
        bouton.textContent = "Modifier"
        bouton.addEventListener("click", () => {
            element("info-key").value = information.cle
            element("info-value").value = information.valeur
            element("info-key").focus()
        })

        ligne.append(cle, valeur, bouton)
        liste.append(ligne)
    })
}

element("info-form").addEventListener("submit", async (event) => {
    event.preventDefault()

    const donnees = {
        cle: element("info-key").value.trim(),
        valeur: element("info-value").value.trim(),
        updated_at: new Date().toISOString()
    }

    const resultat = await supabase
        .from("informations_publiques")
        .upsert(donnees, { onConflict: "cle" })

    if (resultat.error) return afficherMessage(`Enregistrement impossible : ${resultat.error.message}`, true)

    event.currentTarget.reset()
    await chargerInformations()
    afficherMessage("Information publique enregistrée.")
})


// ----------------------------------------------------------
// COMMENTAIRES : modération avant publication
// ----------------------------------------------------------
async function chargerCommentairesAdmin() {
    const resultat = await supabase
        .from("commentaires")
        .select("id,nom,message,statut,created_at")
        .order("created_at", { ascending: false })

    if (resultat.error) throw resultat.error

    const liste = element("comments-list")
    liste.replaceChildren()

    if (!resultat.data?.length) {
        texteVide(liste, "Aucun commentaire reçu.")
        return
    }

    resultat.data.forEach((commentaire) => {
        const article = document.createElement("article")
        article.className = "element-admin"

        const statut = document.createElement("small")
        statut.textContent = `${commentaire.statut} · ${new Date(commentaire.created_at).toLocaleDateString("fr-FR")}`

        const nom = document.createElement("h3")
        nom.textContent = commentaire.nom

        const message = document.createElement("p")
        message.textContent = commentaire.message

        const actions = document.createElement("div")
        actions.className = "element-admin-actions"

        const publier = document.createElement("button")
        publier.type = "button"
        publier.textContent = "Publier"
        publier.addEventListener("click", async () => {
            const resultatPublication = await supabase.from("commentaires").update({ statut: "publie" }).eq("id", commentaire.id)
            if (resultatPublication.error) return afficherMessage(resultatPublication.error.message, true)
            await chargerCommentairesAdmin()
            afficherMessage("Commentaire publié.")
        })

        const masquer = document.createElement("button")
        masquer.type = "button"
        masquer.className = "secondaire"
        masquer.textContent = "Masquer"
        masquer.addEventListener("click", async () => {
            const resultatMasquage = await supabase.from("commentaires").update({ statut: "masque" }).eq("id", commentaire.id)
            if (resultatMasquage.error) return afficherMessage(resultatMasquage.error.message, true)
            await chargerCommentairesAdmin()
            afficherMessage("Commentaire masqué.")
        })

        const supprimer = document.createElement("button")
        supprimer.type = "button"
        supprimer.className = "danger"
        supprimer.textContent = "Supprimer"
        supprimer.addEventListener("click", async () => {
            if (!confirm("Supprimer définitivement ce commentaire ?")) return
            const resultatSuppression = await supabase.from("commentaires").delete().eq("id", commentaire.id)
            if (resultatSuppression.error) return afficherMessage(resultatSuppression.error.message, true)
            await chargerCommentairesAdmin()
            afficherMessage("Commentaire supprimé.")
        })

        actions.append(publier, masquer, supprimer)
        article.append(statut, nom, message, actions)
        liste.append(article)
    })
}

element("comments-refresh").addEventListener("click", async () => {
    try {
        await chargerCommentairesAdmin()
        afficherMessage("Commentaires actualisés.")
    } catch (erreur) {
        afficherMessage(erreur.message, true)
    }
})

// ----------------------------------------------------------
// STATISTIQUES AGRÉGÉES
// ----------------------------------------------------------
function afficherClassement(conteneur, donnees) {
    conteneur.replaceChildren()
    const lignes = Object.entries(donnees || {}).sort((a, b) => b[1] - a[1]).slice(0, 10)

    if (!lignes.length) {
        texteVide(conteneur, "Aucune donnée pour le moment.")
        return
    }

    lignes.forEach(([nom, nombre]) => {
        const ligne = document.createElement("div")
        ligne.className = "stat-ligne"
        const libelle = document.createElement("span")
        libelle.textContent = nom
        const valeur = document.createElement("strong")
        valeur.textContent = Number(nombre).toLocaleString("fr-FR")
        ligne.append(libelle, valeur)
        conteneur.append(ligne)
    })
}

async function chargerStatistiques() {
    const session = await supabase.auth.getSession()
    const jeton = session.data.session?.access_token
    if (!jeton) return

    const reponse = await fetch("/.netlify/functions/statistiques", {
        headers: {
            Authorization: `Bearer ${jeton}`,
            Accept: "application/json"
        }
    })

    if (!reponse.ok) {
        throw new Error("Statistiques indisponibles")
    }

    const donnees = await reponse.json()
    element("stats-total").textContent = Number(donnees.visites || 0).toLocaleString("fr-FR")
    element("visits-count").textContent = Number(donnees.visites || 0).toLocaleString("fr-FR")
    element("stats-new").textContent = Number(donnees.premieres_visites || 0).toLocaleString("fr-FR")
    element("stats-returning").textContent = Number(donnees.retours || 0).toLocaleString("fr-FR")
    afficherClassement(element("stats-regions"), donnees.regions)
    afficherClassement(element("stats-devices"), donnees.appareils)
}

element("stats-refresh").addEventListener("click", async () => {
    try {
        await chargerStatistiques()
        afficherMessage("Statistiques actualisées.")
    } catch (erreur) {
        afficherMessage(erreur.message, true)
    }
})


// ----------------------------------------------------------
// CONTENUS ÉDITABLES : projets, réalisations, partenaires,
// responsables. Une seule logique est réutilisée pour garder
// le code lisible et éviter quatre systèmes concurrents.
// ----------------------------------------------------------
function creerSlug(texte) {
    return texte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
}

async function normaliserLogoPartenaire(fichier) {
    const image = await createImageBitmap(fichier)
    const largeur = 1200
    const hauteur = 760
    const marge = 90
    const canvas = document.createElement("canvas")
    canvas.width = largeur
    canvas.height = hauteur

    const contexte = canvas.getContext("2d")
    contexte.fillStyle = "#ffffff"
    contexte.fillRect(0, 0, largeur, hauteur)

    const ratio = Math.min(
        (largeur - marge * 2) / image.width,
        (hauteur - marge * 2) / image.height
    )
    const largeurLogo = image.width * ratio
    const hauteurLogo = image.height * ratio
    const x = (largeur - largeurLogo) / 2
    const y = (hauteur - hauteurLogo) / 2
    contexte.drawImage(image, x, y, largeurLogo, hauteurLogo)
    image.close()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.9))
    if (!blob) throw new Error("Le logo n'a pas pu être préparé.")
    return new File([blob], `logo-${Date.now()}.webp`, { type: "image/webp" })
}

async function televerserImage(fichier, dossier) {
    if (!fichier) return null

    if (!fichier.type.startsWith("image/")) {
        throw new Error("Le fichier choisi doit être une image.")
    }

    if (fichier.size > 2 * 1024 * 1024) {
        throw new Error("L'image dépasse la limite de 2 Mo.")
    }

    const extension = fichier.name.split(".").pop()?.toLowerCase() || "webp"
    const nom = `${dossier}/${Date.now()}-${crypto.randomUUID()}.${extension}`
    const envoi = await supabase.storage.from("medias-publics").upload(nom, fichier, {
        cacheControl: "31536000",
        upsert: false
    })

    if (envoi.error) throw envoi.error

    const publicUrl = supabase.storage.from("medias-publics").getPublicUrl(envoi.data.path)
    return publicUrl.data.publicUrl
}

const collectionsGerables = [
    {
        cle: "projets",
        table: "projets_site",
        formulaire: "project-form",
        liste: "project-list",
        annuler: "project-cancel",
        titreFormulaire: "project-editor-title",
        titreNouveau: "Nouveau projet",
        titreModification: "Modifier le projet",
        titrePrincipal: "project-title",
        fichier: "project-image",
        dossier: "projets",
        colonneFichier: "image_url",
        champs: [
            ["titre", "project-title"],
            ["badge", "project-badge"],
            ["description", "project-description"],
            ["image_url", "project-image-url"],
            ["statut", "project-status"],
            ["ordre", "project-order", "number"]
        ]
    },
    {
        cle: "realisations",
        table: "realisations_site",
        formulaire: "achievement-form",
        liste: "achievement-list",
        annuler: "achievement-cancel",
        titreFormulaire: "achievement-editor-title",
        titreNouveau: "Nouvelle réalisation",
        titreModification: "Modifier la réalisation",
        titrePrincipal: "achievement-title",
        fichier: "achievement-image",
        dossier: "realisations",
        colonneFichier: "media_url",
        champs: [
            ["titre", "achievement-title"],
            ["badge", "achievement-badge"],
            ["description", "achievement-description"],
            ["media_type", "achievement-type"],
            ["media_url", "achievement-media-url"],
            ["poster_url", "achievement-poster-url"],
            ["statut", "achievement-status"],
            ["ordre", "achievement-order", "number"]
        ]
    },
    {
        cle: "partenaires",
        table: "partenaires_site",
        formulaire: "partner-form",
        liste: "partner-list",
        annuler: "partner-cancel",
        titreFormulaire: "partner-editor-title",
        titreNouveau: "Nouveau partenaire",
        titreModification: "Modifier le partenaire",
        titrePrincipal: "partner-name",
        fichier: "partner-logo",
        dossier: "partenaires",
        colonneFichier: "logo_url",
        champs: [
            ["nom", "partner-name"],
            ["logo_url", "partner-logo-url"],
            ["site_url", "partner-site"],
            ["statut", "partner-status"],
            ["ordre", "partner-order", "number"]
        ]
    },
    {
        cle: "responsables",
        table: "responsables_site",
        formulaire: "manager-form",
        liste: "manager-list",
        annuler: "manager-cancel",
        titreFormulaire: "manager-editor-title",
        titreNouveau: "Nouveau responsable",
        titreModification: "Modifier le responsable",
        titrePrincipal: "manager-name",
        fichier: "manager-photo",
        dossier: "responsables",
        colonneFichier: "photo_url",
        champs: [
            ["nom", "manager-name"],
            ["fonction", "manager-role"],
            ["description", "manager-description"],
            ["photo_url", "manager-photo-url"],
            ["statut", "manager-status"],
            ["ordre", "manager-order", "number"]
        ]
    }
]

function lireFormulaireCollection(config) {
    const donnees = {}

    config.champs.forEach(([colonne, id, type]) => {
        const champ = element(id)
        if (!champ) return
        donnees[colonne] = type === "number" ? Number(champ.value || 0) : champ.value.trim()
    })

    return donnees
}

function remplirFormulaireCollection(config, ligne) {
    element(`${config.formulaire.replace("-form", "")}-id`)?.setAttribute("value", ligne.id)

    config.champs.forEach(([colonne, id]) => {
        const champ = element(id)
        if (champ) champ.value = ligne[colonne] ?? ""
    })

    const champId = element(config.cle === "projets" ? "project-id" : config.cle === "realisations" ? "achievement-id" : config.cle === "partenaires" ? "partner-id" : "manager-id")
    if (champId) champId.value = ligne.id

    element(config.titreFormulaire).textContent = config.titreModification
    element(config.annuler).hidden = false
    element(config.formulaire).scrollIntoView({ behavior: "smooth", block: "start" })
}

function reinitialiserCollection(config) {
    const form = element(config.formulaire)
    form.reset()

    const champId = element(config.cle === "projets" ? "project-id" : config.cle === "realisations" ? "achievement-id" : config.cle === "partenaires" ? "partner-id" : "manager-id")
    if (champId) champId.value = ""

    config.champs.forEach(([colonne, id]) => {
        if (colonne.endsWith("_url")) {
            const champ = element(id)
            if (champ?.type === "hidden") champ.value = ""
        }
    })

    element(config.titreFormulaire).textContent = config.titreNouveau
    element(config.annuler).hidden = true
}

async function chargerCollection(config) {
    const conteneur = element(config.liste)

    const resultat = await supabase
        .from(config.table)
        .select("*")
        .order("ordre", { ascending: true })
        .order("created_at", { ascending: false })

    if (resultat.error) {
        texteVide(conteneur, "Cette rubrique sera disponible après l’exécution de migration-finalisation-admin.sql.")
        return
    }

    conteneur.replaceChildren()
    if (!resultat.data.length) return texteVide(conteneur, "Aucun élément enregistré.")

    resultat.data.forEach((ligne) => {
        const article = document.createElement("article")
        article.className = "element-admin"

        const statut = document.createElement("small")
        statut.textContent = `${ligne.statut || "—"} · ordre ${ligne.ordre ?? 100}`

        const titre = document.createElement("h3")
        const colonneTitre = config.cle === "partenaires" || config.cle === "responsables" ? "nom" : "titre"
        titre.textContent = ligne[colonneTitre]

        const resume = document.createElement("p")
        resume.textContent = ligne.description || ligne.fonction || ligne.site_url || ""

        const actions = creerActions(
            () => remplirFormulaireCollection(config, ligne),
            async () => {
                if (!confirm(`Supprimer « ${ligne[colonneTitre]} » ?`)) return
                const suppression = await supabase.from(config.table).delete().eq("id", ligne.id)
                if (suppression.error) return afficherMessage(suppression.error.message, true)
                afficherMessage("Élément supprimé.")
                await chargerCollection(config)
            }
        )

        article.append(statut, titre, resume, actions)
        conteneur.append(article)
    })
}

collectionsGerables.forEach((config) => {
    const form = element(config.formulaire)
    const annuler = element(config.annuler)

    form?.addEventListener("submit", async (event) => {
        event.preventDefault()
        const bouton = form.querySelector('button[type="submit"]')
        bouton.disabled = true

        try {
            const donnees = lireFormulaireCollection(config)
            let fichier = config.fichier ? element(config.fichier)?.files?.[0] : null

            if (fichier && config.cle === "partenaires") {
                afficherMessage("Uniformisation du logo sur un fond blanc identique…")
                fichier = await normaliserLogoPartenaire(fichier)
            }

            if (fichier) {
                afficherMessage("Téléversement de l’image…")
                const url = await televerserImage(fichier, config.dossier)
                donnees[config.colonneFichier] = url
                if (config.cle === "realisations") donnees.media_type = "image"
            }

            const champId = element(config.cle === "projets" ? "project-id" : config.cle === "realisations" ? "achievement-id" : config.cle === "partenaires" ? "partner-id" : "manager-id")
            const id = champId?.value
            let resultat

            if (id) {
                resultat = await supabase.from(config.table).update(donnees).eq("id", id)
            } else {
                const titre = donnees.titre || donnees.nom || "contenu"
                donnees.slug = `${creerSlug(titre)}-${String(Date.now()).slice(-6)}`
                resultat = await supabase.from(config.table).insert(donnees)
            }

            if (resultat.error) throw resultat.error
            reinitialiserCollection(config)
            await chargerCollection(config)
            afficherMessage("Modification enregistrée. Le site public la récupérera automatiquement.")
        } catch (erreur) {
            afficherMessage(erreur.message, true)
        } finally {
            bouton.disabled = false
        }
    })

    annuler?.addEventListener("click", () => reinitialiserCollection(config))
})

// ----------------------------------------------------------
// MESSAGES DU FORMULAIRE
// ----------------------------------------------------------
function creerLienReponse(message) {
    const contact = message.contact.trim()
    const texte = `Bonjour ${message.nom},\n\nNous revenons vers vous concernant votre demande « ${message.objet} ».\n\n`
    const lien = document.createElement("a")
    lien.className = "bouton-reponse"
    lien.target = "_blank"
    lien.rel = "noopener noreferrer"

    if (contact.includes("@")) {
        lien.href = `mailto:${encodeURIComponent(contact)}?subject=${encodeURIComponent(`Réponse Maison Enrica - ${message.objet}`)}&body=${encodeURIComponent(texte)}`
        lien.textContent = "Répondre par e-mail"
        return lien
    }

    const numero = contact.replace(/[^0-9]/g, "")
    if (numero.length >= 8) {
        lien.href = `https://wa.me/${numero}?text=${encodeURIComponent(texte)}`
        lien.textContent = "Répondre sur WhatsApp"
        return lien
    }

    lien.href = "#"
    lien.textContent = "Coordonnée à vérifier"
    lien.addEventListener("click", (event) => event.preventDefault())
    return lien
}

async function changerStatutMessage(id, statut) {
    const resultat = await supabase.from("messages_contact").update({ statut }).eq("id", id)
    if (resultat.error) throw resultat.error
    await chargerMessages()
}

async function chargerMessages() {
    const conteneur = element("messages-list")
    const compteur = element("messages-count")
    if (!conteneur) return

    const resultat = await supabase
        .from("messages_contact")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

    if (resultat.error) {
        if (compteur) compteur.textContent = "—"
        texteVide(conteneur, "La boîte de réception sera disponible après l’exécution de migration-finalisation-admin.sql.")
        return
    }

    const nouveaux = resultat.data.filter((message) => message.statut === "nouveau").length
    if (compteur) compteur.textContent = nouveaux.toLocaleString("fr-FR")
    conteneur.replaceChildren()

    if (!resultat.data.length) return texteVide(conteneur, "Aucun message reçu.")

    resultat.data.forEach((message) => {
        const article = document.createElement("article")
        article.className = `element-admin message-admin statut-${message.statut}`

        const meta = document.createElement("small")
        meta.textContent = `${message.statut} · ${new Date(message.created_at).toLocaleString("fr-FR")}`
        const titre = document.createElement("h3")
        titre.textContent = `${message.nom} — ${message.objet}`
        const contact = document.createElement("p")
        contact.className = "message-contact-coordonnee"
        contact.textContent = `Réponse : ${message.contact}`
        const contenu = document.createElement("p")
        contenu.textContent = message.message

        const actions = document.createElement("div")
        actions.className = "element-admin-actions"
        actions.append(creerLienReponse(message))

        ;[["Lu", "lu"], ["Traité", "traite"], ["Archiver", "archive"]].forEach(([libelle, statut]) => {
            const bouton = document.createElement("button")
            bouton.type = "button"
            bouton.className = "secondaire"
            bouton.textContent = libelle
            bouton.addEventListener("click", async () => {
                try {
                    await changerStatutMessage(message.id, statut)
                    afficherMessage("Statut du message mis à jour.")
                } catch (erreur) {
                    afficherMessage(erreur.message, true)
                }
            })
            actions.append(bouton)
        })

        const supprimer = document.createElement("button")
        supprimer.type = "button"
        supprimer.className = "danger"
        supprimer.textContent = "Supprimer"
        supprimer.addEventListener("click", async () => {
            if (!confirm("Supprimer définitivement ce message ?")) return
            const resultatSuppression = await supabase.from("messages_contact").delete().eq("id", message.id)
            if (resultatSuppression.error) return afficherMessage(resultatSuppression.error.message, true)
            await chargerMessages()
            afficherMessage("Message supprimé.")
        })
        actions.append(supprimer)

        article.append(meta, titre, contact, contenu, actions)
        conteneur.append(article)
    })
}

element("messages-refresh")?.addEventListener("click", async () => {
    await chargerMessages()
    afficherMessage("Messages actualisés.")
})

// ----------------------------------------------------------
// CHARGEMENT GLOBAL
// ----------------------------------------------------------
async function chargerAdministration() {
    await Promise.all([
        chargerActualites(),
        chargerEvenements(),
        chargerBesoins(),
        chargerInformations(),
        chargerCommentairesAdmin(),
        chargerMessages(),
        ...collectionsGerables.map((config) => chargerCollection(config))
    ])

    try {
        await chargerStatistiques()
    } catch (erreur) {
        element("visits-count").textContent = "—"
    }
}

async function verifierSession() {
    const resultat = await supabase.auth.getUser()
    const utilisateur = resultat.data.user

    if (resultat.error || !utilisateur) {
        afficherConnexion()
        return
    }

    try {
        if (!(await verifierAdministrateur(utilisateur))) {
            await supabase.auth.signOut()
            afficherConnexion()
            afficherMessage("Ce compte n'est pas autorisé à administrer Maison Enrica.", true)
            return
        }

        afficherAdministration(utilisateur)
        await chargerAdministration()
    } catch (erreur) {
        afficherConnexion()
        afficherMessage(`Vérification impossible : ${erreur.message}`, true)
    }
}

formulaireConnexion.addEventListener("submit", async (event) => {
    event.preventDefault()

    if (!supabase) {
        afficherMessageConnexion("La connexion Supabase n'est pas encore prête. Rechargez la page puis réessayez.", "erreur")
        return
    }

    const email = element("email").value.trim()
    const motDePasse = element("password").value
    const bouton = element("login-button")

    if (!email || !motDePasse) {
        afficherMessageConnexion("Renseignez l'adresse e-mail et le mot de passe.", "erreur")
        return
    }

    bouton.disabled = true
    bouton.textContent = "Connexion…"
    afficherMessageConnexion("Vérification de vos identifiants…")

    try {
        const resultat = await supabase.auth.signInWithPassword({
            email,
            password: motDePasse
        })

        if (resultat.error) {
            afficherMessageConnexion(`Connexion impossible : ${resultat.error.message}`, "erreur")
            return
        }

        afficherMessageConnexion("Identifiants corrects. Vérification des droits administrateur…", "succes")
        await verifierSession()
    } catch (erreur) {
        afficherMessageConnexion(`Connexion impossible : ${erreur.message}`, "erreur")
    } finally {
        element("password").value = ""
        bouton.disabled = false
        bouton.textContent = "Se connecter"
    }
})

boutonDeconnexion.addEventListener("click", async () => {
    const resultat = await supabase.auth.signOut()
    if (resultat.error) return afficherMessage(resultat.error.message, true)
    afficherConnexion()
})

document.querySelectorAll("[data-refresh]").forEach((bouton) => {
    bouton.addEventListener("click", async () => {
        try {
            if (bouton.dataset.refresh === "actualites") await chargerActualites()
            if (bouton.dataset.refresh === "evenements") await chargerEvenements()
            if (bouton.dataset.refresh === "besoins") await chargerBesoins()
            if (bouton.dataset.refresh === "projets") await chargerCollection(collectionsGerables.find((config) => config.cle === "projets"))
            if (bouton.dataset.refresh === "realisations") await chargerCollection(collectionsGerables.find((config) => config.cle === "realisations"))
            if (bouton.dataset.refresh === "partenaires") await chargerCollection(collectionsGerables.find((config) => config.cle === "partenaires"))
            if (bouton.dataset.refresh === "responsables") await chargerCollection(collectionsGerables.find((config) => config.cle === "responsables"))
            afficherMessage("Liste actualisée.")
        } catch (erreur) {
            afficherMessage(erreur.message, true)
        }
    })
})

if (!configurationSupabaseValide()) {
    formulaireConnexion.querySelectorAll("input,button").forEach((champ) => champ.disabled = true)
    afficherMessageConnexion("Configuration Supabase incomplète : vérifiez SUPABASE_URL et la clé sb_publishable_ dans supabase-config.js.", "erreur")
} else {
    afficherMessageConnexion("Initialisation de la connexion sécurisée…")

    try {
        const createClient = await chargerClientSupabase()

        supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        })

        afficherMessageConnexion("Connexion prête.", "succes")
        await verifierSession()
    } catch (erreur) {
        afficherMessageConnexion(erreur.message, "erreur")
        afficherMessage(erreur.message, true)
    }
}
