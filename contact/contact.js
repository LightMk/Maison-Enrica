// FINALISATION : le formulaire prépare un message fidèle au texte du visiteur.
// WhatsApp reste le moyen principal et l'e-mail sert de solution de secours.

const formulaire = document.querySelector("#form-contact")
const bouton = document.querySelector("#btn-contact")
const boutonEmail = document.querySelector("#btn-email")
const listeObjet = document.querySelector("#objet-contact")
const etatContact = document.querySelector("#etat-contact")

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

function afficherEtat(message) {
    if (etatContact) {
        etatContact.textContent = message
    }
}

// Le site ne reformule pas le texte du visiteur : il l'encadre seulement
// avec le nom et le sujet sélectionné pour que la demande reste claire.
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
    bouton.innerHTML = '<i aria-hidden="true" class="fa-brands fa-whatsapp"></i> Ouverture de WhatsApp...'
    afficherEtat("Votre message est prêt. Vérifiez-le dans WhatsApp puis confirmez vous-même son envoi.")

    // L'ouverture dans un nouvel onglet permet de conserver le formulaire si le visiteur revient.
    const nouvelleFenetre = window.open(lienWhatsApp, "_blank", "noopener,noreferrer")

    // Secours pour les navigateurs qui bloquent l'ouverture d'un nouvel onglet.
    if (!nouvelleFenetre) {
        window.location.href = lienWhatsApp
    }
})

// L'e-mail n'utilise pas l'ancien système Netlify Forms.
// Il ouvre l'application e-mail du visiteur avec le même message déjà préparé.
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

    afficherEtat("Votre application e-mail va s’ouvrir avec le message préparé. Vérifiez-le puis confirmez vous-même son envoi.")
    window.location.href = lienEmail
})

// Le retour disparaît dès que le visiteur recommence à modifier sa demande.
formulaire.addEventListener("input", () => {
    afficherEtat("")
})

// Réactive le bouton si l'utilisateur revient sur la page depuis WhatsApp.
window.addEventListener("pageshow", () => {
    bouton.disabled = false
    bouton.innerHTML = '<i aria-hidden="true" class="fa-brands fa-whatsapp"></i> Envoyer le message'
})
