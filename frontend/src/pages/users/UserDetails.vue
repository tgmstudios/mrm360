<template>
  <div v-if="user" class="space-y-6">
    <!-- Page Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ user.displayName }}</h1>
        <p class="mt-2 text-sm text-gray-700">
          Member profile and details
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
        <BaseButton
          v-if="can('update', 'User')"
          variant="outline"
          @click="showEditModal = true"
        >
          Edit Profile
        </BaseButton>
        <BaseButton
          v-if="can('delete', 'User')"
          variant="danger"
          @click="showDeleteModal = true"
        >
          Delete Member
        </BaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Information -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info Card -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Full Name</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ user.firstName }} {{ user.lastName }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <a :href="`mailto:${user.email}`" class="text-indigo-600 hover:text-indigo-900">
                    {{ user.email }}
                  </a>
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Display Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.displayName }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Member Since</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatDate(user.createdAt) }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="mt-1">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd class="mt-1">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      user.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ user.isPaid ? 'Paid' : 'Unpaid' }}
                  </span>
                </dd>
              </div>
              
              <div v-if="user.paidUntil">
                <dt class="text-sm font-medium text-gray-500">Paid Until</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatDate(user.paidUntil) }}
                </dd>
              </div>
              
              <div v-if="user.avatar">
                <dt class="text-sm font-medium text-gray-500">Avatar</dt>
                <dd class="mt-1">
                  <img
                    :src="user.avatar"
                    :alt="user.displayName"
                    class="h-16 w-16 rounded-full"
                  />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Teams Card -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Teams
            </h3>
            <div v-if="user.teams.length > 0" class="space-y-3">
              <div
                v-for="team in user.teams"
                :key="team.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ team.name }}</h4>
                  <p class="text-sm text-gray-500">{{ team.type }}</p>
                  <p v-if="team.description" class="text-sm text-gray-500 mt-1">
                    {{ team.description }}
                  </p>
                </div>
                <router-link
                  :to="`/teams/${team.id}`"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View Team
                </router-link>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No teams assigned</h3>
              <p class="mt-1 text-sm text-gray-500">
                This member is not currently assigned to any teams.
              </p>
            </div>
          </div>
        </div>

        <!-- Events Card -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Events
            </h3>
            <div v-if="user.events.length > 0" class="space-y-3">
              <div
                v-for="event in user.events"
                :key="event.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ event.title }}</h4>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(event.startTime) }} - {{ formatDate(event.endTime) }}
                  </p>
                </div>
                <router-link
                  :to="`/events/${event.id}`"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View Event
                </router-link>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <CalendarIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No events</h3>
              <p class="mt-1 text-sm text-gray-500">
                This member hasn't attended any events yet.
              </p>
            </div>
          </div>
        </div>

        <!-- Authentik Groups Card -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Groups
            </h3>
            <div v-if="groupStore.isLoading" class="text-center py-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-500">Loading groups...</p>
            </div>
            <div v-else-if="userGroups.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="group in userGroups"
                :key="group.id"
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  group.found 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-600'
                ]"
                :title="group.description || group.name"
              >
                {{ group.name }}
              </span>
            </div>
            <div v-else class="text-center py-4">
              <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No groups</h3>
              <p class="mt-1 text-sm text-gray-500">
                This member is not assigned to any Authentik groups.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- QR Code Card -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Attendance QR Code
            </h3>
            <div class="text-center">
              <div class="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <QRCodeVue3
                  :value="qrCodeValue"
                  :size="200"
                  level="M"
                  render-as="svg"
                />
              </div>
              <p class="mt-3 text-sm text-gray-500">
                Scan this code to check in at events
              </p>
              <BaseButton
                variant="outline"
                size="sm"
                class="mt-3"
                @click="downloadQRCode"
              >
                Download QR Code
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Quick Stats Card -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Stats
            </h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Teams</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-900">
                  {{ user.teams.length }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Events Attended</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-900">
                  {{ user.events.length }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Days as Member</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-900">
                  {{ daysAsMember }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <UserEditModal
      :is-open="showEditModal"
      :user="user"
      :available-groups="groups"
      :is-edit-mode="true"
      @close="showEditModal = false"
      @submit="handleModalSubmit"
    />

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :is-open="showDeleteModal"
      title="Delete Member"
      size="sm"
      @close="showDeleteModal = false"
    >
      <p class="text-sm text-gray-500">
        Are you sure you want to delete {{ user.displayName }}? This action cannot be undone.
      </p>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="outline"
            @click="showDeleteModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="isDeleting"
            @click="confirmDelete"
          >
            Delete
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>

  <!-- Loading State -->
  <div v-else class="flex justify-center items-center py-12">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-sm text-gray-500">Loading member profile...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useGroupStore } from '@/stores/groupStore'
import { usePermissions } from '@/composables/usePermissions'
import { UserGroupIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import QRCodeVue3 from 'qrcode-vue3'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import UserEditModal from '@/components/users/UserEditModal.vue'
import type { User, UserUpdate } from '@/types/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const groupStore = useGroupStore()
const { can } = usePermissions()

// State
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)

// Form
const form = ref({
  firstName: '',
  lastName: '',
  displayName: '',
  isPaid: false
})

// Computed
const userId = computed(() => route.params.id as string)
const user = computed(() => userStore.getUserById(userId.value))

const groups = computed(() => groupStore.groups)

const userGroups = computed(() => {
  if (!user.value) return []
  if (groupStore.isLoading) return []
  
  return user.value.authentikGroups.map(groupId => {
    const group = groupStore.groups.find(g => g.id === groupId)
    return {
      id: groupId,
      name: group?.name || `Unknown Group (${groupId.slice(0, 8)}...)`,
      description: group?.description,
      found: !!group
    }
  })
})

const qrCodeValue = computed(() => {
  if (!user.value) return ''
  return JSON.stringify({
    userId: user.value.id,
    email: user.value.email,
    timestamp: new Date().toISOString()
  })
})

const daysAsMember = computed(() => {
  if (!user.value) return 0
  const now = new Date()
  const joined = new Date(user.value.createdAt)
  const diffTime = Math.abs(now.getTime() - joined.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const downloadQRCode = () => {
  // TODO: Implement QR code download functionality
  console.log('Download QR code')
}

const handleSubmit = async () => {
  if (!user.value) return
  
  isSubmitting.value = true
  
  try {
    const updateData: UserUpdate = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      displayName: form.value.displayName,
      isPaid: form.value.isPaid
    }
    
    await userStore.updateUser(user.value.id, updateData)
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating user:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleModalSubmit = async (data: UserUpdate) => {
  if (!user.value) return
  
  try {
    await userStore.updateUser(user.value.id, data)
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

const confirmDelete = async () => {
  if (!user.value) return
  
  isDeleting.value = true
  
  try {
    await userStore.deleteUser(user.value.id)
    router.push('/users')
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    isDeleting.value = false
  }
}

// Load user data on mount
onMounted(async () => {
  try {
    // Always fetch users to ensure we have the latest data
    await userStore.fetchUsers()
    
    // Fetch groups to get names
    await groupStore.fetchGroups()
    
    // If user is still not found after fetching, try to fetch the specific user
    if (!user.value) {
      try {
        await userStore.fetchUser(userId.value)
      } catch (error) {
        console.error('Error fetching user:', error)
        // Handle error - could redirect to users list or show error message
      }
    }
    
    // Initialize form with current user data
    if (user.value) {
      form.value = {
        firstName: user.value.firstName,
        lastName: user.value.lastName,
        displayName: user.value.displayName,
        isPaid: user.value.isPaid
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>
