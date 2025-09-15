import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'
import { initiateOAuthLogin } from '@/utils/oauth'

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
      initiateOAuthLogin()
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
        login()
      }
    } catch (error) {
      console.error('Callback error:', error)
      toast.error('Login failed')
      login()
    }
  }

  async function logout() {
    try {
      // The authStore.logout() now handles OIDC provider logout automatically
      await authStore.logout()
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if there's an error
      await authStore.logout()
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
      login()
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
