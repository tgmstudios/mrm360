<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Teams</h1>
          <p class="text-gray-600 mt-2">Manage and view all teams</p>
        </div>
        <router-link
          v-if="canCreate"
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Team
        </router-link>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            id="search"
            v-model="filters.search"
            type="text"
            placeholder="Search teams..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700 mb-2">Team Type</label>
          <select
            id="type"
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="committee">Committee</option>
            <option value="project">Project</option>
            <option value="special">Special</option>
          </select>
        </div>
        
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            id="status"
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Teams Grid -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ team.name }}</h3>
              <p class="text-sm text-gray-600">{{ team.description }}</p>
            </div>
            <span
              :class="{
                'px-2 py-1 text-xs font-medium rounded-full': true,
                'bg-green-100 text-green-800': team.status === 'active',
                'bg-red-100 text-red-800': team.status === 'inactive'
              }"
            >
              {{ team.status }}
            </span>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ team.type }}
            </div>
            
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {{ team.members?.length || 0 }} members
            </div>
            
            <div v-if="team.parentTeam" class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              Subteam of {{ team.parentTeam.name }}
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <button
              @click="viewTeam(team.id)"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </button>
            
            <div v-if="canEdit" class="flex space-x-2">
              <button
                @click="editTeam(team.id)"
                class="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                @click="deleteTeam(team.id)"
                class="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex items-center space-x-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div class="flex space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="{
              'px-3 py-2 text-sm font-medium rounded-md': true,
              'bg-blue-600 text-white': currentPage === page,
              'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50': currentPage !== page
            }"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import { usePermissions } from '@/composables/usePermissions'
import type { Team } from '@/types/api'

const router = useRouter()
const teamStore = useTeamStore()
const { can } = usePermissions()

const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 9

const filters = reactive({
  search: '',
  type: '',
  status: ''
})

const canCreate = computed(() => can('create', 'Team'))
const canEdit = computed(() => can('update', 'Team'))

const filteredTeams = computed(() => {
  let teams = teamStore.teams

  if (filters.search) {
    const search = filters.search.toLowerCase()
    teams = teams.filter(team => 
      team.name.toLowerCase().includes(search) ||
      team.description?.toLowerCase().includes(search)
    )
  }

  if (filters.type) {
    teams = teams.filter(team => team.type === filters.type)
  }

  if (filters.status) {
    teams = teams.filter(team => team.status === filters.status)
  }

  return teams
})

const totalPages = computed(() => Math.ceil(filteredTeams.value.length / itemsPerPage))
const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTeams.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
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
