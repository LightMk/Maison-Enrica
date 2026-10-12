/* ==========================================================
   AJOUT PREMIUM : EXPÉRIENCE UTILISATEUR
   - animations au défilement
   - compteurs animés
   - galerie en plein écran
   - bouton de retour en haut
   - FAQ repliable
   ========================================================== */
// 1. Le header gagne une ombre plus nette après le début du défilement.
const entete = document.querySelector("header")

function actualiserEntete() {
    if (!entete) return
    entete.classList.toggle("entete-defilee", window.scrollY > 20)
}

window.addEventListener("scroll", actualiserEntete, { passive: true })
actualiserEntete()


// 2. Apparition progressive des éléments lorsqu'ils entrent dans l'écran.
const elementsADevoiler = document.querySelectorAll(
    "section h2, .card, .cardI, .card-realisation, .devoile, .chronique > div, " +
    ".experience-photo, .experience-texte, .formulaire, .card-contact, .reponse > div, " +
    ".anniversaire-entete, .video-anniversaire, .tableau-effectifs, .familles-adoptees"
)

if ("IntersectionObserver" in window) {
    const observateur = new IntersectionObserver((entrees, observer) => {
        entrees.forEach((entree) => {
            if (entree.isIntersecting) {
                entree.target.classList.add("reveal-visible")
                observer.unobserve(entree.target)
            }
        })
    }, {
        threshold: 0.12
    })

    elementsADevoiler.forEach((element, index) => {
        element.classList.add("reveal")
        element.style.setProperty("--reveal-delay", (index % 4) * 70 + "ms")
        observateur.observe(element)
    })
} else {
    elementsADevoiler.forEach((element) => element.classList.add("reveal-visible"))
}


// 3. Animation des chiffres déjà présents dans le site.
// Elle ne change pas les données : elle anime seulement leur affichage.
const compteurs = document.querySelectorAll("#impact h3, .hero-reperes strong")

function animerCompteur(element) {
    const texteOriginal = element.textContent.trim()
    const nombre = parseInt(texteOriginal.replace(/\D/g, ""), 10)

    if (Number.isNaN(nombre)) return

    const suffixe = texteOriginal.includes("%") ? "%" : ""
    const duree = 1100
    const debut = performance.now()

    function etape(temps) {
        const progressionCompteur = Math.min((temps - debut) / duree, 1)
        const progressionDouce = 1 - Math.pow(1 - progressionCompteur, 3)
        element.textContent = Math.round(nombre * progressionDouce) + suffixe

        if (progressionCompteur < 1) {
            requestAnimationFrame(etape)
        }
    }

    requestAnimationFrame(etape)
}

if ("IntersectionObserver" in window) {
    const observateurCompteurs = new IntersectionObserver((entrees, observer) => {
        entrees.forEach((entree) => {
            if (entree.isIntersecting) {
                animerCompteur(entree.target)
                observer.unobserve(entree.target)
            }
        })
    }, { threshold: 0.6 })

    compteurs.forEach((compteur) => observateurCompteurs.observe(compteur))
}

// 4. Bouton de retour en haut, visible uniquement après un certain défilement.
const retourHaut = document.createElement("button")
retourHaut.className = "retour-haut"
retourHaut.type = "button"
retourHaut.setAttribute("aria-label", "Retourner en haut de la page")
retourHaut.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>'
document.body.append(retourHaut)

function actualiserRetourHaut() {
    retourHaut.classList.toggle("retour-haut-visible", window.scrollY > 650)
}

window.addEventListener("scroll", actualiserRetourHaut, { passive: true })
actualiserRetourHaut()

retourHaut.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
})

// 5. FAQ : transforme les longues réponses en accordéon plus confortable.
const blocsFaq = document.querySelectorAll(".page-faq .reponse > div[id]")

blocsFaq.forEach((bloc, index) => {
    const titre = bloc.querySelector("h3")
    if (!titre) return

    const idContenu = "contenu-faq-" + index
    const contenu = document.createElement("div")
    contenu.className = "faq-contenu"
    contenu.id = idContenu

    while (titre.nextSibling) {
        contenu.append(titre.nextSibling)
    }

    const bouton = document.createElement("button")
    bouton.className = "faq-toggle"
    bouton.type = "button"
    bouton.setAttribute("aria-controls", idContenu)
    bouton.setAttribute("aria-expanded", index === 0 ? "true" : "false")
    bouton.innerHTML = `<span>${titre.textContent}</span><i class="fa-solid fa-plus" aria-hidden="true"></i>`

    titre.remove()
    bloc.prepend(bouton)
    bloc.append(contenu)

    if (index === 0 || window.location.hash === "#" + bloc.id) {
        bloc.classList.add("faq-ouverte")
        bouton.setAttribute("aria-expanded", "true")
    }

    bouton.addEventListener("click", () => {
        const estOuverte = bloc.classList.toggle("faq-ouverte")
        bouton.setAttribute("aria-expanded", estOuverte ? "true" : "false")
    })
})


// 6. Compteur réel de visites.
// Une visite est comptée une seule fois par session de navigation.
// Le total est stocké côté serveur avec Netlify Blobs : ce n'est pas un faux compteur local.
async function actualiserCompteurVisites() {
    const compteur = document.querySelector("#compteur-visites")
    const compteurEntete = document.querySelector("#compteur-visites-entete")
    const blocCompteurEntete = document.querySelector("#bienvenue-compteur")
    let visiteDejaComptee = false

    try {
        visiteDejaComptee = sessionStorage.getItem("maison-enrica-visite-comptee") === "oui"
    } catch (erreur) {
        // Certains modes de confidentialité peuvent bloquer sessionStorage.
        // Dans ce cas, le compteur continue de fonctionner sans mémorisation locale.
    }

    try {
        let visiteurDejaConnu = false
        try {
            visiteurDejaConnu = Number(localStorage.getItem("maison-enrica-nombre-visites") || 0) > 0
        } catch (erreur) {}

        const options = {
            method: visiteDejaComptee ? "GET" : "POST",
            headers: {
                "Accept": "application/json"
            }
        }

        if (!visiteDejaComptee) {
            options.headers["Content-Type"] = "application/json"
            options.body = JSON.stringify({ retour: visiteurDejaConnu })
        }

        const reponse = await fetch("/.netlify/functions/visites", options)

        if (!reponse.ok) {
            throw new Error("Compteur indisponible")
        }

        const donnees = await reponse.json()

        if (!visiteDejaComptee) {
            try {
                sessionStorage.setItem("maison-enrica-visite-comptee", "oui")
            } catch (erreur) {
                // Le comptage serveur reste valable même si le stockage local est indisponible.
            }
        }

        const totalFormate = Number(donnees.visites).toLocaleString("fr-FR")

        if (compteur) {
            compteur.textContent = totalFormate
            compteur.closest(".visites-site")?.removeAttribute("hidden")
        }

        if (compteurEntete) {
            compteurEntete.textContent = totalFormate
            blocCompteurEntete?.removeAttribute("hidden")
        }
    } catch (erreur) {
        // En local ou si la fonction Netlify n'est pas encore déployée,
        // on affiche un tiret au lieu d'inventer une valeur.
        if (compteur) {
            // Le bloc reste masqué : aucune valeur fictive n'est affichée.
            compteur.closest(".visites-site")?.setAttribute("hidden", "")
        }
        blocCompteurEntete?.setAttribute("hidden", "")
    }
}

actualiserCompteurVisites()

// 7. Vidéos des 20 ans : le fichier MP4 n'est demandé qu'après une action volontaire.
const cartesVideos = document.querySelectorAll(".video-anniversaire, .video-differee")

cartesVideos.forEach((carte) => {
    const video = carte.querySelector("video")
    const source = video?.querySelector("source[data-src]")
    const boutonLecture = carte.querySelector(".video-charger")

    if (!video || !source || !boutonLecture) return

    boutonLecture.addEventListener("click", async () => {
        // La source n'existe pas dans src avant ce clic : le navigateur ne télécharge donc pas le MP4 à l'ouverture de la page.
        source.src = source.dataset.src
        video.controls = true
        video.load()
        boutonLecture.hidden = true

        // Une seule vidéo anniversaire joue à la fois.
        cartesVideos.forEach((autreCarte) => {
            const autreVideo = autreCarte.querySelector("video")
            if (autreVideo && autreVideo !== video && !autreVideo.paused) {
                autreVideo.pause()
            }
        })

        try {
            await video.play()
        } catch (erreur) {
            // Le navigateur peut bloquer play() dans de rares cas ; les contrôles restent disponibles.
        }
    })

    video.addEventListener("play", () => {
        cartesVideos.forEach((autreCarte) => {
            const autreVideo = autreCarte.querySelector("video")
            if (autreVideo && autreVideo !== video && !autreVideo.paused) {
                autreVideo.pause()
            }
        })
    })
})


// 8. Accueil du visiteur : première impression + retour après une vraie période d'absence.
const messageVisiteur = document.querySelector("#message-visiteur")
const visitePersonnelle = document.querySelector("#visite-personnelle")
const bienvenueTitre = document.querySelector("#bienvenue-visiteur-titre")
const bienvenueTexte = document.querySelector("#bienvenue-visiteur-texte")

function definirAccueilVisiteur() {
    const maintenant = Date.now()
    const delaiBonRetour = 24 * 60 * 60 * 1000

    try {
        const ancienneValeur = Number(localStorage.getItem("maison-enrica-nombre-visites") || 0)
        const derniereVisite = Number(localStorage.getItem("maison-enrica-derniere-visite") || 0)
        const nouvelleValeur = ancienneValeur + 1
        const premiereVisite = ancienneValeur === 0 || !derniereVisite
        const retourApresAbsence = !premiereVisite && maintenant - derniereVisite >= delaiBonRetour

        localStorage.setItem("maison-enrica-nombre-visites", String(nouvelleValeur))
        localStorage.setItem("maison-enrica-derniere-visite", String(maintenant))

        if (premiereVisite) {
            if (bienvenueTitre) bienvenueTitre.textContent = "Bienvenue à Maison Enrica"
            if (bienvenueTexte) bienvenueTexte.textContent = "Découvrez une maison d’accueil, d’éducation et d’accompagnement tournée vers l’avenir."
            if (messageVisiteur) messageVisiteur.textContent = "Bienvenue à Maison Enrica !"
            if (visitePersonnelle) visitePersonnelle.textContent = "C’est votre première visite sur cet appareil."
            return
        }

        if (retourApresAbsence) {
            const jours = Math.max(1, Math.floor((maintenant - derniereVisite) / delaiBonRetour))
            if (bienvenueTitre) bienvenueTitre.textContent = "Bon retour à Maison Enrica"
            if (bienvenueTexte) bienvenueTexte.textContent = jours === 1
                ? "Heureux de vous retrouver après votre dernière visite."
                : `Heureux de vous retrouver après ${jours} jours.`
            if (messageVisiteur) messageVisiteur.textContent = "Bon retour à Maison Enrica !"
            if (visitePersonnelle) visitePersonnelle.textContent = `Vous avez déjà consulté le site ${ancienneValeur} fois sur cet appareil.`
            return
        }

        if (bienvenueTitre) bienvenueTitre.textContent = "Heureux de vous retrouver"
        if (bienvenueTexte) bienvenueTexte.textContent = "Votre visite récente est toujours la bienvenue."
        if (messageVisiteur) messageVisiteur.textContent = "Heureux de vous retrouver à Maison Enrica !"
        if (visitePersonnelle) visitePersonnelle.textContent = "Vous avez consulté le site récemment."
    } catch (erreur) {
        if (bienvenueTitre) bienvenueTitre.textContent = "Bienvenue à Maison Enrica"
        if (bienvenueTexte) bienvenueTexte.textContent = "Heureux de vous accueillir au Foyer de l’Enfant Jésus."
        if (visitePersonnelle) visitePersonnelle.textContent = "Heureux de vous accueillir."
    }
}

definirAccueilVisiteur()


// 9. Guide de première visite : cinq étapes courtes, relançables depuis le bouton d'aide.
const guide = document.querySelector("#guide-site")
const ouvrirGuide = document.querySelector("#ouvrir-guide")
const fermerGuide = document.querySelector("#fermer-guide")
const ignorerGuide = document.querySelector("#ignorer-guide")
const precedentGuide = document.querySelector("#precedent-guide")
const suivantGuide = document.querySelector("#suivant-guide")
const progressionGuide = document.querySelector("#guide-progression")
const barreGuide = document.querySelector("#guide-barre-progression")
const titreGuide = document.querySelector("#guide-titre")
const texteGuide = document.querySelector("#guide-texte")
const iconeGuide = document.querySelector("#guide-icone")
const lienGuide = document.querySelector("#guide-lien")

const etapesGuide = [
    {
        titre: "Bienvenue à Maison Enrica",
        texte: "Découvrez en quelques instants le foyer, ses missions et les moyens simples de parcourir le site.",
        icone: "fa-solid fa-house-heart",
        lien: "#mission",
        action: "Découvrir nos missions"
    },
    {
        titre: "Comprendre notre mission",
        texte: "Protection, éducation, santé, alimentation et accompagnement structurent le quotidien du foyer.",
        icone: "fa-solid fa-hand-holding-heart",
        lien: "#mission",
        action: "Voir les piliers"
    },
    {
        titre: "Voir nos projets et réalisations",
        texte: "Retrouvez les projets en cours, les réalisations déjà accomplies et les actions qui construisent l'avenir.",
        icone: "fa-solid fa-diagram-project",
        lien: "projet/projet.html#realisation",
        action: "Voir les réalisations"
    },
    {
        titre: "Suivre ce qui se passe maintenant",
        texte: "Actualités, événements et besoins actuels sont mis à jour sans reconstruire tout le site.",
        icone: "fa-regular fa-bell",
        lien: "#actualites",
        action: "Voir les actualités"
    },
    {
        titre: "Participer ou nous contacter",
        texte: "Vous pouvez préparer une visite, proposer un partenariat ou demander comment contribuer directement.",
        icone: "fa-solid fa-comments",
        lien: "contact/contact.html#form-contact",
        action: "Nous contacter"
    }
]

let etapeGuideActive = 0

function memoriserGuideVu() {
    try {
        localStorage.setItem("maison-enrica-guide-vu", "oui")
    } catch (erreur) {}
}

function afficherEtapeGuide() {
    if (!guide || !progressionGuide || !titreGuide || !texteGuide || !suivantGuide) return

    const etape = etapesGuide[etapeGuideActive]
    progressionGuide.textContent = `${etapeGuideActive + 1} sur ${etapesGuide.length}`
    titreGuide.textContent = etape.titre
    texteGuide.textContent = etape.texte

    if (iconeGuide) iconeGuide.className = etape.icone
    if (lienGuide) {
        lienGuide.href = etape.lien
        lienGuide.textContent = etape.action
    }
    if (barreGuide) barreGuide.style.width = `${((etapeGuideActive + 1) / etapesGuide.length) * 100}%`
    if (precedentGuide) precedentGuide.disabled = etapeGuideActive === 0

    suivantGuide.textContent = etapeGuideActive === etapesGuide.length - 1 ? "Terminer" : "Suivant"
}

function montrerGuide() {
    if (!guide) return
    etapeGuideActive = 0
    afficherEtapeGuide()
    guide.hidden = false
}

function masquerGuide() {
    if (!guide) return
    guide.hidden = true
    memoriserGuideVu()
}

ouvrirGuide?.addEventListener("click", montrerGuide)
fermerGuide?.addEventListener("click", masquerGuide)
ignorerGuide?.addEventListener("click", masquerGuide)

precedentGuide?.addEventListener("click", () => {
    if (etapeGuideActive > 0) {
        etapeGuideActive--
        afficherEtapeGuide()
    }
})

suivantGuide?.addEventListener("click", () => {
    if (etapeGuideActive < etapesGuide.length - 1) {
        etapeGuideActive++
        afficherEtapeGuide()
    } else {
        masquerGuide()
    }
})

if (guide) {
    let guideDejaVu = true

    try {
        guideDejaVu = localStorage.getItem("maison-enrica-guide-vu") === "oui"
    } catch (erreur) {}

    if (!guideDejaVu) {
        window.setTimeout(montrerGuide, 3200)
    }
}


// 10. Galerie : visionneuse légère sans bibliothèque externe ni nouvelle requête d'image.
const imagesGalerie = document.querySelectorAll(".devoile img")

if (imagesGalerie.length > 0) {
    const visionneuse = document.createElement("div")
    visionneuse.className = "visionneuse"
    visionneuse.hidden = true
    visionneuse.innerHTML = `
        <div class="visionneuse-contenu" role="dialog" aria-modal="true" aria-label="Agrandissement de la photo">
            <button class="visionneuse-fermer" type="button" aria-label="Fermer l'image">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
            <img alt="" decoding="async">
            <p></p>
        </div>
    `
    document.body.append(visionneuse)

    const imageAgrandie = visionneuse.querySelector("img")
    const legende = visionneuse.querySelector("p")
    const boutonFermer = visionneuse.querySelector(".visionneuse-fermer")
    let elementOrigine = null

    function fermerVisionneuse() {
        visionneuse.hidden = true
        document.body.classList.remove("visionneuse-ouverte")
        elementOrigine?.focus()
    }

    imagesGalerie.forEach((image) => {
        const carte = image.closest(".devoile")
        if (!carte) return

        carte.tabIndex = 0
        carte.setAttribute("role", "button")
        carte.setAttribute("aria-label", `Agrandir : ${image.alt || "photo de Maison Enrica"}`)

        function ouvrir() {
            elementOrigine = carte
            imageAgrandie.src = image.currentSrc || image.src
            imageAgrandie.alt = image.alt
            legende.textContent = carte.querySelector("p")?.textContent || image.alt
            visionneuse.hidden = false
            document.body.classList.add("visionneuse-ouverte")
            boutonFermer.focus()
        }

        carte.addEventListener("click", ouvrir)
        carte.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                ouvrir()
            }
        })
    })

    boutonFermer.addEventListener("click", fermerVisionneuse)
    visionneuse.addEventListener("click", (event) => {
        if (event.target === visionneuse) fermerVisionneuse()
    })
    document.addEventListener("keydown", (event) => {
        if (visionneuse.hidden) return

        if (event.key === "Escape") {
            fermerVisionneuse()
        }

        if (event.key === "Tab") {
            event.preventDefault()
            boutonFermer.focus()
        }
    })
}

