// FINALISATION : WhatsApp reste le moyen principal.
// Une copie de la demande peut aussi être enregistrée dans Supabase afin
// qu'elle apparaisse dans l'espace administrateur. Si Supabase est indisponible,
// WhatsApp et l'e-mail continuent de fonctionner normalement.

const formulaire = document.querySelector("#form-contact")
const bouton = document.querySelector("#btn-contact")
const boutonEmail = document.querySelector("#btn-email")
const listeObjet = document.querySelector("#objet-contact")
const etatContact = document.querySelector("#etat-contact")

const numeroWhatsApp = "243819073170"
const adresseEmail = "maisonenricas@hotmail.com"

const parametres = new URLSearchParams(window.location.search)
const objetDemande = parametres.get("objet")

if (objetDemande) {
    const optionExiste = Array.from(listeObjet.options).some((option) => option.value === objetDemande)
    if (optionExiste) listeObjet.value = objetDemande
}

function afficherEtat(message) {
    if (etatContact) etatContact.textContent = message
}

function preparerMessage() {
    const nom = document.querySelector("#nom-contact").value.trim()
    const contact = document.querySelector("#contact-reponse").value.trim()
    const objet = listeObjet.value
    const message = document.querySelector("#message-contact").value.trim()

    const texte =
        "Bonjour Maison Enrica," +
        "\n\nJe vous contacte depuis votre site." +
        "\n\nDemande : " + objet +
        "\nNom : " + nom +
        "\nContact : " + contact +
        "\n\nMessage :" +
        "\n" + message +
        "\n\nMerci."

    return { nom, contact, objet, message, texte }
}

async function enregistrerDansAdministration(donnees, canal) {
    const piege = document.querySelector("#site-contact")?.value.trim()
    if (piege) return false

    try {
        const reponse = await fetch("/.netlify/functions/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                nom: donnees.nom,
                contact: donnees.contact,
                objet: donnees.objet,
                message: donnees.message,
                canal,
                site: piege
            })
        })

        return reponse.ok
    } catch (erreur) {
        return false
    }
}

function ouvrirLien(lien) {
    const lienTemporaire = document.createElement("a")
    lienTemporaire.href = lien
    lienTemporaire.target = "_blank"
    lienTemporaire.rel = "noopener noreferrer"
    document.body.append(lienTemporaire)
    lienTemporaire.click()
    lienTemporaire.remove()
}

formulaire.addEventListener("submit", async (event) => {
    event.preventDefault()

    if (!formulaire.checkValidity()) {
        formulaire.reportValidity()
        return
    }

    const confirmation = window.confirm(
        "WhatsApp va s’ouvrir avec votre message déjà préparé. Vous devrez vérifier le contenu puis confirmer vous-même l’envoi. Continuer ?"
    )

    if (!confirmation) {
        afficherEtat("Ouverture de WhatsApp annulée. Votre message reste dans le formulaire.")
        return
    }

    const donnees = preparerMessage()
    const lienWhatsApp = "https://wa.me/" + numeroWhatsApp + "?text=" + encodeURIComponent(donnees.texte)

    bouton.disabled = true
    bouton.innerHTML = '<i aria-hidden="true" class="fa-brands fa-whatsapp"></i> Préparation…'
    afficherEtat("Préparation de votre demande…")

    const copieEnregistree = await enregistrerDansAdministration(donnees, "whatsapp")

    afficherEtat(
        copieEnregistree
            ? "Une copie de votre demande a été enregistrée pour Maison Enrica. Vérifiez maintenant le message dans WhatsApp puis confirmez vous-même son envoi."
            : "WhatsApp va s’ouvrir. Vérifiez le message puis confirmez vous-même son envoi."
    )

    bouton.innerHTML = '<i aria-hidden="true" class="fa-brands fa-whatsapp"></i> Ouverture de WhatsApp…'
    ouvrirLien(lienWhatsApp)

    window.setTimeout(() => {
        bouton.disabled = false
        bouton.innerHTML = '<i aria-hidden="true" class="fa-brands fa-whatsapp"></i> Envoyer le message'
    }, 1200)
})

boutonEmail.addEventListener("click", async () => {
    if (!formulaire.checkValidity()) {
        formulaire.reportValidity()
        return
    }

    const confirmation = window.confirm(
        "Votre application e-mail va s’ouvrir avec le message préparé. Vous devrez vérifier le contenu puis confirmer vous-même l’envoi. Continuer ?"
    )

    if (!confirmation) {
        afficherEtat("Ouverture de l’e-mail annulée. Votre message reste dans le formulaire.")
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

    boutonEmail.disabled = true
    const copieEnregistree = await enregistrerDansAdministration(donnees, "email")
    boutonEmail.disabled = false

    afficherEtat(
        copieEnregistree
            ? "Une copie de votre demande a été enregistrée. Votre application e-mail va maintenant s’ouvrir."
            : "Votre application e-mail va s’ouvrir avec le message préparé."
    )
    window.location.href = lienEmail
})

formulaire.addEventListener("input", () => afficherEtat(""))

window.addEventListener("pageshow", () => {
    bouton.disabled = false
    bouton.innerHTML = '<i aria-hidden="true" class="fa-brands fa-whatsapp"></i> Envoyer le message'
    boutonEmail.disabled = false
})

// La carte Google n'est chargée que si le visiteur la demande.
const boutonCarte = document.querySelector("#charger-carte")
const apercuCarte = document.querySelector("#carte-apercu")
const carteGoogle = document.querySelector(".carte-localisation iframe[data-src]")

boutonCarte?.addEventListener("click", () => {
    if (!carteGoogle) return

    if (!carteGoogle.getAttribute("src")) {
        carteGoogle.src = carteGoogle.dataset.src
    }

    carteGoogle.hidden = false
    apercuCarte?.setAttribute("hidden", "")
})
