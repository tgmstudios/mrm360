<template>
  <div class="space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-100">
              {{ isEditing ? 'Edit Team' : 'Create New Team' }}
            </h1>
            <p class="mt-2 text-sm text-gray-400">
              {{ isEditing ? 'Update team information and settings' : 'Set up a new team with members and configuration. The team will be automatically provisioned across all integrated services.' }}
            </p>
          </div>
          <router-link
            to="/teams"
            class="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Teams
          </router-link>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Form -->
          <div class="bg-gray-800 rounded-lg shadow border border-gray-700">
            <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
          <!-- Basic Information -->
          <div>
            <h3 class="text-lg font-medium text-gray-100 mb-4">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  :class="{ 'border-red-500': errors.name }"
                  placeholder="Enter team name"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-400">{{ errors.name }}</p>
              </div>

              <div>
                <label for="type" class="block text-sm font-medium text-gray-300 mb-2">
                  Team Type *
                </label>
                <select
                  id="type"
                  v-model="form.type"
                  required
                  class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  :class="{ 'border-red-500': errors.type }"
                >
                  <option value="">Select team type</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="DEVELOPMENT">Development</option>
                </select>
                <p v-if="errors.type" class="mt-1 text-sm text-red-400">{{ errors.type }}</p>
              </div>

              <div>
                <label for="subtype" class="block text-sm font-medium text-gray-300 mb-2">
                  Team Subtype
                </label>
                <select
                  id="subtype"
                  v-model="form.subtype"
                  class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  :class="{ 'border-red-500': errors.subtype }"
                >
                  <option value="">No subtype</option>
                  <option value="BLUE">Blue Team</option>
                  <option value="RED">Red Team</option>
                  <option value="CTF">CTF</option>
                </select>
                <p v-if="errors.subtype" class="mt-1 text-sm text-red-400">{{ errors.subtype }}</p>
              </div>

              <div>
                <label for="parentTeam" class="block text-sm font-medium text-gray-300 mb-2">
                  Parent Team
                </label>
                <select
                  id="parentTeam"
                  v-model="form.parentTeamId"
                  class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                >
                  <option value="">No parent team</option>
                  <option v-for="team in availableParentTeams" :key="team.id" :value="team.id">
                    {{ team.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mt-6">
              <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                placeholder="Enter team description"
              ></textarea>
            </div>
          </div>

          <!-- Provisioning Options -->
          <div>
            <h3 class="text-lg font-medium text-gray-100 mb-4">Integration Services</h3>
            <p class="text-sm text-gray-400 mb-4">
              Choose which external services to integrate with this team. Authentik and Nextcloud groups are always created.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Wiki.js -->
              <div class="flex items-center">
                <input
                  id="wikijs"
                  v-model="form.provisioningOptions.wikijs"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
                <label for="wikijs" class="ml-2 block text-sm text-gray-300">
                  <span class="font-medium">Wiki.js</span>
                  <span class="text-gray-400 block">Create team documentation page</span>
                </label>
              </div>

              <!-- Nextcloud Folder -->
              <div class="flex items-center">
                <input
                  id="nextcloudFolder"
                  v-model="form.provisioningOptions.nextcloudFolder"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
                <label for="nextcloudFolder" class="ml-2 block text-sm text-gray-300">
                  <span class="font-medium">Nextcloud Folder</span>
                  <span class="text-gray-400 block">Create shared team folder</span>
                </label>
              </div>

              <!-- Nextcloud Calendar -->
              <div class="flex items-center">
                <input
                  id="nextcloudCalendar"
                  v-model="form.provisioningOptions.nextcloudCalendar"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
                <label for="nextcloudCalendar" class="ml-2 block text-sm text-gray-300">
                  <span class="font-medium">Nextcloud Calendar</span>
                  <span class="text-gray-400 block">Create team calendar</span>
                </label>
              </div>

              <!-- Nextcloud Deck -->
              <div class="flex items-center">
                <input
                  id="nextcloudDeck"
                  v-model="form.provisioningOptions.nextcloudDeck"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
                <label for="nextcloudDeck" class="ml-2 block text-sm text-gray-300">
                  <span class="font-medium">Nextcloud Deck</span>
                  <span class="text-gray-400 block">Create team project board</span>
                </label>
              </div>

              <!-- GitHub -->
              <div class="flex items-center">
                <input
                  id="github"
                  v-model="form.provisioningOptions.github"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
                <label for="github" class="ml-2 block text-sm text-gray-300">
                  <span class="font-medium">GitHub</span>
                  <span class="text-gray-400 block">Create team and repository</span>
                </label>
              </div>

              <!-- Discord -->
              <div class="flex items-center">
                <input
                  id="discord"
                  v-model="form.provisioningOptions.discord"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
                <label for="discord" class="ml-2 block text-sm text-gray-300">
                  <span class="font-medium">Discord</span>
                  <span class="text-gray-400 block">Create team role and channel</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <router-link
              to="/teams"
              class="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </router-link>
            <BaseButton
              type="submit"
              :loading="submitting"
              :disabled="!isFormValid"
            >
              {{ isEditing ? 'Update Team' : 'Create Team' }}
            </BaseButton>
          </div>
        </form>
      </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Team Members Card -->
          <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
                Team Members
              </h3>
              
              <!-- Add Member Section -->
              <div class="space-y-4 mb-6">
                <div class="space-y-3">
                  <select
                    v-model="newMemberId"
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  >
                    <option value="">Select a user to add</option>
                    <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                      {{ user.displayName || `${user.firstName} ${user.lastName}` }}
                    </option>
                  </select>
                  
                  <select
                    v-model="selectedRole"
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="LEADER">Leader</option>
                  </select>
                  
                  <BaseButton
                    @click="addMember"
                    type="button"
                    variant="outline"
                    size="sm"
                    :disabled="!newMemberId"
                    class="w-full"
                  >
                    Add Member
                  </BaseButton>
                </div>
              </div>

              <!-- Members List -->
              <div v-if="form.members.length > 0" class="space-y-3">
                <div
                  v-for="(member, index) in form.members"
                  :key="index"
                  class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-white">
                        {{ getUserInitials(getUserById(member.userId)) }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-100 truncate">
                        {{ getUserById(member.userId)?.displayName || `${getUserById(member.userId)?.firstName} ${getUserById(member.userId)?.lastName}` }}
                      </p>
                      <p class="text-xs text-gray-400 truncate">{{ getUserById(member.userId)?.email }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 bg-blue-900 text-blue-200 rounded-full text-xs font-medium">
                      {{ member.role }}
                    </span>
                    <button
                      @click="removeMember(index)"
                      type="button"
                      class="text-red-400 hover:text-red-300"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-4">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-100">No members added</h3>
                <p class="mt-1 text-sm text-gray-400">
                  Add team members to get started.
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Stats Card -->
          <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
                Team Summary
              </h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-400">Team Members</dt>
                  <dd class="mt-1 text-2xl font-semibold text-gray-100">
                    {{ form.members.length }}
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-400">Team Type</dt>
                  <dd class="mt-1 text-sm text-gray-100">
                    {{ form.type || 'Not selected' }}
                  </dd>
                </div>
                
                <div v-if="form.subtype">
                  <dt class="text-sm font-medium text-gray-400">Subtype</dt>
                  <dd class="mt-1 text-sm text-gray-100">
                    {{ form.subtype }}
                  </dd>
                </div>
              </dl>
            </div>
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
import type { Team, TeamCreate, TeamUpdate, User } from '@/types/api'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()
const userStore = useUserStore()
const { can } = usePermissions()

// Check permissions
const canEdit = computed(() => can('update', 'Team'))
const canCreate = computed(() => can('create', 'Team'))

// State
const loading = ref(false)
const submitting = ref(false)
const newMemberId = ref('')
const selectedRole = ref('MEMBER')
const errors = ref<Record<string, string>>({})

// Form data
const form = reactive({
  name: '',
  type: '',
  subtype: '',
  description: '',
  parentTeamId: '',
  groupId: '',
  members: [] as { userId: string; role: 'MEMBER' | 'LEADER' }[],
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
const isEditing = computed(() => !!route.params.id)

const availableUsers = computed(() => {
  return userStore.users.filter(user => user.isActive)
})

const availableParentTeams = computed(() => {
  return teamStore.teams.filter(team => team.id !== route.params.id)
})

const isFormValid = computed(() => {
  return form.name && 
         form.type && 
         form.members.length > 0
})

// Methods
const getUserName = (userId: string) => {
  const user = userStore.users.find(u => u.id === userId)
  return user ? (user.displayName || `${user.firstName} ${user.lastName}`) : 'Unknown User'
}

const getUserById = (userId: string) => {
  return userStore.users.find(u => u.id === userId)
}

const getUserInitials = (user: any) => {
  if (!user?.firstName || !user?.lastName) return '?'
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

const addMember = () => {
  if (!newMemberId.value) return
  
  const existingMember = form.members.find(m => m.userId === newMemberId.value)
  if (existingMember) {
    // If user is already a member, update their role
    existingMember.role = selectedRole.value as 'MEMBER' | 'LEADER'
  } else {
    // Otherwise, add a new member
    form.members.push({ userId: newMemberId.value, role: selectedRole.value as 'MEMBER' | 'LEADER' })
  }
  newMemberId.value = ''
  selectedRole.value = 'MEMBER'
}

const removeMember = (index: number) => {
  form.members.splice(index, 1)
}

const validateForm = () => {
  errors.value = {}

  if (!form.name.trim()) {
    errors.value.name = 'Team name is required'
  }

  if (!form.type) {
    errors.value.type = 'Team type is required'
  }

  if (form.members.length === 0) {
    errors.value.members = 'At least one member is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  try {
    if (isEditing.value) {
      const updateData: TeamUpdate = {
        name: form.name,
        type: form.type as 'COMPETITION' | 'DEVELOPMENT',
        subtype: form.subtype as 'BLUE' | 'RED' | 'CTF' | undefined,
        description: form.description,
        parentTeamId: form.parentTeamId || undefined,
        groupId: form.groupId || undefined,
        members: form.members
      }
      
      await teamStore.updateTeam(route.params.id as string, updateData)
      router.push(`/teams/${route.params.id}`)
    } else {
      const createData: TeamCreate = {
        name: form.name,
        type: form.type as 'COMPETITION' | 'DEVELOPMENT',
        subtype: form.subtype as 'BLUE' | 'RED' | 'CTF' | undefined,
        description: form.description,
        parentTeamId: form.parentTeamId || undefined,
        groupId: form.groupId || undefined,
        members: form.members
      }
      
      const newTeam = await teamStore.createTeam(createData)
      router.push(`/teams/${newTeam.id}`)
    }
  } catch (error) {
    console.error('Failed to save team:', error)
  } finally {
    submitting.value = false
  }
}

const loadTeam = async () => {
  if (!isEditing.value) return
  
  try {
    loading.value = true
    const team = await teamStore.fetchTeam(route.params.id as string)
    
    Object.assign(form, {
      name: team.name,
      type: team.type,
      subtype: team.subtype || '',
      description: team.description || '',
      parentTeamId: team.parentTeamId || '',
      groupId: team.groupId || '',
      members: team.userTeams?.map((ut: any) => ({ userId: ut.userId, role: ut.role })) || [],
      provisioningOptions: {
        authentik: true, // Always enabled
        nextcloudGroup: true, // Always enabled
        wikijs: team.provisioningOptions?.wikijs || false,
        nextcloudFolder: team.provisioningOptions?.nextcloudFolder || false,
        nextcloudCalendar: team.provisioningOptions?.nextcloudCalendar || false,
        nextcloudDeck: team.provisioningOptions?.nextcloudDeck || false,
        github: team.provisioningOptions?.github || false,
        discord: team.provisioningOptions?.discord || false,
      }
    })
  } catch (error) {
    console.error('Failed to load team:', error)
    router.push('/teams')
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
  
  if (isEditing.value) {
    await loadTeam()
  }
})
</script>
