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

  function getUserById(id: string) {
    return users.value.find(user => user.id === id)
  }

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
      users.value = raw.map((u: any) => {
                const user = {
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
          teams: Array.isArray(u.userTeams) 
            ? u.userTeams.map((ut: any) => ut.team).filter(Boolean)
            : Array.isArray(u.teams) ? u.teams : [],
          events: Array.isArray(u.events) ? u.events : []
        } as unknown as User
        
        return user
      })
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
      
      const rawUser = await apiService.getUser(id)
      
      // Transform the user data to match our expected structure
      const user = {
        id: rawUser.id,
        email: rawUser.email,
        firstName: rawUser.firstName,
        lastName: rawUser.lastName,
        displayName: rawUser.displayName || `${rawUser.firstName} ${rawUser.lastName}`,
        avatar: rawUser.avatar,
        isActive: rawUser.isActive ?? false,
        isPaid: (rawUser.isPaid ?? rawUser.paidStatus) ?? false,
        paidUntil: rawUser.paidUntil,
        createdAt: rawUser.createdAt || new Date().toISOString(),
        updatedAt: rawUser.updatedAt || new Date().toISOString(),
        authentikGroups: Array.isArray(rawUser.userGroups)
          ? rawUser.userGroups.map((ug: any) => ug.group?.id || ug.groupId || ug.group?.name).filter(Boolean)
          : (rawUser.authentikGroups || []),
        teams: Array.isArray(rawUser.userTeams) 
          ? rawUser.userTeams.map((ut: any) => ut.team).filter(Boolean)
          : Array.isArray(rawUser.teams) ? rawUser.teams : [],
        events: Array.isArray(rawUser.events) ? rawUser.events : []
      } as unknown as User
      
      currentUser.value = user
      
      // Also add/update the user in the users array so getUserById can find it
      const existingIndex = users.value.findIndex(u => u.id === id)
      if (existingIndex !== -1) {
        users.value[existingIndex] = user
      } else {
        users.value.push(user)
      }
      
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
      
      const rawUser = await apiService.createUser(userData)
      
      // Transform the user data to match our expected structure
      const newUser = {
        id: rawUser.id,
        email: rawUser.email,
        firstName: rawUser.firstName,
        lastName: rawUser.lastName,
        displayName: rawUser.displayName || `${rawUser.firstName} ${rawUser.lastName}`,
        avatar: rawUser.avatar,
        isActive: rawUser.isActive ?? false, // New users are inactive by default
        isPaid: (rawUser.isPaid ?? rawUser.paidStatus) ?? false,
        paidUntil: rawUser.paidUntil,
        createdAt: rawUser.createdAt || new Date().toISOString(),
        updatedAt: rawUser.updatedAt || new Date().toISOString(),
        authentikGroups: Array.isArray(rawUser.userGroups)
          ? rawUser.userGroups.map((ug: any) => ug.group?.id || ug.groupId || ug.group?.name).filter(Boolean)
          : (rawUser.authentikGroups || []),
        teams: Array.isArray(rawUser.userTeams) 
          ? rawUser.userTeams.map((ut: any) => ut.team).filter(Boolean)
          : Array.isArray(rawUser.teams) ? rawUser.teams : [],
        events: Array.isArray(rawUser.events) ? rawUser.events : []
      } as unknown as User
      
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
      
      const rawUser = await apiService.updateUser(id, userData)
      
      // Transform the user data to match our expected structure
      const updatedUser = {
        id: rawUser.id,
        email: rawUser.email,
        firstName: rawUser.firstName,
        lastName: rawUser.lastName,
        displayName: rawUser.displayName || `${rawUser.firstName} ${rawUser.lastName}`,
        avatar: rawUser.avatar,
        isActive: rawUser.isActive ?? true,
        isPaid: (rawUser.isPaid ?? rawUser.paidStatus) ?? false,
        paidUntil: rawUser.paidUntil,
        createdAt: rawUser.createdAt || new Date().toISOString(),
        updatedAt: rawUser.updatedAt || new Date().toISOString(),
        authentikGroups: Array.isArray(rawUser.userGroups)
          ? rawUser.userGroups.map((ug: any) => ug.group?.id || ug.groupId || ug.group?.name).filter(Boolean)
          : (rawUser.authentikGroups || []),
        teams: Array.isArray(rawUser.userTeams) 
          ? rawUser.userTeams.map((ut: any) => ut.team).filter(Boolean)
          : Array.isArray(rawUser.teams) ? rawUser.teams : [],
        events: Array.isArray(rawUser.events) ? rawUser.events : []
      } as unknown as User
      
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
    getUserById,
    
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
