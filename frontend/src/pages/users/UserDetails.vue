<template>
  <div v-if="user" class="space-y-6">
    <!-- Page Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-100">{{ user.displayName }}</h1>
        <p class="mt-2 text-sm text-gray-400">
          Member profile and details
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
        <!-- Modal buttons removed - no modals in this app -->
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Information -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info Card -->
        <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
              Basic Information
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-400">Full Name</dt>
                <dd class="mt-1 text-sm text-gray-100">
                  {{ user.firstName }} {{ user.lastName }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-400">Email</dt>
                <dd class="mt-1 text-sm text-gray-100">
                  <a :href="`mailto:${user.email}`" class="text-blue-400 hover:text-blue-300">
                    {{ user.email }}
                  </a>
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-400">Display Name</dt>
                <dd class="mt-1 text-sm text-gray-100">{{ user.displayName }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-400">Member Since</dt>
                <dd class="mt-1 text-sm text-gray-100">
                  {{ formatDate(user.createdAt) }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-400">Status</dt>
                <dd class="mt-1">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      user.isActive
                        ? 'bg-green-900 text-green-200'
                        : 'bg-red-900 text-red-200'
                    ]"
                  >
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-400">Payment Status</dt>
                <dd class="mt-1">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      user.isPaid
                        ? 'bg-green-900 text-green-200'
                        : 'bg-yellow-900 text-yellow-200'
                    ]"
                  >
                    {{ user.isPaid ? 'Paid' : 'Unpaid' }}
                  </span>
                </dd>
              </div>
              
              <div v-if="user.paidUntil">
                <dt class="text-sm font-medium text-gray-400">Paid Until</dt>
                <dd class="mt-1 text-sm text-gray-100">
                  {{ formatDate(user.paidUntil) }}
                </dd>
              </div>
              
              <div v-if="user.avatar">
                <dt class="text-sm font-medium text-gray-400">Avatar</dt>
                <dd class="mt-1">
                  <img
                    :src="user.avatar"
                    :alt="user.displayName"
                    class="h-16 w-16 rounded-full"
                  />
                </dd>
              </div>

              <!-- Discord Information -->
              <div v-if="user.discordAccount">
                <dt class="text-sm font-medium text-gray-400">Discord Username</dt>
                <dd class="mt-1 text-sm text-gray-100">
                  {{ user.discordAccount.username }}
                  <span v-if="user.discordAccount.discriminator" class="text-gray-400">
                    #{{ user.discordAccount.discriminator }}
                  </span>
                </dd>
              </div>
              <div v-if="user.discordAccount">
                <dt class="text-sm font-medium text-gray-400">Discord ID</dt>
                <dd class="mt-1 text-sm text-gray-100">
                  <code class="bg-gray-700 px-2 py-0.5 rounded">{{ user.discordAccount.discordId }}</code>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Teams Card -->
        <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
              Teams
            </h3>
            <div v-if="user.teams && user.teams.length > 0" class="space-y-3">
              <div
                v-for="team in user.teams"
                :key="team.id"
                class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-100">{{ team.name }}</h4>
                  <p class="text-sm text-gray-400">{{ team.type }}</p>
                  <p v-if="team.description" class="text-sm text-gray-400 mt-1">
                    {{ team.description }}
                  </p>
                </div>
                <router-link
                  :to="`/teams/${team.id}`"
                  class="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View Team
                </router-link>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-100">No teams assigned</h3>
              <p class="mt-1 text-sm text-gray-400">
                This member is not currently assigned to any teams.
              </p>
            </div>
          </div>
        </div>

        <!-- Events Card -->
        <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
              Events
            </h3>
            <div v-if="user.events && user.events.length > 0" class="space-y-3">
              <div
                v-for="event in user.events"
                :key="event.id"
                class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-100">{{ event.title }}</h4>
                  <p class="text-sm text-gray-400">
                    {{ formatDate(event.startTime) }} - {{ formatDate(event.endTime) }}
                  </p>
                </div>
                <router-link
                  :to="`/events/${event.id}`"
                  class="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View Event
                </router-link>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <CalendarIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-100">No events</h3>
              <p class="mt-1 text-sm text-gray-400">
                This member hasn't attended any events yet.
              </p>
            </div>
          </div>
        </div>

        <!-- Authentik Groups Card -->
        <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
              Groups
            </h3>
            <div v-if="groupStore.isLoading" class="text-center py-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-400">Loading groups...</p>
            </div>
            <div v-else-if="userGroups.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="group in userGroups"
                :key="group.id"
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  group.found 
                    ? 'bg-purple-900 text-purple-200' 
                    : 'bg-gray-700 text-gray-300'
                ]"
                :title="group.description || group.name"
              >
                {{ group.name }}
              </span>
            </div>
            <div v-else class="text-center py-4">
              <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-100">No groups</h3>
              <p class="mt-1 text-sm text-gray-400">
                This member is not assigned to any Authentik groups.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- QR Code Card -->
        <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
              Attendance QR Code
            </h3>
            <div class="text-center">
              <div class="bg-white p-4 rounded-lg border-2 border-gray-600 inline-block">
                <QRCodeVue3
                  ref="qrCodeRef"
                  v-if="qrCodeValue"
                  :value="qrCodeValue"
                  :width="500"
                  :height="500"
                  :qr-options="{ errorCorrectionLevel: 'M' }"
                />
                <div v-else class="w-[500px] h-[500px] flex items-center justify-center text-gray-400">
                  Loading QR code...
                </div>
              </div>
              <p class="mt-3 text-sm text-gray-400">
                Scan this code to check in at events
              </p>
              <div class="flex space-x-2">
                <button
                  @click="downloadQRCode"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Card -->
        <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
              Quick Stats
            </h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-400">Teams</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-100">
                  {{ user.teams?.length || 0 }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-400">Events Attended</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-100">
                  {{ user.events?.length || 0 }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-400">Days as Member</dt>
                <dd class="mt-1 text-2xl font-semibold text-gray-100">
                  {{ daysAsMember }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals removed - no modals in this app -->
  </div>

  <!-- Loading State -->
  <div v-else class="flex justify-center items-center py-12">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-sm text-gray-400">Loading member profile...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useGroupStore } from '@/stores/groupStore'
import { usePermissions } from '@/composables/usePermissions'
import { UserGroupIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import QRCodeVue3 from 'qrcode-vue3'
import type { User } from '@/types/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const groupStore = useGroupStore()
const { can } = usePermissions()

// State
const isSubmitting = ref(false)
const isDeleting = ref(false)
const qrCodeRef = ref<any>(null)

// Form
const form = ref({
  firstName: '',
  lastName: '',
  displayName: '',
  isPaid: false
})

// Computed
const userId = computed(() => route.params.id as string)
const user = computed(() => {
  // Try to get user from the users array first
  let foundUser = userStore.getUserById(userId.value)
  
  // If not found in users array, try currentUser
  if (!foundUser && userStore.currentUser) {
    foundUser = userStore.currentUser
  }
  
  return foundUser
})

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
  // Use the actual QR code from the database if available
  if (user.value.qrCode) {
    console.log('Using QR code from database:', user.value.qrCode)
    return user.value.qrCode
  }
  // Fallback to JSON format for backward compatibility
  const fallbackValue = JSON.stringify({
    userId: user.value.id,
    email: user.value.email,
    timestamp: new Date().toISOString()
  })
  console.log('Using fallback QR code value:', fallbackValue)
  return fallbackValue
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

const getUserInitials = (user: User) => {
  if (!user?.firstName || !user?.lastName) return '?'
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

const downloadQRCode = async () => {
  if (!qrCodeValue.value) {
    console.error('No QR code value available')
    return
  }

  try {
    // Wait for the QR code component to be rendered
    await nextTick()
    
    // Get the image element from the displayed QR code component
    if (!qrCodeRef.value) {
      console.error('QR code component not found')
      return
    }
    
    // The QRCodeVue3 component renders an img element
    const imgElement = qrCodeRef.value.$el?.querySelector('img')
    
    if (!imgElement) {
      console.error('QR code image not found')
      return
    }

    // Get the image source URL from the img src
    const imageSrc = imgElement.src
    
    if (!imageSrc) {
      console.error('No image source found')
      return
    }

    // Create download link directly from the image source
    const link = document.createElement('a')
    link.download = `qr-code-${user.value?.firstName || 'user'}.png`
    link.href = imageSrc
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('QR code downloaded successfully!')
    
  } catch (error) {
    console.error('Failed to download QR code:', error)
    alert('Failed to download QR code. Please try again.')
  }
}


// Modal methods removed - no modals in this app

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
