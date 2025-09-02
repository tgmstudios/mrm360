// Type definitions for runtime-injected public/env.js

declare global {
  interface Window {
    ENV: {
      VITE_DISCORD_CLIENT_ID?: string
      VITE_DISCORD_REDIRECT_URI?: string
      VITE_API_BASE_URL?: string
    }
  }
}

export {}


