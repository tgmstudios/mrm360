<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ group?.name }}</h1>
            <p class="text-gray-600 mt-2">{{ group?.description || 'No description available' }}</p>
            <div class="flex items-center space-x-4 mt-3">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  group?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ group?.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
              <span class="text-sm text-gray-500">{{ group?.type || 'No type' }}</span>
              <span class="text-sm text-gray-500">{{ group?.memberCount || 0 }} members</span>
            </div>
          </div>
          <div class="flex space-x-3">
            <BaseButton
              v-if="canUpdateGroup"
              @click="editGroup"
              variant="secondary"
              size="lg"
            >
              Edit Group
            </BaseButton>
            <BaseButton
              v-if="canDeleteGroup"
              @click="deleteGroup"
              variant="danger"
              size="lg"
            >
              Delete Group
            </BaseButton>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Group Information -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Group Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-2">Details</h3>
                <div class="space-y-3">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Type</p>
                      <p class="text-sm text-gray-600">{{ group?.type || 'Not specified' }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Created</p>
                      <p class="text-sm text-gray-600">{{ formatDate(group?.createdAt) }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Last Updated</p>
                      <p class="text-sm text-gray-600">{{ formatDate(group?.updatedAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-2">Statistics</h3>
                <div class="space-y-3">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Total Members</p>
                      <p class="text-sm text-gray-600">{{ group?.memberCount || 0 }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Events</p>
                      <p class="text-sm text-gray-600">{{ group?.events?.length || 0 }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Teams</p>
                      <p class="text-sm text-gray-600">{{ group?.teams?.length || 0 }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Members Management -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Members</h2>
              <div class="flex space-x-3">
                <BaseButton
                  v-if="canManageMembers"
                  @click="showAddMemberModal = true"
                  variant="primary"
                  size="sm"
                >
                  Add Member
                </BaseButton>
                <BaseButton
                  @click="refreshMembers"
                  variant="outline"
                  size="sm"
                  :loading="refreshing"
                >
                  Refresh
                </BaseButton>
              </div>
            </div>
            
            <div v-if="loadingMembers" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            
            <div v-else-if="group?.members && group.members.length > 0" class="space-y-3">
              <div
                v-for="member in group.members"
                :key="member.userId"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">
                      {{ getInitials(member.user?.name || 'Unknown') }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ member.user?.name || 'Unknown User' }}</p>
                    <p class="text-sm text-gray-500">{{ member.user?.email || 'No email' }}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      member.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ member.role === 'admin' ? 'Admin' : 
                       member.role === 'moderator' ? 'Moderator' : 'Member' }}
                  </span>
                  
                  <BaseButton
                    v-if="canManageMembers"
                    @click="removeMember(member.userId)"
                    variant="danger"
                    size="sm"
                  >
                    Remove
                  </BaseButton>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8 text-gray-500">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-lg font-medium text-gray-900 mb-2">No members yet</p>
              <p class="text-gray-500">Start building your group by adding members</p>
              <div v-if="canManageMembers" class="mt-4">
                <BaseButton
                  @click="showAddMemberModal = true"
                  variant="primary"
                >
                  Add First Member
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Related Events -->
          <div v-if="group?.events && group.events.length > 0" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Related Events</h2>
            <div class="space-y-3">
              <div
                v-for="event in group.events"
                :key="event.id"
                class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                @click="goToEvent(event.id)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ event.title }}</p>
                    <p class="text-sm text-gray-500">{{ formatDate(event.startDate) }} at {{ formatTime(event.startDate) }}</p>
                  </div>
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ event.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Teams -->
          <div v-if="group?.teams && group.teams.length > 0" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Related Teams</h2>
            <div class="space-y-3">
              <div
                v-for="team in group.teams"
                :key="team.id"
                class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                @click="goToTeam(team.id)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ team.name }}</p>
                    <p class="text-sm text-gray-500">{{ team.type }}</p>
                  </div>
                  <span class="text-sm text-gray-500">{{ team.memberCount || 0 }} members</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Group Actions -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Group Actions</h3>
            <div class="space-y-3">
              <BaseButton
                v-if="canUpdateGroup"
                @click="editGroup"
                variant="secondary"
                class="w-full"
              >
                Edit Group
              </BaseButton>
              <BaseButton
                v-if="canManageMembers"
                @click="showAddMemberModal = true"
                variant="primary"
                class="w-full"
              >
                Add Member
              </BaseButton>
              <BaseButton
                v-if="canDeleteGroup"
                @click="deleteGroup"
                variant="danger"
                class="w-full"
              >
                Delete Group
              </BaseButton>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div class="space-y-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ group?.memberCount || 0 }}</p>
                <p class="text-sm text-blue-600">Total Members</p>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <p class="text-2xl font-bold text-green-600">{{ group?.events?.length || 0 }}</p>
                <p class="text-sm text-green-600">Events</p>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <p class="text-2xl font-bold text-purple-600">{{ group?.teams?.length || 0 }}</p>
                <p class="text-sm text-purple-600">Teams</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <BaseModal
      v-model="showAddMemberModal"
      title="Add Member to Group"
      size="md"
    >
      <div class="space-y-4">
        <div>
          <label for="searchUser" class="block text-sm font-medium text-gray-700 mb-2">
            Search User
          </label>
          <input
            id="searchUser"
            v-model="memberSearchQuery"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name or email"
            @input="searchUsers"
          />
          <div v-if="memberSearchResults.length > 0" class="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
            <div
              v-for="user in memberSearchResults"
              :key="user.id"
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
              @click="selectUserForGroup(user)"
            >
              <p class="font-medium text-gray-900">{{ user.name }}</p>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="selectedUserForGroup" class="p-3 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">{{ selectedUserForGroup.name }}</p>
              <p class="text-sm text-gray-500">{{ selectedUserForGroup.email }}</p>
            </div>
            <BaseButton
              @click="addMemberToGroup"
              variant="primary"
              :loading="addingMember"
            >
              Add to Group
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/groupStore'
import { useUserStore } from '@/stores/userStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Group, User } from '@/types/api'

const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const userStore = useUserStore()
const { can } = usePermissions()

const groupId = computed(() => route.params.id as string)

const group = ref<Group | null>(null)
const loadingMembers = ref(false)
const refreshing = ref(false)
const addingMember = ref(false)
const showAddMemberModal = ref(false)
const memberSearchQuery = ref('')
const memberSearchResults = ref<User[]>([])
const selectedUserForGroup = ref<User | null>(null)

const canUpdateGroup = computed(() => can('update', 'Group'))
const canDeleteGroup = computed(() => can('delete', 'Group'))
const canManageMembers = computed(() => can('manageMembers', 'Group'))

onMounted(async () => {
  await loadGroup()
})

const loadGroup = async () => {
  try {
    const groupData = await groupStore.getGroup(groupId.value)
    group.value = groupData
  } catch (error) {
    console.error('Failed to load group:', error)
  }
}

const refreshMembers = async () => {
  refreshing.value = true
  try {
    await loadGroup()
  } finally {
    refreshing.value = false
  }
}

const searchUsers = async () => {
  if (memberSearchQuery.value.length < 2) {
    memberSearchResults.value = []
    return
  }
  
  try {
    const users = await userStore.searchUsers(memberSearchQuery.value)
    // Filter out users already in the group
    const existingMemberIds = group.value?.members?.map(m => m.userId) || []
    memberSearchResults.value = users.filter(user => !existingMemberIds.includes(user.id))
  } catch (error) {
    console.error('Failed to search users:', error)
    memberSearchResults.value = []
  }
}

const selectUserForGroup = (user: User) => {
  selectedUserForGroup.value = user
  memberSearchResults.value = []
  memberSearchQuery.value = user.name
}

const addMemberToGroup = async () => {
  if (!selectedUserForGroup.value) return
  
  addingMember.value = true
  try {
    await groupStore.addMemberToGroup(groupId.value, selectedUserForGroup.value.id)
    await loadGroup()
    
    // Clear selection
    selectedUserForGroup.value = null
    memberSearchQuery.value = ''
    showAddMemberModal.value = false
    
    alert(`${selectedUserForGroup.value?.name} has been added to the group!`)
  } catch (error) {
    console.error('Failed to add member:', error)
    alert('Failed to add member. Please try again.')
  } finally {
    addingMember.value = false
  }
}

const removeMember = async (userId: string) => {
  if (!confirm('Are you sure you want to remove this member from the group?')) return
  
  try {
    await groupStore.removeMemberFromGroup(groupId.value, userId)
    await loadGroup()
  } catch (error) {
    console.error('Failed to remove member:', error)
    alert('Failed to remove member. Please try again.')
  }
}

const editGroup = () => {
  router.push(`/groups/${groupId.value}/edit`)
}

const deleteGroup = async () => {
  if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return
  
  try {
    await groupStore.deleteGroup(groupId.value)
    router.push('/groups')
  } catch (error) {
    console.error('Failed to delete group:', error)
    alert('Failed to delete group. Please try again.')
  }
}

const goToEvent = (eventId: string) => {
  router.push(`/events/${eventId}`)
}

const goToTeam = (teamId: string) => {
  router.push(`/teams/${teamId}`)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString?: string) => {
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
