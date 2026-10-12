/* Application installable : aucun accès hors ligne aux données privées.
   Le service worker met seulement en cache l'interface statique. */
let invitationInstallation = null
const boutonsInstallation = document.querySelectorAll(".installer-admin")

function afficherBoutonsInstallation() {
    boutonsInstallation.forEach((bouton) => bouton.hidden = false)
}

function masquerBoutonsInstallation() {
    boutonsInstallation.forEach((bouton) => bouton.hidden = true)
}

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    invitationInstallation = event
    afficherBoutonsInstallation()
})

boutonsInstallation.forEach((bouton) => {
    bouton.addEventListener("click", async () => {
        if (!invitationInstallation) return
        invitationInstallation.prompt()
        await invitationInstallation.userChoice
        invitationInstallation = null
        masquerBoutonsInstallation()
    })
})

window.addEventListener("appinstalled", masquerBoutonsInstallation)

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js", { scope: "./" }).catch(() => {
            // L'administration reste entièrement utilisable sans installation PWA.
        })
    })
}
