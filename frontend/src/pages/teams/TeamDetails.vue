<template>
  <div class="max-w-7xl mx-auto p-6">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="!team" class="text-center py-12">
      <div class="text-gray-500">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Team not found</h3>
        <p class="text-gray-500">The team you're looking for doesn't exist</p>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ team.name }}</h1>
            <p class="text-gray-600 mt-2">{{ team.description }}</p>
          </div>
          
          <div class="flex space-x-3">
            <button
              v-if="canEdit"
              @click="editTeam"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Team
            </button>
            <button
              v-if="canDelete"
              @click="deleteTeam"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Team
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-500">Type</p>
              <p class="text-sm text-gray-900 capitalize">{{ team.type }}</p>
            </div>
          </div>
          
          <div class="flex items-center">
            <svg class="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-500">Status</p>
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
          </div>
          
          <div class="flex items-center">
            <svg class="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-500">Members</p>
              <p class="text-sm text-gray-900">{{ team.members?.length || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="team.parentTeam" class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-500">Parent Team</p>
              <router-link
                :to="`/teams/${team.parentTeam.id}`"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ team.parentTeam.name }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Members -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>
        
        <div class="p-6">
          <div v-if="team.members && team.members.length > 0" class="space-y-4">
            <div
              v-for="member in team.members"
              :key="member.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex items-center">
                <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-medium text-sm">
                    {{ member.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">{{ member.name }}</p>
                  <p class="text-sm text-gray-500">{{ member.email }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-4">
                <span
                  :class="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-green-100 text-green-800': member.paidStatus === 'paid',
                    'bg-red-100 text-red-800': member.paidStatus === 'unpaid',
                    'bg-yellow-100 text-yellow-800': member.paidStatus === 'pending'
                  }"
                >
                  {{ member.paidStatus }}
                </span>
                
                <router-link
                  :to="`/users/${member.id}`"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Profile
                </router-link>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8">
            <div class="text-gray-500">
              <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
              <p class="text-gray-500">This team doesn't have any members assigned</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Subteams -->
      <div v-if="subteams.length > 0" class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Subteams</h2>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="subteam in subteams"
              :key="subteam.id"
              class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium text-gray-900">{{ subteam.name }}</h3>
                <span
                  :class="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-green-100 text-green-800': subteam.status === 'active',
                    'bg-red-100 text-red-800': subteam.status === 'inactive'
                  }"
                >
                  {{ subteam.status }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ subteam.description }}</p>
              <p class="text-xs text-gray-500">{{ subteam.members?.length || 0 }} members</p>
              <router-link
                :to="`/teams/${subteam.id}`"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Events -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Team Events</h2>
        </div>
        
        <div class="p-6">
          <div v-if="teamEvents.length > 0" class="space-y-4">
            <div
              v-for="event in teamEvents"
              :key="event.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 class="font-medium text-gray-900">{{ event.title }}</h3>
                <p class="text-sm text-gray-600">{{ event.description }}</p>
                <p class="text-xs text-gray-500">
                  {{ new Date(event.startTime).toLocaleDateString() }} at {{ new Date(event.startTime).toLocaleTimeString() }}
                </p>
              </div>
              
              <div class="flex items-center space-x-4">
                <span
                  :class="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-blue-100 text-blue-800': event.category === 'meeting',
                    'bg-green-100 text-green-800': event.category === 'social',
                    'bg-purple-100 text-purple-800': event.category === 'workshop',
                    'bg-orange-100 text-orange-800': event.category === 'other'
                  }"
                >
                  {{ event.category }}
                </span>
                
                <router-link
                  :to="`/events/${event.id}`"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Event
                </router-link>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8">
            <div class="text-gray-500">
              <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p class="text-gray-500">This team doesn't have any events scheduled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import { useEventStore } from '@/stores/eventStore'
import { usePermissions } from '@/composables/usePermissions'
import type { Team, Event } from '@/types/api'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()
const eventStore = useEventStore()
const { can } = usePermissions()

const loading = ref(false)
const team = ref<Team | null>(null)
const teamEvents = ref<Event[]>([])

const canEdit = computed(() => can('update', 'Team'))
const canDelete = computed(() => can('delete', 'Team'))

const subteams = computed(() => 
  teamStore.teams.filter(t => t.parentTeamId === team.value?.id)
)

onMounted(async () => {
  const teamId = route.params.id as string
  await loadTeamData(teamId)
})

const loadTeamData = async (teamId: string) => {
  try {
    loading.value = true
    
    // Load team data
    const teamData = await teamStore.fetchTeamById(teamId)
    if (teamData) {
      team.value = teamData
      
      // Load team events
      const events = await eventStore.fetchEvents({ linkedTeamId: teamId })
      teamEvents.value = events
    }
  } catch (error) {
    console.error('Failed to load team data:', error)
  } finally {
    loading.value = false
  }
}

const editTeam = () => {
  if (team.value) {
    router.push(`/teams/${team.value.id}/edit`)
  }
}

const deleteTeam = async () => {
  if (!team.value || !confirm('Are you sure you want to delete this team?')) return
  
  try {
    await teamStore.deleteTeam(team.value.id)
    router.push('/teams')
  } catch (error) {
    console.error('Failed to delete team:', error)
  }
}
</script>
