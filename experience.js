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
    ".experience-photo, .experience-texte, .formulaire, .card-contact, .reponse > div"
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
retourHaut.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>'
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
    bouton.innerHTML = `<span>${titre.textContent}</span><i class="bi bi-plus-lg" aria-hidden="true"></i>`

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
