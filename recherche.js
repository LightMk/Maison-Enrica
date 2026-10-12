// ==========================================================
// RECHERCHE INTERNE MAISON ENRICA
// Solution légère : aucun service externe, aucune donnée envoyée.
// L'index contient uniquement les principales pages et rubriques publiques.
// ==========================================================

const INDEX_RECHERCHE = [
    { titre: "Accueil", description: "Présentation de Maison Enrica et du Foyer de l’Enfant Jésus.", url: "/index.html", mots: "maison enrica foyer enfant jesus accueil kinshasa" },
    { titre: "Notre mission", description: "Éducation, protection, santé et accompagnement quotidien des enfants.", url: "/index.html#mission", mots: "mission education protection santé foyer enfants" },
    { titre: "20 ans de Maison Enrica", description: "Célébration et vidéos des vingt années de la Maison Enrica.", url: "/index.html#anniversaire", mots: "20 ans anniversaire vidéos histoire célébration" },
    { titre: "Chiffres clés", description: "Capacité d’accueil, scolarisation et impact du foyer.", url: "/index.html#impact", mots: "chiffres capacité 150 120 enfants impact scolarisation" },
    { titre: "Actualités", description: "Les dernières informations publiées par Maison Enrica.", url: "/index.html#actualites", mots: "actualités nouvelles publications activités" },
    { titre: "Événements", description: "Événements et rendez-vous de Maison Enrica.", url: "/index.html#evenements", mots: "événements calendrier activités dates" },
    { titre: "Besoins actuels", description: "Les besoins prioritaires du foyer et les moyens de contribuer.", url: "/index.html#besoins-actuels", mots: "besoins aide contribution soutenir dons" },
    { titre: "À propos", description: "Histoire, gouvernance, effectifs et vie au foyer.", url: "/propos/propos.html", mots: "à propos histoire gouvernance équipe responsables effectifs" },
    { titre: "Effectifs scolaires", description: "Répartition des enfants et jeunes selon leur niveau d’études.", url: "/propos/propos.html#effectifs", mots: "effectifs école université humanités primaire licenciés" },
    { titre: "Galerie", description: "Images de la vie quotidienne et des activités du foyer.", url: "/propos/propos.html#galeries", mots: "galerie photos images activités foyer" },
    { titre: "Partenaires", description: "Donateurs et partenaires stratégiques de Maison Enrica.", url: "/propos/propos.html#partenaires", mots: "partenaires donateurs logos organisations soutien" },
    { titre: "Projets", description: "Projets prioritaires et chantiers de Maison Enrica.", url: "/projet/projet.html#projet", mots: "projets chantier saint charles agriculture pongwene adoption" },
    { titre: "Pont d’adoption", description: "Accompagnement des démarches d’adoption nationale et internationale.", url: "/projet/projet.html#projet", mots: "pont adoption famille rdc italie allemagne" },
    { titre: "Réalisations", description: "Réalisations et parcours de réussite d’anciens du foyer.", url: "/projet/projet.html#realisation", mots: "réalisations victoires anciens fondation témoignage réussite" },
    { titre: "FAQ", description: "Réponses aux questions fréquentes sur Maison Enrica.", url: "/faq/faq.html", mots: "faq questions réponses statut enfants santé visite aide" },
    { titre: "Contact", description: "Contacter Maison Enrica, préparer une visite ou proposer un partenariat.", url: "/contact/contact.html", mots: "contact whatsapp email téléphone adresse visite partenariat bénévole" },
    { titre: "Règles de visite", description: "Règles essentielles pour les visites, photos, dons et partenariats.", url: "/contact/contact.html#regles-visite", mots: "visite règles photos dons enfants partenaire" },
    { titre: "Mentions légales et confidentialité", description: "Informations légales et politique de confidentialité du site.", url: "/legale/legale.html", mots: "mentions légales confidentialité données vie privée" }
]

function normaliserRecherche(texte) {
    return String(texte || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
}

function creerRechercheSite() {
    const navigation = document.querySelector(".navigation-principale")
    if (!navigation || document.querySelector("#recherche-site")) return

    const bouton = document.createElement("button")
    bouton.className = "bouton-recherche-site"
    bouton.type = "button"
    bouton.setAttribute("aria-label", "Rechercher sur le site")
    bouton.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><span>Rechercher</span>'

    const soutien = navigation.querySelector(".soutien-menu")
    navigation.insertBefore(bouton, soutien || null)

    const dialogue = document.createElement("dialog")
    dialogue.className = "recherche-site"
    dialogue.id = "recherche-site"
    dialogue.innerHTML = `
        <div class="recherche-site-contenu">
            <div class="recherche-site-entete">
                <div>
                    <span class="insigne">RECHERCHE</span>
                    <h2>Trouver une information</h2>
                </div>
                <button class="recherche-fermer" type="button" aria-label="Fermer la recherche">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </div>
            <form class="recherche-formulaire" role="search">
                <label class="sr-only" for="champ-recherche-site">Rechercher sur Maison Enrica</label>
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input id="champ-recherche-site" type="search" autocomplete="off" placeholder="Ex. projets, visite, université…">
            </form>
            <p class="recherche-aide">La recherche reste entièrement dans votre navigateur.</p>
            <div class="recherche-resultats" aria-live="polite"></div>
        </div>`
    document.body.append(dialogue)

    const champ = dialogue.querySelector("#champ-recherche-site")
    const resultats = dialogue.querySelector(".recherche-resultats")
    const fermer = dialogue.querySelector(".recherche-fermer")
    const formulaire = dialogue.querySelector(".recherche-formulaire")

    function afficherResultats(requete = "") {
        const recherche = normaliserRecherche(requete)
        let liste = INDEX_RECHERCHE

        if (recherche) {
            const termes = recherche.split(/\s+/).filter(Boolean)
            liste = INDEX_RECHERCHE
                .map((element) => {
                    const titre = normaliserRecherche(element.titre)
                    const contenu = normaliserRecherche(`${element.titre} ${element.description} ${element.mots}`)
                    let score = 0
                    termes.forEach((terme) => {
                        if (titre.includes(terme)) score += 4
                        if (contenu.includes(terme)) score += 1
                    })
                    return { ...element, score }
                })
                .filter((element) => element.score > 0)
                .sort((a, b) => b.score - a.score)
        } else {
            liste = INDEX_RECHERCHE.slice(0, 7)
        }

        resultats.replaceChildren()

        if (!liste.length) {
            const vide = document.createElement("p")
            vide.className = "recherche-vide"
            vide.textContent = "Aucun résultat. Essayez un mot plus simple, par exemple « projet », « visite » ou « contact »."
            resultats.append(vide)
            return
        }

        liste.slice(0, 10).forEach((element) => {
            const lien = document.createElement("a")
            lien.className = "recherche-resultat"
            lien.href = element.url

            const texte = document.createElement("span")
            const titre = document.createElement("strong")
            const description = document.createElement("small")
            titre.textContent = element.titre
            description.textContent = element.description
            texte.append(titre, description)

            const icone = document.createElement("i")
            icone.className = "fa-solid fa-arrow-right"
            icone.setAttribute("aria-hidden", "true")
            lien.append(texte, icone)
            resultats.append(lien)
        })
    }

    bouton.addEventListener("click", () => {
        const menuPrincipal = document.querySelector("#menu-principal")
        const boutonMenu = document.querySelector(".menu-burger")
        menuPrincipal?.classList.remove("ouvert")
        boutonMenu?.classList.remove("actif")
        boutonMenu?.setAttribute("aria-expanded", "false")
        boutonMenu?.setAttribute("aria-label", "Ouvrir le menu")

        afficherResultats("")
        if (typeof dialogue.showModal === "function") dialogue.showModal()
        else dialogue.setAttribute("open", "")
        window.setTimeout(() => champ.focus(), 30)
    })

    fermer.addEventListener("click", () => dialogue.close())
    dialogue.addEventListener("click", (event) => {
        if (event.target === dialogue) dialogue.close()
    })
    champ.addEventListener("input", () => afficherResultats(champ.value))
    formulaire.addEventListener("submit", (event) => {
        event.preventDefault()
        const premier = resultats.querySelector("a")
        if (premier) window.location.href = premier.href
    })
}

document.addEventListener("DOMContentLoaded", creerRechercheSite)
