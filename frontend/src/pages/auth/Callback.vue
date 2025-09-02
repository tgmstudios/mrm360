<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div v-if="isLoading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <h2 class="mt-4 text-xl font-semibold text-gray-100">Processing authentication...</h2>
        <p class="mt-2 text-sm text-gray-400">Please wait while we complete your sign-in</p>
      </div>

      <div v-else-if="error" class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900">
          <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoinround="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="mt-4 text-xl font-semibold text-gray-100">Authentication failed</h2>
        <p class="mt-2 text-sm text-gray-400">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="retryAuthentication"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          >
            Try again
          </button>
        </div>
      </div>

      <div v-else-if="success" class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900">
          <svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoinround="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="mt-4 text-xl font-semibold text-gray-100">Authentication successful!</h2>
        <p class="mt-2 text-sm text-gray-400">Redirecting you to the dashboard...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { validateOAuthState, clearOAuthState, initiateOAuthLogin } from '@/utils/oauth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Component state
const isLoading = ref(true)
const error = ref('')
const success = ref(false)

// Handle OIDC callback
async function handleCallback() {
  try {
    isLoading.value = true
    error.value = ''
    
    console.log('OIDC callback received, route query:', route.query)
    
    // Get OIDC parameters from URL
    const code = route.query.code as string
    const state = route.query.state as string
    const errorParam = route.query.error as string
    
    console.log('OIDC parameters extracted:', { code: code ? 'present' : 'missing', state: state ? 'present' : 'missing', errorParam })
    
    if (errorParam) {
      throw new Error(errorParam)
    }
    
    if (!code || !state) {
      throw new Error('Missing OIDC parameters')
    }
    
    // Validate state parameter
    if (!validateOAuthState(state)) {
      throw new Error('Invalid state parameter')
    }
    
    // Clear stored state
    clearOAuthState()
    
    // Authenticate with backend using OIDC code
    const authSuccess = await authStore.loginWithOIDC(code, state)
    
    if (authSuccess) {
      success.value = true
      
      // Ensure auth state is properly synchronized
      await authStore.checkAuth()
      
      // Refresh all stores with new authentication context
      await authStore.refreshStores()
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      throw new Error('OIDC authentication failed')
    }
    
  } catch (err) {
    console.error('OIDC callback error:', err)
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred during authentication'
  } finally {
    isLoading.value = false
  }
}

// Retry authentication
function retryAuthentication() {
  // Redirect back to OAuth
  initiateOAuthLogin()
}

// Handle component mount
onMounted(() => {
  handleCallback()
})
</script>
