// OAuth utility functions
export function initiateOAuthLogin() {
  const issuer = import.meta.env.VITE_AUTHENTIK_BASE_URL
  const clientId = import.meta.env.VITE_AUTHENTIK_CLIENT_ID
  const redirectUri = import.meta.env.VITE_AUTHENTIK_REDIRECT_URI
  
  if (!issuer || !clientId || !redirectUri) {
    console.error('OIDC configuration missing')
    return
  }

  // Generate state parameter for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  // Store state in both sessionStorage and localStorage for redundancy
  sessionStorage.setItem('oidc_state', state)
  localStorage.setItem('oidc_state', state)
  
  // Build authorization URL
  const authUrl = new URL(`${issuer}/application/o/authorize/`)
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'openid email profile groups')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', state)
  
  // Redirect to Authentik
  window.location.href = authUrl.toString()
}

export function validateOAuthState(receivedState: string): boolean {
  const storedState = sessionStorage.getItem('oidc_state') || localStorage.getItem('oidc_state')
  
  if (!storedState || storedState !== receivedState) {
    console.error('State parameter mismatch:', {
      received: receivedState,
      stored: storedState,
      sessionState: sessionStorage.getItem('oidc_state'),
      localState: localStorage.getItem('oidc_state')
    })
    
    // In development, allow the flow to continue even with state mismatch
    // In production, this should be strict
    if (import.meta.env.DEV) {
      console.warn('State parameter mismatch in development mode, continuing anyway...')
      return true
    } else {
      return false
    }
  }
  
  return true
}

export function clearOAuthState() {
  sessionStorage.removeItem('oidc_state')
  localStorage.removeItem('oidc_state')
}
