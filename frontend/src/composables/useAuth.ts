import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const toast = useToast()

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const isExecBoard = computed(() => authStore.isExecBoard)
  const isAdmin = computed(() => authStore.isAdmin)
  const isLoading = computed(() => authStore.isLoading)

  // Methods
  async function login() {
    try {
      // Redirect to Authentik OIDC login
      const authUrl = `${import.meta.env.VITE_AUTHENTIK_BASE_URL}/application/o/authorize/`
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_AUTHENTIK_CLIENT_ID,
        redirect_uri: import.meta.env.VITE_AUTHENTIK_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid profile email groups',
        state: generateRandomState()
      })
      
      window.location.href = `${authUrl}?${params.toString()}`
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to initiate login')
    }
  }

  async function handleCallback(code: string) {
    try {
      const success = await authStore.login(code)
      
      if (success) {
        toast.success('Login successful!')
        router.push('/dashboard')
      } else {
        toast.error('Login failed')
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Callback error:', error)
      toast.error('Login failed')
      router.push('/auth/login')
    }
  }

  async function logout() {
    try {
      await authStore.logout()
      toast.success('Logged out successfully')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      router.push('/auth/login')
    }
  }

  async function checkAuth() {
    try {
      const isAuth = await authStore.checkAuth()
      return isAuth
    } catch (error) {
      console.error('Auth check error:', error)
      return false
    }
  }

  function requireAuth() {
    if (!isAuthenticated.value) {
      router.push('/auth/login')
      return false
    }
    return true
  }

  function requireExecBoard() {
    if (!requireAuth()) return false
    
    if (!isExecBoard.value) {
      toast.error('Access denied. Executive board access required.')
      router.push('/dashboard')
      return false
    }
    return true
  }

  function requireAdmin() {
    if (!requireAuth()) return false
    
    if (!isAdmin.value) {
      toast.error('Access denied. Admin access required.')
      router.push('/dashboard')
      return false
    }
    return true
  }

  // Utility functions
  function generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Initialize auth on mount - only if not already initialized
  onMounted(() => {
    if (!authStore.isAuthenticated && !authStore.accessToken) {
      authStore.init()
    }
  })

  return {
    // State
    isAuthenticated,
    user,
    isExecBoard,
    isAdmin,
    isLoading,
    
    // Methods
    login,
    handleCallback,
    logout,
    checkAuth,
    requireAuth,
    requireExecBoard,
    requireAdmin
  }
}
