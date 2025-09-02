<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-100 mb-4">
          Welcome to Penn State CCSO!
        </h1>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
          Join our cybersecurity community and get access to exclusive resources, competitions, and networking opportunities.
        </p>
      </div>

      <!-- Main Content -->
      <div class="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <!-- Left Column: Benefits -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-100 mb-6">
              What You'll Get
            </h2>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-green-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-100">One Account. All of CCSO</h3>
                  <p class="text-sm text-gray-400">Access all our services with a single Penn State SSO login</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-100">Discord Community Access</h3>
                  <p class="text-sm text-gray-400">Join our Discord server for announcements, discussions, and team coordination</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-purple-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-100">Competition Teams</h3>
                  <p class="text-sm text-gray-400">Participate in CPTC, CCDC, CTFs, and other cybersecurity competitions</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-yellow-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-100">Newsletter & Updates</h3>
                  <p class="text-sm text-gray-400">Stay informed about events, opportunities, and club news</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Get Started -->
          <div class="text-center lg:text-left">
            <div class="bg-gray-700 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-100 mb-4">
                Ready to Get Started?
              </h3>
              <p class="text-sm text-gray-400 mb-6">
                {{ authStore.isAuthenticated ? 'Click the button below to continue with Discord setup and complete your onboarding.' : 'Click the button below to sign in with your Penn State account. This will create your SSO account and start the onboarding process.' }}
              </p>
              
              <button
                @click="initiateOIDCLogin"
                :disabled="isLoading"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation"
              >
                <svg v-if="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-else>{{ isLoading ? 'Signing in...' : (authStore.isAuthenticated ? 'Continue with Discord Setup' : 'Get Started with CCSO SSO') }}</span>
                <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </button>
              
              <p class="text-xs text-gray-500 mt-3">
                {{ authStore.isAuthenticated ? 'You\'ll be redirected to complete Discord verification' : 'You\'ll be redirected to CCSO\'s secure login page' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Process Steps -->
      <div class="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <h2 class="text-2xl font-semibold text-gray-100 mb-6 text-center">
          What Happens Next?
        </h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-indigo-300 font-bold text-lg">1</span>
            </div>
            <h3 class="font-medium text-gray-100 mb-2">Sign In with Penn State</h3>
            <p class="text-sm text-gray-400">Use your Penn State credentials to create your SSO account</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-green-300 font-bold text-lg">2</span>
            </div>
            <h3 class="font-medium text-gray-100 mb-2">Link Discord Account</h3>
            <p class="text-sm text-gray-400">Connect your Discord to access our community channels</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-purple-300 font-bold text-lg">3</span>
            </div>
            <h3 class="font-medium text-gray-100 mb-2">Select Interests</h3>
            <p class="text-sm text-gray-400">Choose your club interests and get assigned to relevant teams</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isLoading = ref(false)

onMounted(async () => {
  // Check if this is an OIDC callback
  const { code, state } = route.query
  
  if (code && state) {
    await handleOIDCCallback(code as string, state as string)
  } else {
    // Check if user is already authenticated
    await checkAuthStatus()
  }
})

async function checkAuthStatus() {
  try {
    // Check if user is already authenticated
    if (authStore.isAuthenticated) {
      // User is authenticated, but let them stay on the join page
      // They can choose to proceed with Discord linking if needed
      console.log('User is authenticated, allowing access to join page')
    }
  } catch (error) {
    console.error('Error checking auth status:', error)
    // If there's an error, stay on the join page
  }
}

async function handleOIDCCallback(code: string, state: string) {
  try {
    isLoading.value = true
    
    // Verify state parameter
    const storedState = sessionStorage.getItem('oidc_state')
    if (state !== storedState) {
      console.error('Invalid state parameter')
      alert('Authentication failed: Invalid state parameter')
      return
    }
    
    // Clear stored state
    sessionStorage.removeItem('oidc_state')
    
    // Get redirect target
    const redirectTarget = sessionStorage.getItem('oidc_redirect_target') || '/join'
    sessionStorage.removeItem('oidc_redirect_target')
    
    // Exchange code for token
    const success = await authStore.loginWithOIDC(code, state)
    
    if (success) {
      console.log('OAuth2 authentication successful, redirecting to Discord verification...')
      
      // For now, assume user needs Discord linking and go directly to Discord verification
      // This avoids the API call that's currently failing
      router.push('/join/dd-verify')
      
      // TODO: Re-enable Discord status check once backend API is working
      /*
      try {
        // Check if user has Discord linked
        const response = await fetch('/api/user/discord-status', {
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Discord status response:', data)
          
          if (data.hasDiscord) {
            // User has Discord linked, go to interests
            console.log('User has Discord linked, redirecting to interests')
            router.push('/join/interests')
          } else {
            // User needs to link Discord
            console.log('User needs Discord linking, redirecting to Discord verification')
            router.push('/join/dd-verify')
          }
        } else {
          console.warn('Failed to check Discord status, redirecting to Discord verification')
          // Error checking Discord status, go to Discord verification
          router.push('/join/dd-verify')
        }
      } catch (discordCheckError) {
        console.error('Error checking Discord status:', discordCheckError)
        // If Discord status check fails, assume user needs Discord linking
        router.push('/join/dd-verify')
      }
      */
    } else {
      alert('Authentication failed. Please try again.')
    }
  } catch (error) {
    console.error('OIDC callback error:', error)
    alert('Authentication failed. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Initiate OIDC login with redirect to join page
function initiateOIDCLogin() {
  isLoading.value = true
  
  const issuer = window.ENV.VITE_AUTHENTIK_BASE_URL
  const clientId = window.ENV.VITE_AUTHENTIK_CLIENT_ID
  const redirectUri = `${window.location.origin}/join` // Redirect back to join page
  
  if (!issuer || !clientId) {
    console.error('OIDC configuration missing')
    isLoading.value = false
    return
  }

  // Generate state parameter for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  // Store state and redirect target
  sessionStorage.setItem('oidc_state', state)
  sessionStorage.setItem('oidc_redirect_target', '/join')
  
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
</script>
