const CACHE = "maison-enrica-admin-v1"
const INTERFACE = [
    "/admin/",
    "/admin/index.html",
    "/admin/admin.css?v=20261011",
    "/admin/admin.js?v=20261011-3",
    "/admin/admin-pwa.js?v=20261011",
    "/admin/manifest.webmanifest",
    "/admin/icons/admin-192.png",
    "/admin/icons/admin-512.png",
    "/Logo.webp",
    "/favicon.png"
]

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(INTERFACE)).catch(() => null))
    self.skipWaiting()
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cles) => Promise.all(cles.filter((cle) => cle !== CACHE).map((cle) => caches.delete(cle))))
    )
    self.clients.claim()
})

self.addEventListener("fetch", (event) => {
    const requete = event.request
    const url = new URL(requete.url)

    if (requete.method !== "GET" || url.origin !== self.location.origin) return
    if (url.pathname.startsWith("/.netlify/") || url.pathname.includes("supabase")) return

    event.respondWith(
        fetch(requete)
            .then((reponse) => {
                const copie = reponse.clone()
                caches.open(CACHE).then((cache) => cache.put(requete, copie))
                return reponse
            })
            .catch(() => caches.match(requete).then((reponse) => reponse || caches.match("/admin/index.html")))
    )
})
