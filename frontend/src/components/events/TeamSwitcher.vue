<template>
  <div v-if="allowTeamSwitching && currentTeam" class="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-100">Your Team</h3>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
        Team {{ currentTeam.teamNumber }}
      </span>
    </div>

    <!-- Current Team Members -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-400 mb-3">Current Team Members</h4>
      <div class="space-y-2">
        <div
          v-for="member in currentTeam.members"
          :key="member.id"
          class="flex items-center justify-between p-2 bg-gray-700 rounded"
        >
          <span class="text-sm text-gray-300">{{ member.displayName }}</span>
          <span v-if="member.id === authStore.user?.id" class="text-xs text-blue-400 font-medium">You</span>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-2">
        {{ currentTeam.memberCount }}/{{ currentTeam.maxMembers }} members
      </p>
    </div>

    <!-- Switch Team Section -->
    <div v-if="availableTeams.length > 0">
      <h4 class="text-sm font-medium text-gray-400 mb-3">Switch to Another Team</h4>
      <div class="space-y-3">
        <div
          v-for="team in availableTeams"
          :key="team.id"
          class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
        >
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="font-medium text-gray-100">Team {{ team.teamNumber }}</span>
              <span class="text-xs text-gray-400">
                {{ team.memberCount }}/{{ team.maxMembers }} members
              </span>
            </div>
            <div class="mt-1">
              <div class="text-xs text-gray-400">
                Members: {{ team.members.map(m => m.displayName).join(', ') }}
              </div>
            </div>
          </div>
          <BaseButton
            @click="switchToTeam(team.id)"
            variant="outline"
            size="sm"
            :loading="switchingTeam === team.id"
            :disabled="!team.hasSpace"
          >
            {{ team.hasSpace ? 'Switch' : 'Full' }}
          </BaseButton>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4">
      <p class="text-sm text-gray-400">No other teams available for switching</p>
    </div>
  </div>

  <div v-else-if="allowTeamSwitching && !currentTeam" class="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
    <div class="text-center mb-6">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-100 mb-2">Join a Team</h3>
      <p class="text-sm text-gray-400 mb-4">
        You need to check in to the event first before you can join or switch teams.
      </p>
    </div>

    <!-- Available Teams to Join -->
    <div v-if="availableTeams.length > 0">
      <h4 class="text-sm font-medium text-gray-400 mb-3">Available Teams</h4>
      <div class="space-y-3">
        <div
          v-for="team in availableTeams"
          :key="team.id"
          class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
        >
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="font-medium text-gray-100">Team {{ team.teamNumber }}</span>
              <span class="text-xs text-gray-400">
                {{ team.memberCount }}/{{ team.maxMembers }} members
              </span>
            </div>
            <div class="mt-1">
              <div class="text-xs text-gray-400">
                Members: {{ team.members.map(m => m.displayName).join(', ') }}
              </div>
            </div>
          </div>
          <BaseButton
            @click="switchToTeam(team.id)"
            variant="outline"
            size="sm"
            :loading="switchingTeam === team.id"
            :disabled="!team.hasSpace"
          >
            {{ team.hasSpace ? 'Join' : 'Full' }}
          </BaseButton>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4">
      <p class="text-sm text-gray-400">No teams available to join</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/services/api'
import BaseButton from '@/components/common/BaseButton.vue'
import { useToast } from 'vue-toastification'

interface TeamMember {
  id: string
  displayName: string
  email: string
}

interface Team {
  id: string
  teamNumber: number
  memberCount: number
  maxMembers: number
  hasSpace: boolean
  members: TeamMember[]
}

interface TeamInfo {
  allowTeamSwitching: boolean
  currentTeam: Team | null
  availableTeams: Team[]
}

const props = defineProps<{
  eventId: string
}>()

const authStore = useAuthStore()
const toast = useToast()

const allowTeamSwitching = ref(false)
const currentTeam = ref<Team | null>(null)
const availableTeams = ref<Team[]>([])
const switchingTeam = ref<string | null>(null)

const loadTeamInfo = async () => {
  try {
    const teamInfo: TeamInfo = await apiService.getUserTeamInfo(props.eventId)
    allowTeamSwitching.value = teamInfo.allowTeamSwitching
    currentTeam.value = teamInfo.currentTeam
    availableTeams.value = teamInfo.availableTeams
  } catch (error) {
    console.error('Failed to load team info:', error)
    toast.error('Failed to load team information')
  }
}

const switchToTeam = async (targetTeamId: string) => {
  switchingTeam.value = targetTeamId
  
  try {
    const result = await apiService.switchTeam(props.eventId, targetTeamId)
    
    if (result.success) {
      toast.success(result.message)
      // Reload team info to reflect the change
      await loadTeamInfo()
    } else {
      toast.error(result.message || 'Failed to switch teams')
    }
  } catch (error: any) {
    console.error('Failed to switch team:', error)
    const errorMessage = error.response?.data?.error || 'Failed to switch teams'
    toast.error(errorMessage)
  } finally {
    switchingTeam.value = null
  }
}

onMounted(() => {
  loadTeamInfo()
})
</script>
