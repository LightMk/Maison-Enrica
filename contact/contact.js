// MODIFICATION : le formulaire prépare un message adapté au sujet choisi.
// WhatsApp reste le moyen principal et l'e-mail sert uniquement de solution de secours.

const formulaire = document.querySelector("#form-contact")
const bouton = document.querySelector("#btn-contact")
const boutonEmail = document.querySelector("#btn-email")
const listeObjet = document.querySelector("#objet-contact")

// Numéro officiel de la Maison Enrica au format WhatsApp : sans +, espace ou tiret.
const numeroWhatsApp = "243819073170"
const adresseEmail = "maisonenricas@hotmail.com"

// Certains boutons du site indiquent automatiquement le sujet du message.
const parametres = new URLSearchParams(window.location.search)
const objetDemande = parametres.get("objet")

if (objetDemande) {
    const optionExiste = Array.from(listeObjet.options).some((option) => {
        return option.value === objetDemande
    })

    if (optionExiste) {
        listeObjet.value = objetDemande
    }
}

// MODIFICATION : le site ne reformule plus le texte écrit par le visiteur.
// Il ajoute seulement une présentation claire autour du message original.
function preparerMessage() {
    const nom = document.querySelector("#nom-contact").value.trim()
    const objet = listeObjet.value
    const message = document.querySelector("#message-contact").value.trim()

    const texte =
        "Bonjour Maison Enrica," +
        "\n\nJe vous contacte depuis votre site." +
        "\n\nDemande : " + objet +
        "\nNom : " + nom +
        "\n\nMessage :" +
        "\n" + message +
        "\n\nMerci."

    return { nom, objet, texte }
}

formulaire.addEventListener("submit", (event) => {
    event.preventDefault()

    if (!formulaire.checkValidity()) {
        formulaire.reportValidity()
        return
    }

    const donnees = preparerMessage()

    const lienWhatsApp =
        "https://wa.me/" +
        numeroWhatsApp +
        "?text=" +
        encodeURIComponent(donnees.texte)

    bouton.disabled = true
    bouton.textContent = "Ouverture de WhatsApp..."

    window.location.href = lienWhatsApp
})

// L'e-mail n'utilise pas l'ancien système Netlify.
// Il ouvre simplement l'application e-mail du visiteur avec le message déjà préparé.
boutonEmail.addEventListener("click", () => {
    if (!formulaire.checkValidity()) {
        formulaire.reportValidity()
        return
    }

    const donnees = preparerMessage()

    const sujetEmail = donnees.objet + " - " + donnees.nom
    const lienEmail =
        "mailto:" +
        adresseEmail +
        "?subject=" +
        encodeURIComponent(sujetEmail) +
        "&body=" +
        encodeURIComponent(donnees.texte)

    window.location.href = lienEmail
})

// Réactive le bouton si l'utilisateur revient sur la page.
window.addEventListener("pageshow", () => {
    bouton.disabled = false
    bouton.innerHTML = '<i aria-hidden="true" class="fa-brands fa-whatsapp"></i> Envoyer le message'
})
