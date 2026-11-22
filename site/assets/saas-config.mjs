/**
 * Public (non-secret) settings. Remain disabled until separately deployed
 * Supabase Auth + D1 Worker services have passed staging checks.
 * NEVER put Supabase service_role or payment secrets in this browser file.
 */
export const SAAS_CONFIG = Object.freeze({
  enabled: false,
  supabaseUrl: "",
  supabasePublishableKey: "",
  apiBase: ""
});
