<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ isEditing ? 'Edit Team' : 'Create New Team' }}
            </h1>
            <p class="mt-2 text-gray-600">
              {{ isEditing ? 'Update team information and settings' : 'Set up a new team with members and configuration' }}
            </p>
          </div>
          <router-link
            to="/teams"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Teams
          </router-link>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow">
        <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
          <!-- Provisioning Progress -->
          <div v-if="provisionTask" class="mb-4 p-4 border border-blue-200 rounded-md bg-blue-50">
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium text-blue-800">Setting up team resources</div>
              <div class="text-sm text-blue-700">{{ provisionTask.progress }}%</div>
            </div>
            <div class="w-full bg-blue-100 rounded h-2 overflow-hidden">
              <div class="bg-blue-600 h-2" :style="{ width: provisionTask.progress + '%' }"></div>
            </div>
            <ul class="mt-3 space-y-1">
              <li v-for="sub in sortedSubtasks" :key="sub.id" class="flex items-center text-sm">
                <span class="w-4 h-4 mr-2" :class="{
                  'text-green-600': sub.status === 'COMPLETED',
                  'text-blue-600': sub.status === 'RUNNING',
                  'text-gray-400': sub.status === 'PENDING',
                  'text-red-600': sub.status === 'FAILED'
                }">
                  <svg v-if="sub.status === 'COMPLETED'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <svg v-else-if="sub.status === 'RUNNING'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  <svg v-else-if="sub.status === 'FAILED'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </span>
                <span class="flex-1 text-blue-900">{{ sub.name }}</span>
                <span class="text-xs text-blue-700">{{ sub.progress }}%</span>
              </li>
            </ul>
          </div>
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
                  <option value="committee">Committee</option>
                  <option value="project">Project Team</option>
                  <option value="working-group">Working Group</option>
                  <option value="special">Special Team</option>
                </select>
                <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.description }"
                  placeholder="Describe the team's purpose and responsibilities"
                ></textarea>
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
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
                  <option
                    v-for="team in availableParentTeams"
                    :key="team.id"
                    :value="team.id"
                  >
                    {{ team.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Team Settings -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Team Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="maxMembers" class="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members
                </label>
                <input
                  id="maxMembers"
                  v-model.number="form.maxMembers"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.maxMembers }"
                  placeholder="Leave empty for unlimited"
                />
                <p v-if="errors.maxMembers" class="mt-1 text-sm text-red-600">{{ errors.maxMembers }}</p>
              </div>

              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  v-model="form.status"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.status }"
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
                <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
              </div>

              <div class="md:col-span-2">
                <div class="flex items-center">
                  <input
                    id="isPublic"
                    v-model="form.isPublic"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="isPublic" class="ml-2 block text-sm text-gray-900">
                    Public team (visible to all members)
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Members -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
            <div class="space-y-4">
              <!-- Add Member -->
              <div class="flex gap-3">
                <select
                  v-model="newMemberId"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a member to add</option>
                  <option
                    v-for="user in availableUsers"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.name }} ({{ user.email }})
                  </option>
                </select>
                <button
                  type="button"
                  @click="addMember"
                  :disabled="!newMemberId"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Add Member
                </button>
              </div>

              <!-- Members List -->
              <div v-if="form.members.length > 0" class="border border-gray-200 rounded-lg">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-sm font-medium text-gray-900">Current Members ({{ form.members.length }})</h4>
                </div>
                <ul class="divide-y divide-gray-200">
                  <li
                    v-for="member in form.members"
                    :key="member.id"
                    class="px-4 py-3 flex items-center justify-between"
                  >
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ member.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">{{ member.name }}</p>
                        <p class="text-sm text-gray-500">{{ member.email }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <select
                        v-model="member.role"
                        class="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="member">Member</option>
                        <option value="leader">Leader</option>
                        <option value="coordinator">Coordinator</option>
                      </select>
                      <button
                        type="button"
                        @click="removeMember(member.id)"
                        class="text-red-600 hover:text-red-800"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- No Members State -->
              <div v-else class="text-center py-8 text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p class="mt-2 text-sm">No members added yet</p>
                <p class="text-xs">Add members using the form above</p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <router-link
              to="/teams"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </router-link>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditing ? 'Update Team' : 'Create Team' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import { useUserStore } from '@/stores/userStore'
import { useTaskStore } from '@/stores/taskStore'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from 'vue-toastification'
import type { Team, User, TeamMember, Task } from '@/types/api'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()
const taskStore = useTaskStore()
const userStore = useUserStore()
const { can } = usePermissions()
const toast = useToast()

// Check permissions
if (!can('manage', 'teams')) {
  router.push('/teams')
}

// Reactive data
const loading = ref(false)
const newMemberId = ref('')
const errors = ref<Record<string, string>>({})
const provisionTask = ref<Task | null>(null)
let provisionTimer: number | null = null

// Form data
const form = ref({
  name: '',
  type: '',
  description: '',
  parentTeamId: '',
  maxMembers: null as number | null,
  status: '',
  isPublic: false,
  members: [] as TeamMember[]
})

// Computed properties
const isEditing = computed(() => !!route.params.id)
const teamId = computed(() => route.params.id as string)

const availableParentTeams = computed(() => {
  return teamStore.teams.filter(team => 
    team.id !== teamId.value && team.status === 'active'
  )
})

const availableUsers = computed(() => {
  const currentMemberIds = form.value.members.map(m => m.id)
  return userStore.users.filter(user => 
    !currentMemberIds.includes(user.id) && user.status === 'active'
  )
})

const isFormValid = computed(() => {
  return form.value.name && 
         form.value.type && 
         form.value.status &&
         form.value.members.length > 0
})

// Methods
const addMember = () => {
  if (!newMemberId.value) return

  const user = userStore.users.find(u => u.id === newMemberId.value)
  if (!user) return

  const member: TeamMember = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'member',
    joinedAt: new Date().toISOString()
  }

  form.value.members.push(member)
  newMemberId.value = ''
}

const removeMember = (memberId: string) => {
  const index = form.value.members.findIndex(m => m.id === memberId)
  if (index > -1) {
    form.value.members.splice(index, 1)
  }
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Team name is required'
  }

  if (!form.value.type) {
    errors.value.type = 'Team type is required'
  }

  if (!form.value.status) {
    errors.value.status = 'Team status is required'
  }

  if (form.value.maxMembers && form.value.maxMembers < form.value.members.length) {
    errors.value.maxMembers = 'Maximum members cannot be less than current member count'
  }

  if (form.value.members.length === 0) {
    errors.value.members = 'At least one member is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    if (isEditing.value) {
      await teamStore.updateTeam(teamId.value, form.value)
      toast.success('Team updated successfully')
    } else {
      const created = await teamStore.createTeam(form.value)
      startProvisionPolling('TEAM', created.id)
      toast.success('Team created successfully')
    }
    router.push('/tasks')
  } catch (error) {
    toast.error(isEditing.value ? 'Failed to update team' : 'Failed to create team')
    console.error('Error saving team:', error)
  } finally {
    loading.value = false
  }
}

const loadTeam = async () => {
  if (!isEditing.value) return

  try {
    const team = await teamStore.fetchTeam(teamId.value)
    if (team) {
      form.value = {
        name: team.name,
        type: team.type,
        description: team.description || '',
        parentTeamId: team.parentTeamId || '',
        maxMembers: team.maxMembers || null,
        status: team.status,
        isPublic: team.isPublic || false,
        members: team.members || []
      }
    }
  } catch (error) {
    toast.error('Failed to load team')
    console.error('Error loading team:', error)
    router.push('/teams')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    teamStore.fetchTeams(),
    userStore.fetchUsers()
  ])
  
  if (isEditing.value) {
    await loadTeam()
  }
})

// Watchers
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadTeam()
  }
})

const startProvisionPolling = (entityType: 'EVENT' | 'TEAM', entityId: string) => {
  if (provisionTimer) {
    clearInterval(provisionTimer)
    provisionTimer = null
  }
  provisionTask.value = {
    id: '',
    name: 'Provision',
    status: 'RUNNING',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: []
  } as any
  provisionTimer = window.setInterval(async () => {
    try {
      const resp = await taskStore.fetchTasks({ entityType, entityId, page: 1, limit: 1 })
      const task = resp.data[0]
      if (task) {
        provisionTask.value = task as any
        if (task.status === 'COMPLETED' || task.status === 'FAILED') {
          if (provisionTimer) clearInterval(provisionTimer)
          provisionTimer = null
        }
      }
    } catch (e) {
      // ignore polling errors
    }
  }, 1000)
}

const sortedSubtasks = computed(() => (provisionTask.value?.subtasks || []).slice().sort((a, b) => a.stepIndex - b.stepIndex))
</script>
