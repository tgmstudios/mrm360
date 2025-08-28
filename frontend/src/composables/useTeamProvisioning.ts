import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { TeamProvisioningStatus } from '@/types/api'

export function useTeamProvisioning(teamId: string) {
  const provisioningStatus = ref<TeamProvisioningStatus | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isProvisioning = computed(() => {
    return provisioningStatus.value?.action === 'create' || provisioningStatus.value?.action === 'update'
  })

  const isDeleting = computed(() => {
    return provisioningStatus.value?.action === 'delete'
  })

  const hasErrors = computed(() => {
    return provisioningStatus.value?.errors && provisioningStatus.value.errors.length > 0
  })

  const hasWarnings = computed(() => {
    return provisioningStatus.value?.warnings && provisioningStatus.value.warnings.length > 0
  })

  const overallSuccess = computed(() => {
    return provisioningStatus.value?.success || false
  })

  // Methods
  const loadProvisioningStatus = async () => {
    try {
      loading.value = true
      error.value = null
      
      const status = await apiService.getTeamProvisioningStatus(teamId)
      provisioningStatus.value = status
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load provisioning status'
      console.warn('Provisioning status not available:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshStatus = async () => {
    await loadProvisioningStatus()
  }

  const startPolling = (intervalMs: number = 2000) => {
    const pollInterval = setInterval(async () => {
      await refreshStatus()
      
      // Stop polling if provisioning is complete or failed
      if (provisioningStatus.value && (overallSuccess.value || hasErrors.value)) {
        clearInterval(pollInterval)
      }
    }, intervalMs)

    // Return cleanup function
    return () => clearInterval(pollInterval)
  }

  return {
    // State
    provisioningStatus,
    loading,
    error,
    
    // Computed
    isProvisioning,
    isDeleting,
    hasErrors,
    hasWarnings,
    overallSuccess,
    
    // Methods
    loadProvisioningStatus,
    refreshStatus,
    startPolling
  }
}
