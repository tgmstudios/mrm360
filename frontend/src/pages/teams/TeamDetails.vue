<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ team?.name }}</h1>
            <p v-if="team?.description" class="mt-2 text-gray-600">{{ team.description }}</p>
          </div>
          <div class="flex space-x-3">
            <router-link
              to="/teams"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Teams
            </router-link>
            
            <BaseButton
              v-if="canEdit"
              @click="editTeam"
              variant="primary"
            >
              Edit Team
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Team Details -->
      <div v-else-if="team" class="space-y-6">
        <!-- Team Information Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Team Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Team Type</label>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {{ team.type }}
                </span>
                <span v-if="team.subtype" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {{ team.subtype }}
                </span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <p class="text-sm text-gray-900">{{ formatDate(team.createdAt) }}</p>
            </div>
            
            <div v-if="team.parentTeam">
              <label class="block text-sm font-medium text-gray-700 mb-1">Parent Team</label>
              <p class="text-sm text-gray-900">{{ team.parentTeam.name }}</p>
            </div>
            
            <div v-if="team.group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <p class="text-sm text-gray-900">{{ team.group.name }}</p>
            </div>
          </div>
        </div>

        <!-- Team Members Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-gray-900">Team Members</h2>
            <span class="text-sm text-gray-500">{{ team.userTeams?.length || 0 }} members</span>
          </div>
          
          <div v-if="team.userTeams && team.userTeams.length > 0" class="space-y-3">
            <div
              v-for="userTeam in team.userTeams"
              :key="userTeam.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">
                    {{ getUserInitials(userTeam.user) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ userTeam.user.displayName || `${userTeam.user.firstName} ${userTeam.user.lastName}` }}
                  </p>
                  <p class="text-xs text-gray-500">{{ userTeam.user.email }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {{ userTeam.role }}
                </span>
                <span class="text-xs text-gray-500">Joined {{ formatDate(userTeam.joinedAt) }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p class="mt-2 text-sm">No members yet</p>
          </div>
        </div>

        <!-- Subteams Card -->
        <div v-if="team.subteams && team.subteams.length > 0" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Subteams</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="subteam in team.subteams"
              :key="subteam.id"
              class="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-gray-900">{{ subteam.name }}</h3>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {{ subteam.type }}
                </span>
              </div>
              
              <p v-if="subteam.description" class="text-sm text-gray-600 mb-2">
                {{ subteam.description }}
              </p>
              
              <div class="flex items-center text-xs text-gray-500">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                {{ subteam.userTeams?.length || 0 }} members
              </div>
            </div>
          </div>
        </div>

        <!-- Team Events Card -->
        <div v-if="team.events && team.events.length > 0" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Team Events</h2>
          
          <div class="space-y-3">
            <div
              v-for="event in team.events"
              :key="event.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 class="font-medium text-gray-900">{{ event.title }}</h3>
                <p class="text-sm text-gray-500">{{ formatDate(event.startTime) }}</p>
              </div>
              
              <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                {{ event.category }}
              </span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div v-if="canDelete" class="bg-white rounded-lg shadow p-6 border border-red-200">
          <h2 class="text-lg font-medium text-red-900 mb-4">Danger Zone</h2>
          
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-red-700">Delete this team permanently</p>
              <p class="text-xs text-red-600">This action cannot be undone</p>
            </div>
            
            <BaseButton
              @click="confirmDelete"
              variant="danger"
              size="sm"
            >
              Delete Team
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Team not found</h3>
          <p class="text-gray-500">The team you're looking for doesn't exist or has been deleted</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Team, User } from '@/types/api'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()
const { can } = usePermissions()

// State
const loading = ref(false)
const team = ref<Team | null>(null)

// Computed properties
const canEdit = computed(() => can('update', 'Team'))
const canDelete = computed(() => can('delete', 'Team'))

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getUserInitials = (user: User) => {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

const editTeam = () => {
  router.push(`/teams/${route.params.id}/edit`)
}

const confirmDelete = async () => {
  if (!team.value) return
  
  if (confirm(`Are you sure you want to delete "${team.value.name}"? This action cannot be undone.`)) {
    try {
      await teamStore.deleteTeam(team.value.id)
      router.push('/teams')
    } catch (error) {
      console.error('Failed to delete team:', error)
    }
  }
}

const loadTeam = async () => {
  try {
    loading.value = true
    const teamData = await teamStore.fetchTeam(route.params.id as string)
    team.value = teamData
  } catch (error) {
    console.error('Failed to load team:', error)
    team.value = null
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadTeam()
})
</script>
