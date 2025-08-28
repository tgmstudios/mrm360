<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Teams</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage and view all teams in MRM360 including their type, status, and members.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <BaseButton
          v-if="canCreate"
          @click="createTeam"
          icon="PlusIcon"
        >
          Create Team
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            v-model="filters.search"
            type="text"
            placeholder="Search teams..."
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
            Team Type
          </label>
          <select
            id="type"
            v-model="filters.type"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="COMPETITION">Competition</option>
            <option value="DEVELOPMENT">Development</option>
          </select>
        </div>
        
        <div>
          <label for="subtype" class="block text-sm font-medium text-gray-700 mb-1">
            Subtype
          </label>
          <select
            id="subtype"
            v-model="filters.subtype"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Subtypes</option>
            <option value="BLUE">Blue</option>
            <option value="RED">Red</option>
            <option value="CTF">CTF</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <BaseButton
            variant="outline"
            @click="applyFilters"
          >
            Apply Filters
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Teams Grid -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="filteredTeams.length === 0" class="text-center py-12">
      <div class="text-gray-500">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
        <p class="text-gray-500">Try adjusting your search or filters</p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="team in paginatedTeams"
        :key="team.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ team.name }}</h3>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {{ team.type }}
              </span>
              <span v-if="team.subtype" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {{ team.subtype }}
              </span>
            </div>
          </div>
          
          <p v-if="team.description" class="text-gray-600 text-sm mb-3">
            {{ team.description }}
          </p>
          
          <div class="flex items-center text-sm text-gray-500 mb-3">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {{ team.userTeams?.length || 0 }} members
          </div>
          
          <div v-if="team.parentTeam" class="flex items-center text-sm text-gray-600">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            Subteam of {{ team.parentTeam.name }}
          </div>
          
          <div class="flex justify-between items-center mt-4">
            <BaseButton
              variant="ghost"
              size="sm"
              @click="viewTeam(team.id)"
            >
              View Details
            </BaseButton>
            
            <div v-if="canEdit" class="flex space-x-2">
              <BaseButton
                variant="ghost"
                size="sm"
                @click="editTeam(team.id)"
              >
                Edit
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="sm"
                @click="deleteTeam(team.id)"
              >
                Delete
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex items-center space-x-2">
        <BaseButton
          variant="outline"
          size="sm"
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
        >
          Previous
        </BaseButton>
        
        <div class="flex space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="{
              'px-3 py-2 text-sm font-medium rounded-md': true,
              'bg-indigo-600 text-white': currentPage === page,
              'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50': currentPage !== page
            }"
          >
            {{ page }}
          </button>
        </div>
        
        <BaseButton
          variant="outline"
          size="sm"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next
        </BaseButton>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Team } from '@/types/api'

const router = useRouter()
const teamStore = useTeamStore()
const { can } = usePermissions()

const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(9)

const filters = reactive({
  search: '',
  type: '',
  subtype: ''
})

const canCreate = computed(() => can('create', 'Team'))
const canEdit = computed(() => can('update', 'Team'))

// Filter teams based on search and filters
const filteredTeams = computed(() => {
  let teams = teamStore.teams

  if (filters.search) {
    teams = teams.filter(team => 
      team.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(filters.search.toLowerCase()))
    )
  }

  if (filters.type) {
    teams = teams.filter(team => team.type === filters.type)
  }

  if (filters.subtype) {
    teams = teams.filter(team => team.subtype === filters.subtype)
  }

  return teams
})

const isFormValid = computed(() => {
  return true // No form validation needed for list view
})

const totalPages = computed(() => {
  return Math.ceil(filteredTeams.value.length / itemsPerPage.value)
})

const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTeams.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

onMounted(async () => {
  await loadTeams()
})

watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

const loadTeams = async () => {
  try {
    loading.value = true
    await teamStore.fetchTeams()
  } catch (error) {
    console.error('Failed to load teams:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
}

const createTeam = () => {
  router.push('/teams/new')
}

const viewTeam = (teamId: string) => {
  router.push(`/teams/${teamId}`)
}

const editTeam = (teamId: string) => {
  router.push(`/teams/${teamId}/edit`)
}

const deleteTeam = async (teamId: string) => {
  if (!confirm('Are you sure you want to delete this team?')) return
  
  try {
    await teamStore.deleteTeam(teamId)
    await loadTeams()
  } catch (error) {
    console.error('Failed to delete team:', error)
  }
}
</script>
