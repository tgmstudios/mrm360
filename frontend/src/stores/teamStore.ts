import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/api'
import type { Team, TeamCreate, TeamUpdate, TeamFilters, PaginatedResponse } from '@/types/api'

export const useTeamStore = defineStore('teams', () => {
  // State
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const filters = ref<TeamFilters>({
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // Getters
  const executiveTeams = computed(() => 
    teams.value.filter(team => team.type === 'EXECUTIVE')
  )

  const committeeTeams = computed(() => 
    teams.value.filter(team => team.type === 'COMMITTEE')
  )

  const workingGroups = computed(() => 
    teams.value.filter(team => team.type === 'WORKING_GROUP')
  )

  const projectTeams = computed(() => 
    teams.value.filter(team => team.type === 'PROJECT')
  )

  const teamsByParent = computed(() => (parentId: string) => 
    teams.value.filter(team => team.parentTeamId === parentId)
  )

  // Actions
  async function fetchTeams(newFilters?: Partial<TeamFilters>) {
    try {
      isLoading.value = true
      error.value = null
      
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }
      
      const response: PaginatedResponse<Team> = await apiService.getTeams(filters.value)
      
      teams.value = response.data
      pagination.value = response.pagination
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch teams'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTeam(id: string) {
    try {
      isLoading.value = true
      error.value = null
      
      const team = await apiService.getTeam(id)
      currentTeam.value = team
      
      return team
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch team'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createTeam(teamData: TeamCreate) {
    try {
      isLoading.value = true
      error.value = null
      
      const newTeam = await apiService.createTeam(teamData)
      teams.value.unshift(newTeam)
      pagination.value.total += 1
      
      return newTeam
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create team'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateTeam(id: string, teamData: TeamUpdate) {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedTeam = await apiService.updateTeam(id, teamData)
      
      // Update in teams array
      const index = teams.value.findIndex(team => team.id === id)
      if (index !== -1) {
        teams.value[index] = updatedTeam
      }
      
      // Update current team if it's the same
      if (currentTeam.value?.id === id) {
        currentTeam.value = updatedTeam
      }
      
      return updatedTeam
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update team'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTeam(id: string) {
    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteTeam(id)
      
      // Remove from teams array
      const index = teams.value.findIndex(team => team.id === id)
      if (index !== -1) {
        teams.value.splice(index, 1)
        pagination.value.total -= 1
      }
      
      // Clear current team if it's the same
      if (currentTeam.value?.id === id) {
        currentTeam.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete team'
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
      sortBy: 'name',
      sortOrder: 'asc'
    }
  }

  return {
    // State
    teams,
    currentTeam,
    isLoading,
    error,
    pagination,
    filters,
    
    // Getters
    executiveTeams,
    committeeTeams,
    workingGroups,
    projectTeams,
    teamsByParent,
    
    // Actions
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    clearError,
    resetFilters
  }
})
