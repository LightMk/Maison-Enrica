/* ==========================================================
   CONFIGURATION PUBLIQUE SUPABASE
   Cette clé est destinée au navigateur et doit commencer par
   "sb_publishable_". Ne jamais placer une clé "sb_secret_"
   ou "service_role" dans ce fichier.
   ========================================================== */
export const SUPABASE_URL = "https://dphlgdussbnyeprtvzqz.supabase.co"
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ysCnS4X8iiLnudRy-pKNGQ_SLBxUUhQ"

export function configurationSupabaseValide() {
    return SUPABASE_URL.startsWith("https://dphlgdussbnyeprtvzqz.supabase.co") &&
        SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_ysCnS4X8iiLnudRy-pKNGQ_SLBxUUhQ")
}
