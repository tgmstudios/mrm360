// Type definitions for runtime-injected public/env.js

declare global {
  interface Window {
    ENV: {
      VITE_DISCORD_CLIENT_ID?: string
      VITE_DISCORD_REDIRECT_URI?: string
      VITE_API_BASE_URL?: string
      VITE_AUTHENTIK_BASE_URL?: string
      VITE_AUTHENTIK_CLIENT_ID?: string
      VITE_AUTHENTIK_REDIRECT_URI?: string
      VITE_AUTHENTIK_LOGOUT_ENDPOINT?: string
      DEV?: boolean
    }
  }
}

export {}


