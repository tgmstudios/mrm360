import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/api'
import type { Group, PaginatedResponse } from '@/types/api'

export const useGroupStore = defineStore('groups', () => {
  // State
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Getters
  const executiveGroups = computed(() => 
    groups.value.filter(group => 
      group.name.toLowerCase().includes('exec') || 
      group.name.toLowerCase().includes('board')
    )
  )

  const adminGroups = computed(() => 
    groups.value.filter(group => 
      group.name.toLowerCase().includes('admin')
    )
  )

  const memberGroups = computed(() => 
    groups.value.filter(group => 
      !group.name.toLowerCase().includes('exec') && 
      !group.name.toLowerCase().includes('board') &&
      !group.name.toLowerCase().includes('admin')
    )
  )

  // Actions
  async function fetchGroups() {
    try {
      isLoading.value = true
      error.value = null
      
      const response: PaginatedResponse<Group> = await apiService.getGroups()
      
      groups.value = response.data
      pagination.value = response.pagination
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch groups'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGroup(id: string) {
    try {
      isLoading.value = true
      error.value = null
      
      const group = await apiService.getGroup(id)
      currentGroup.value = group
      
      return group
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch group'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    groups,
    currentGroup,
    isLoading,
    error,
    pagination,
    
    // Getters
    executiveGroups,
    adminGroups,
    memberGroups,
    
    // Actions
    fetchGroups,
    fetchGroup,
    clearError
  }
})
