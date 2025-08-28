<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Team</h1>
            <p class="mt-2 text-gray-600">
              Update team information and settings. Changes will be automatically synchronized across all integrated services.
            </p>
          </div>
          <router-link
            :to="`/teams/${teamId}`"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Team
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Form -->
      <div v-else-if="team" class="bg-white rounded-lg shadow">
        <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
          <!-- Basic Information -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.name }"
                  placeholder="Enter team name"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
              </div>

              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
                  Team Type *
                </label>
                <select
                  id="type"
                  v-model="form.type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.type }"
                >
                  <option value="">Select team type</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="DEVELOPMENT">Development</option>
                </select>
                <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
              </div>

              <div>
                <label for="subtype" class="block text-sm font-medium text-gray-700 mb-2">
                  Team Subtype
                </label>
                <select
                  id="subtype"
                  v-model="form.subtype"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.subtype }"
                >
                  <option value="">No subtype</option>
                  <option value="BLUE">Blue Team</option>
                  <option value="RED">Red Team</option>
                  <option value="CTF">CTF</option>
                </select>
                <p v-if="errors.subtype" class="mt-1 text-sm text-red-600">{{ errors.subtype }}</p>
              </div>

              <div>
                <label for="parentTeam" class="block text-sm font-medium text-gray-700 mb-2">
                  Parent Team
                </label>
                <select
                  id="parentTeam"
                  v-model="form.parentTeamId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No parent team</option>
                  <option v-for="parentTeam in availableParentTeams" :key="parentTeam.id" :value="parentTeam.id">
                    {{ parentTeam.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mt-6">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter team description"
              ></textarea>
            </div>
          </div>

          <!-- Team Members -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
            
            <!-- Add Member -->
            <div class="flex gap-4 mb-4">
              <select
                v-model="newMemberId"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a user to add</option>
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.displayName || `${user.firstName} ${user.lastName}` }}
                </option>
              </select>
              <BaseButton
                type="button"
                @click="addMember"
                :disabled="!newMemberId"
                variant="outline"
              >
                Add Member
              </BaseButton>
            </div>

            <!-- Member List -->
            <div v-if="form.memberIds.length > 0" class="space-y-2">
              <div
                v-for="memberId in form.memberIds"
                :key="memberId"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span class="text-sm text-gray-900">
                  {{ getUserName(memberId) }}
                </span>
                <BaseButton
                  type="button"
                  @click="removeMember(memberId)"
                  variant="ghost"
                  size="sm"
                  class="text-red-600 hover:text-red-800"
                >
                  Remove
                </BaseButton>
              </div>
            </div>

            <div v-else class="text-center py-4 text-gray-500">
              No members added yet
            </div>

            <p v-if="errors.members" class="mt-1 text-sm text-red-600">{{ errors.members }}</p>
          </div>

          <!-- Provisioning Options -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Integration Services</h3>
            <p class="text-sm text-gray-600 mb-4">
              Choose which external services to integrate with this team. Authentik and Nextcloud groups are always updated.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Wiki.js -->
              <div class="flex items-center">
                <input
                  id="wikijs"
                  v-model="form.provisioningOptions.wikijs"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="wikijs" class="ml-2 block text-sm text-gray-900">
                  <span class="font-medium">Wiki.js</span>
                  <span class="text-gray-500 block">Update team documentation page</span>
                </label>
              </div>

              <!-- Nextcloud Folder -->
              <div class="flex items-center">
                <input
                  id="nextcloudFolder"
                  v-model="form.provisioningOptions.nextcloudFolder"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="nextcloudFolder" class="ml-2 block text-sm text-gray-900">
                  <span class="font-medium">Nextcloud Folder</span>
                  <span class="text-gray-500 block">Update shared team folder</span>
                </label>
              </div>

              <!-- Nextcloud Calendar -->
              <div class="flex items-center">
                <input
                  id="nextcloudCalendar"
                  v-model="form.provisioningOptions.nextcloudCalendar"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="nextcloudCalendar" class="ml-2 block text-sm text-gray-900">
                  <span class="font-medium">Nextcloud Calendar</span>
                  <span class="text-gray-500 block">Update team calendar</span>
                </label>
              </div>

              <!-- Nextcloud Deck -->
              <div class="flex items-center">
                <input
                  id="nextcloudDeck"
                  v-model="form.provisioningOptions.nextcloudDeck"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="nextcloudDeck" class="ml-2 block text-sm text-gray-900">
                  <span class="font-medium">Nextcloud Deck</span>
                  <span class="text-gray-500 block">Update team project board</span>
                </label>
              </div>

              <!-- GitHub -->
              <div class="flex items-center">
                <input
                  id="github"
                  v-model="form.provisioningOptions.github"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="github" class="ml-2 block text-sm text-gray-900">
                  <span class="font-medium">GitHub</span>
                  <span class="text-gray-500 block">Update team and repository</span>
                </label>
              </div>

              <!-- Discord -->
              <div class="flex items-center">
                <input
                  id="discord"
                  v-model="form.provisioningOptions.discord"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="discord" class="ml-2 block text-sm text-gray-900">
                  <span class="font-medium">Discord</span>
                  <span class="text-gray-500 block">Update team role and channel</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <BaseButton
              type="button"
              variant="outline"
              @click="$router.push(`/teams/${teamId}`)"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
              :loading="submitting"
              :disabled="!isFormValid"
            >
              Update Team
            </BaseButton>
          </div>
        </form>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import { useUserStore } from '@/stores/userStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Team, TeamUpdate } from '@/types/api'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()
const userStore = useUserStore()
const { can } = usePermissions()

// Check permissions
const canEdit = computed(() => can('update', 'Team'))

// State
const loading = ref(false)
const submitting = ref(false)
const team = ref<Team | null>(null)
const newMemberId = ref('')
const errors = ref<Record<string, string>>({})

// Route params
const teamId = computed(() => route.params.id as string)

// Form data
const form = reactive({
  name: '',
  type: '',
  subtype: '',
  description: '',
  parentTeamId: '',
  groupId: '',
  memberIds: [] as string[],
  provisioningOptions: {
    authentik: true, // Always enabled
    nextcloudGroup: true, // Always enabled
    wikijs: false,
    nextcloudFolder: false,
    nextcloudCalendar: false,
    nextcloudDeck: false,
    github: false,
    discord: false,
  }
})

// Computed properties
const availableUsers = computed(() => {
  return userStore.users.filter(user => user.isActive)
})

const availableParentTeams = computed(() => {
  return teamStore.teams.filter(t => t.id !== teamId.value)
})

const isFormValid = computed(() => {
  return form.name && 
         form.type && 
         form.memberIds.length > 0
})

// Methods
const getUserName = (userId: string) => {
  const user = userStore.users.find(u => u.id === userId)
  return user ? (user.displayName || `${user.firstName} ${user.lastName}`) : 'Unknown User'
}

const addMember = () => {
  if (!newMemberId.value) return
  
  if (!form.memberIds.includes(newMemberId.value)) {
    form.memberIds.push(newMemberId.value)
    newMemberId.value = ''
  }
}

const removeMember = (memberId: string) => {
  const index = form.memberIds.indexOf(memberId)
  if (index > -1) {
    form.memberIds.splice(index, 1)
  }
}

const validateForm = () => {
  errors.value = {}

  if (!form.name.trim()) {
    errors.value.name = 'Team name is required'
  }

  if (!form.type) {
    errors.value.type = 'Team type is required'
  }

  if (form.memberIds.length === 0) {
    errors.value.members = 'At least one member is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  try {
    const updateData: TeamUpdate = {
      name: form.name,
      type: form.type as 'COMPETITION' | 'DEVELOPMENT',
      subtype: form.subtype as 'BLUE' | 'RED' | 'CTF' | undefined,
      description: form.description,
      parentTeamId: form.parentTeamId || undefined,
      groupId: form.groupId || undefined,
      memberIds: form.memberIds,
      provisioningOptions: form.provisioningOptions
    }
    
    await teamStore.updateTeam(teamId.value, updateData)
    router.push(`/teams/${teamId.value}`)
  } catch (error) {
    console.error('Failed to update team:', error)
  } finally {
    submitting.value = false
  }
}

const loadTeam = async () => {
  try {
    loading.value = true
    const teamData = await teamStore.fetchTeam(teamId.value)
    team.value = teamData
    
    Object.assign(form, {
      name: teamData.name,
      type: teamData.type,
      subtype: teamData.subtype || '',
      description: teamData.description || '',
      parentTeamId: teamData.parentTeamId || '',
      groupId: teamData.groupId || '',
      memberIds: teamData.userTeams?.map((ut: any) => ut.userId) || [],
      provisioningOptions: (teamData as any).provisioningOptions || {
        authentik: true, // Always enabled
        nextcloudGroup: true, // Always enabled
        wikijs: false,
        nextcloudFolder: false,
        nextcloudCalendar: false,
        nextcloudDeck: false,
        github: false,
        discord: false,
      }
    })
  } catch (error) {
    console.error('Failed to load team:', error)
    team.value = null
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    teamStore.fetchTeams()
  ])
  
  await loadTeam()
})
</script>
