/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTHENTIK_BASE_URL: string
  readonly VITE_AUTHENTIK_CLIENT_ID: string
  readonly VITE_AUTHENTIK_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


