<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-100">Account Created</span>
          </div>
          
          <div class="hidden sm:block w-16 h-0.5 bg-gray-600"></div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">2</span>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-100">Discord Verification</span>
          </div>
          
          <div class="hidden sm:block w-16 h-0.5 bg-gray-600"></div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span class="text-gray-400 font-bold text-sm">3</span>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-400">Select Interests</span>
          </div>
        </div>
      </div>

      <!-- OAuth2 Callback Processing -->
      <div v-if="isProcessingCallback" class="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 text-center border border-gray-700">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-100 mb-2">Processing Discord Verification...</h2>
        <p class="text-gray-400">Please wait while we link your Discord account</p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="bg-red-900 border border-red-700 rounded-xl p-6 text-center mb-6 sm:mb-8">
        <div class="flex items-center justify-center space-x-2 mb-2">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="text-red-200 font-medium">Verification Failed</span>
        </div>
        <p class="text-red-300 mb-4">{{ error }}</p>
        <button
          @click="retryVerification"
          class="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 min-h-[48px] touch-manipulation"
        >
          Try Again
        </button>
      </div>

      <!-- Main Content (shown when not processing callback) -->
      <div v-else-if="!discordLinked" class="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-700">
        <div class="text-center mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-100 mb-3 sm:mb-4">
            Step 2: Link Your Discord Account
          </h1>
          <p class="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Discord is the hub for all club communication, announcements, and team coordination. 
            Linking your account will give you access to our community channels.
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          <!-- Left Column: Discord Benefits -->
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-100 mb-4">
              Why Link Discord?
            </h2>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-100">Real-time Communication</h3>
                  <p class="text-sm text-gray-400">Get instant updates about events, meetings, and opportunities</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-green-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-100">Team Coordination</h3>
                  <p class="text-sm text-gray-400">Coordinate with your competition and project teams</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-purple-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-100">Resource Sharing</h3>
                  <p class="text-sm text-gray-400">Access study materials, tools, and learning resources</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-yellow-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-gray-100">Role Assignment</h3>
                  <p class="text-sm text-gray-400">Get automatically assigned to relevant channels based on your interests</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Discord OAuth -->
          <div class="text-center">
            <div class="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div class="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="@/assets/logos/discord.svg" alt="Discord" class="w-8 h-8" />
              </div>
              
              <h3 class="text-lg font-semibold text-gray-100 mb-4">
                Connect Your Discord
              </h3>
              <p class="text-sm text-gray-400 mb-6">
                Click the button below to authorize our app to link your Discord account. 
                This will give you access to our community channels.
              </p>
              
              <button
                @click="linkDiscord"
                :disabled="isLoading"
                class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation"
              >
                <svg v-if="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <img src="@/assets/logos/discord.svg" alt="Discord" class="w-5 h-5" />
                <span>{{ isLoading ? 'Connecting...' : 'Link Discord Account' }}</span>
              </button>
              
              <div class="mt-4">
                <button
                  @click="skipDiscord"
                  class="text-sm text-gray-400 hover:text-gray-300 underline py-2"
                >
                  Skip for now
                </button>
              </div>
              
              <p class="text-xs text-gray-500 mt-3">
                You can always link your Discord account later from your profile settings
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Already Linked Message -->
      <div v-else-if="discordLinked" class="bg-green-900 border border-green-700 rounded-xl p-6 text-center">
        <div class="flex items-center justify-center space-x-2 mb-2">
          <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-green-200 font-medium">Discord Account Linked!</span>
        </div>
        <p class="text-green-300 mb-4">Your Discord account is now connected to your profile.</p>
        <button
          @click="continueToInterests"
          class="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 min-h-[48px] touch-manipulation"
        >
          Continue to Step 3
        </button>
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
const discordLinked = ref(false)
const isProcessingCallback = ref(false)
const error = ref('')

onMounted(async () => {
  // Check if this is an OAuth2 callback
  const { code, state } = route.query
  
  if (code && state) {
    // This is an OAuth2 callback, process it
    await processOAuth2Callback(code as string, state as string)
  } else {
    // Check if user already has Discord linked
    await checkDiscordStatus()
  }
})

async function processOAuth2Callback(code: string, state: string) {
  try {
    isProcessingCallback.value = true
    error.value = ''
    
    console.log('Discord OAuth2 callback received:', { code: code.substring(0, 8) + '...', state })
    
    // Validate state parameter
    const storedState = sessionStorage.getItem('discord_oauth_state')
    if (!storedState || storedState !== state) {
      throw new Error('Invalid state parameter')
    }
    
    // Clear stored state
    sessionStorage.removeItem('discord_oauth_state')
    
         // Call backend API to process Discord OAuth2
     const response = await fetch(`${window.ENV.VITE_API_BASE_URL}/join/dd-verify?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${authStore.accessToken}`,
         'Content-Type': 'application/json',
       }
     })
    
         if (response.ok) {
       const data = await response.json()
       
       if (data.success) {
         // Discord account linked successfully
         discordLinked.value = true
         
         // Check if this was initiated from profile page
         const context = sessionStorage.getItem('discord_oauth_context')
         sessionStorage.removeItem('discord_oauth_context')
         
         if (context === 'profile') {
           // Redirect to profile page after a short delay
           setTimeout(() => {
             router.push('/profile')
           }, 2000)
         } else {
           // Redirect to interests page after a short delay
           setTimeout(() => {
             router.push('/join/interests')
           }, 2000)
         }
       } else {
         throw new Error(data.message || 'Failed to link Discord account')
       }
     } else {
       const errorData = await response.json()
       throw new Error(errorData.error || errorData.message || 'Failed to link Discord account')
     }
    
  } catch (err) {
    console.error('Discord OAuth2 callback error:', err)
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    isProcessingCallback.value = false
  }
}

async function checkDiscordStatus() {
  try {
    const response = await fetch(`${window.ENV.VITE_API_BASE_URL}/user/discord-status`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      discordLinked.value = data.hasDiscord
    }
  } catch (error) {
    console.error('Failed to check Discord status:', error)
  }
}

function linkDiscord() {
  isLoading.value = true
  
  const clientId = window.ENV.VITE_DISCORD_CLIENT_ID
  const redirectUri = window.ENV.VITE_DISCORD_REDIRECT_URI
  
  if (!clientId || !redirectUri) {
    console.error('Discord OAuth2 configuration missing')
    isLoading.value = false
    return
  }

  // Generate state parameter for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  // Store state in sessionStorage
  sessionStorage.setItem('discord_oauth_state', state)
  
  // Build Discord OAuth2 URL
  const authUrl = new URL('https://discord.com/api/oauth2/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'identify')
  authUrl.searchParams.set('state', state)
  
  // Redirect to Discord OAuth2
  window.location.href = authUrl.toString()
}

function skipDiscord() {
  // Continue to interests page without Discord linking
  router.push('/join/interests')
}

function continueToInterests() {
  router.push('/join/interests')
}

function retryVerification() {
  // Clear error and try again
  error.value = ''
  // Reload the page to restart the flow
  window.location.reload()
}
</script>
