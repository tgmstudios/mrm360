import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/api'
import type { User, UserCreate, UserUpdate, UserFilters, PaginatedResponse } from '@/types/api'

export const useUserStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const filters = ref<UserFilters>({
    page: 1,
    limit: 20,
    sortBy: 'displayName',
    sortOrder: 'asc'
  })

  // Getters
  const activeUsers = computed(() => 
    users.value.filter(user => user.isActive)
  )

  const paidUsers = computed(() => 
    users.value.filter(user => user.isPaid)
  )

  const unpaidUsers = computed(() => 
    users.value.filter(user => !user.isPaid)
  )

  const usersByTeam = computed(() => (teamId: string) => 
    users.value.filter(user => 
      user.teams.some(team => team.id === teamId)
    )
  )

  const usersByGroup = computed(() => (groupId: string) => 
    users.value.filter(user => 
      user.authentikGroups.includes(groupId)
    )
  )

  // Actions
  async function fetchUsers(newFilters?: Partial<UserFilters>) {
    try {
      isLoading.value = true
      error.value = null
      
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }
      
      const response: PaginatedResponse<User> = await apiService.getUsers(filters.value)
      
      const raw = (response.data ?? []) as any[]
      users.value = raw.map((u: any) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        displayName: u.displayName || `${u.firstName} ${u.lastName}`,
        avatar: u.avatar,
        isActive: u.isActive ?? true,
        isPaid: (u.isPaid ?? u.paidStatus) ?? false,
        paidUntil: u.paidUntil,
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: u.updatedAt || new Date().toISOString(),
        authentikGroups: Array.isArray(u.userGroups)
          ? u.userGroups.map((ug: any) => ug.group?.id || ug.groupId || ug.group?.name).filter(Boolean)
          : (u.authentikGroups || []),
        teams: Array.isArray(u.teams) ? u.teams : [],
        events: Array.isArray(u.events) ? u.events : []
      })) as unknown as User[]
      pagination.value = response.pagination
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser(id: string) {
    try {
      isLoading.value = true
      error.value = null
      
      const user = await apiService.getUser(id)
      currentUser.value = user
      
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createUser(userData: UserCreate) {
    try {
      isLoading.value = true
      error.value = null
      
      const newUser = await apiService.createUser(userData)
      users.value.unshift(newUser)
      pagination.value.total += 1
      
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateUser(id: string, userData: UserUpdate) {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedUser = await apiService.updateUser(id, userData)
      
      // Update in users array
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      // Update current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteUser(id: string) {
    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteUser(id)
      
      // Remove from users array
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value.splice(index, 1)
        pagination.value.total -= 1
      }
      
      // Clear current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function searchUsers(query: string) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.getUsers({ 
        ...filters.value, 
        query, 
        page: 1 
      })
      
      users.value = response.data
      pagination.value = response.pagination
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search users'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetFilters() {
    filters.value = {
      page: 1,
      limit: 20,
      sortBy: 'displayName',
      sortOrder: 'asc'
    }
  }

  return {
    // State
    users,
    currentUser,
    isLoading,
    error,
    pagination,
    filters,
    
    // Getters
    activeUsers,
    paidUsers,
    unpaidUsers,
    usersByTeam,
    usersByGroup,
    
    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    clearError,
    resetFilters
  }
})
