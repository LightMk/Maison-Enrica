// MODIFICATION : le formulaire est désormais envoyé par Netlify Forms.
// Aucun message n’est conservé dans le localStorage du visiteur.

const formulaire = document.querySelector("#form-contact")
const bouton = document.querySelector("#btn-contact")
const listeObjet = document.querySelector("#objet-contact")

// AJOUT : certains boutons du site indiquent automatiquement le sujet du message.
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

formulaire.addEventListener("submit", () => {
    // IMPORTANT : pas de preventDefault(), sinon Netlify ne recevrait pas le message.
    if (formulaire.checkValidity()) {
        bouton.disabled = true
        bouton.textContent = "Envoi en cours..."
    }
})
