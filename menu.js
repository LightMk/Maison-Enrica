// AJOUT : menu burger commun à toutes les pages principales.

const boutonMenu = document.querySelector(".menu-burger")
const menuPrincipal = document.querySelector("#menu-principal")

if (boutonMenu && menuPrincipal) {
    function fermerMenu() {
        menuPrincipal.classList.remove("ouvert")
        boutonMenu.classList.remove("actif")
        boutonMenu.setAttribute("aria-expanded", "false")
        boutonMenu.setAttribute("aria-label", "Ouvrir le menu")
    }

    boutonMenu.addEventListener("click", () => {
        const menuEstOuvert = menuPrincipal.classList.toggle("ouvert")

        boutonMenu.classList.toggle("actif", menuEstOuvert)
        boutonMenu.setAttribute("aria-expanded", menuEstOuvert)
        boutonMenu.setAttribute(
            "aria-label",
            menuEstOuvert ? "Fermer le menu" : "Ouvrir le menu"
        )
    })

    // Le menu se referme après le choix d'une page.
    menuPrincipal.querySelectorAll("a").forEach((lien) => {
        lien.addEventListener("click", fermerMenu)
    })

    // La touche Échap permet aussi de fermer le menu.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            fermerMenu()
        }
    })
}
