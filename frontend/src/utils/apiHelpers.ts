import { useAuthStore } from '@/stores/authStore'

/**
 * Makes an authenticated API call with automatic re-login on authentication failure
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise<Response> - The fetch response
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authStore = useAuthStore()
  
  // Ensure we have a token
  if (!authStore.accessToken) {
    console.log('No access token available, triggering re-login...')
    await authStore.triggerReLogin()
    throw new Error('Authentication required')
  }

  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${authStore.accessToken}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    // Check for authentication errors (401 only - 403 is permission denied, not auth failure)
    if (response.status === 401) {
      console.log(`Authentication failed for ${url}, triggering re-login...`)
      await authStore.triggerReLogin()
      throw new Error('Authentication failed')
    }

    return response
  } catch (error) {
    // If it's a network error, check if we should still trigger re-login
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('Network error detected, checking authentication status...')
      const isValid = await authStore.checkAuth()
      if (!isValid) {
        console.log('Session validation failed, triggering re-login...')
        await authStore.triggerReLogin()
      }
    }
    throw error
  }
}

/**
 * Makes an authenticated API call and returns the JSON response
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise<any> - The parsed JSON response
 */
export async function authenticatedFetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const response = await authenticatedFetch(url, options)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}
