<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Event Check-in</h1>
            <p class="text-gray-600 mt-2">{{ event?.title }}</p>
            <p class="text-gray-500 text-sm">{{ formatDate(event?.startDate) }} at {{ formatTime(event?.startDate) }}</p>
          </div>
          <div class="flex space-x-3">
            <BaseButton
              @click="goBack"
              variant="outline"
              size="lg"
            >
              Back to Event
            </BaseButton>
            <BaseButton
              @click="refreshAttendees"
              variant="secondary"
              size="lg"
              :loading="refreshing"
            >
              Refresh
            </BaseButton>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Check-in Methods -->
        <div class="lg:col-span-2 space-y-6">
          <!-- QR Code Scanner -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">QR Code Scanner</h2>
            <div class="space-y-4">
              <div class="flex space-x-3">
                <BaseButton
                  @click="startCamera"
                  variant="primary"
                  :loading="cameraLoading"
                  :disabled="cameraActive"
                >
                  Start Camera
                </BaseButton>
                <BaseButton
                  v-if="cameraActive"
                  @click="stopCamera"
                  variant="secondary"
                >
                  Stop Camera
                </BaseButton>
              </div>
              
              <div v-if="cameraActive" class="relative">
                <video
                  ref="videoElement"
                  class="w-full h-64 bg-gray-900 rounded-lg"
                  autoplay
                  playsinline
                ></video>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="border-2 border-blue-500 w-48 h-48 rounded-lg"></div>
                </div>
              </div>
              
              <div v-else class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div class="text-center">
                  <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  <p class="text-gray-500">Click "Start Camera" to begin scanning</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Manual Check-in -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Manual Check-in</h2>
            <div class="space-y-4">
              <div>
                <label for="searchUser" class="block text-sm font-medium text-gray-700 mb-2">
                  Search User
                </label>
                <div class="relative">
                  <input
                    id="searchUser"
                    v-model="searchQuery"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name or email"
                    @input="searchUsers"
                  />
                  <div v-if="searchResults.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div
                      v-for="user in searchResults"
                      :key="user.id"
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                      @click="selectUser(user)"
                    >
                      <p class="font-medium text-gray-900">{{ user.name }}</p>
                      <p class="text-sm text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedUser" class="p-4 bg-blue-50 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ selectedUser.name }}</p>
                    <p class="text-sm text-gray-500">{{ selectedUser.email }}</p>
                  </div>
                  <BaseButton
                    @click="checkInUser(selectedUser.id)"
                    variant="primary"
                    :loading="checkInLoading"
                  >
                    Check In
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Check-ins -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Check-ins</h2>
            <div v-if="recentCheckIns.length > 0" class="space-y-3">
              <div
                v-for="checkIn in recentCheckIns"
                :key="checkIn.id"
                class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ checkIn.user?.name }}</p>
                    <p class="text-sm text-gray-500">{{ formatTime(checkIn.checkedInAt) }}</p>
                  </div>
                </div>
                <span class="text-sm text-green-600 font-medium">Checked In</span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>No recent check-ins</p>
            </div>
          </div>
        </div>

        <!-- Attendance Summary -->
        <div class="space-y-6">
          <!-- Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
            <div class="space-y-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ attendanceStats.total }}</p>
                <p class="text-sm text-blue-600">Total Attendees</p>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <p class="text-2xl font-bold text-green-600">{{ attendanceStats.checkedIn }}</p>
                <p class="text-sm text-green-600">Checked In</p>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <p class="text-2xl font-bold text-yellow-600">{{ attendanceStats.pending }}</p>
                <p class="text-sm text-yellow-600">Pending</p>
              </div>
            </div>
          </div>

          <!-- Attendee List -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Attendees</h3>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="attendee in event?.attendees"
                :key="attendee.userId"
                class="flex items-center justify-between p-2 rounded-lg"
                :class="attendee.checkedIn ? 'bg-green-50' : 'bg-gray-50'"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                       :class="attendee.checkedIn ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'">
                    {{ getInitials(attendee.user?.name || 'Unknown') }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ attendee.user?.name }}</p>
                    <p class="text-xs text-gray-500">{{ attendee.status }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    v-if="attendee.checkedIn"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    Checked In
                  </span>
                  <BaseButton
                    v-else
                    @click="checkInUser(attendee.userId)"
                    variant="primary"
                    size="sm"
                    :loading="checkInLoading"
                  >
                    Check In
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '@/stores/eventStore'
import { useUserStore } from '@/stores/userStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Event, User, EventAttendee } from '@/types/api'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const userStore = useUserStore()
const { can } = usePermissions()

const eventId = computed(() => route.params.id as string)

const event = ref<Event | null>(null)
const cameraActive = ref(false)
const cameraLoading = ref(false)
const checkInLoading = ref(false)
const refreshing = ref(false)
const searchQuery = ref('')
const searchResults = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const recentCheckIns = ref<any[]>([])

const videoElement = ref<HTMLVideoElement>()

const attendanceStats = computed(() => {
  if (!event.value?.attendees) return { total: 0, checkedIn: 0, pending: 0 }
  
  const total = event.value.attendees.length
  const checkedIn = event.value.attendees.filter(a => a.checkedIn).length
  const pending = total - checkedIn
  
  return { total, checkedIn, pending }
})

onMounted(async () => {
  await loadEvent()
  await loadRecentCheckIns()
})

onUnmounted(() => {
  stopCamera()
})

const loadEvent = async () => {
  try {
    const eventData = await eventStore.getEvent(eventId.value)
    event.value = eventData
  } catch (error) {
    console.error('Failed to load event:', error)
  }
}

const loadRecentCheckIns = async () => {
  // This would typically come from the API
  // For now, we'll use mock data
  recentCheckIns.value = []
}

const startCamera = async () => {
  if (!can('checkIn', 'Event')) {
    alert('You do not have permission to check in attendees')
    return
  }
  
  cameraLoading.value = true
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      cameraActive.value = true
      
      // Start QR code detection
      startQRDetection()
    }
  } catch (error) {
    console.error('Failed to start camera:', error)
    alert('Failed to start camera. Please check permissions.')
  } finally {
    cameraLoading.value = false
  }
}

const stopCamera = () => {
  if (videoElement.value?.srcObject) {
    const stream = videoElement.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoElement.value.srcObject = null
  }
  cameraActive.value = false
}

const startQRDetection = () => {
  // This would integrate with a QR code detection library
  // For now, we'll simulate it
  console.log('QR detection started')
}

const searchUsers = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  try {
    const users = await userStore.searchUsers(searchQuery.value)
    searchResults.value = users
  } catch (error) {
    console.error('Failed to search users:', error)
    searchResults.value = []
  }
}

const selectUser = (user: User) => {
  selectedUser.value = user
  searchResults.value = []
  searchQuery.value = user.name
}

const checkInUser = async (userId: string) => {
  if (!can('checkIn', 'Event')) {
    alert('You do not have permission to check in attendees')
    return
  }
  
  checkInLoading.value = true
  
  try {
    await eventStore.checkInUser(eventId.value, userId)
    
    // Update local state
    if (event.value?.attendees) {
      const attendee = event.value.attendees.find(a => a.userId === userId)
      if (attendee) {
        attendee.checkedIn = true
        attendee.checkedInAt = new Date().toISOString()
      }
    }
    
    // Add to recent check-ins
    const user = await userStore.getUser(userId)
    if (user) {
      recentCheckIns.value.unshift({
        id: Date.now(),
        userId,
        user,
        checkedInAt: new Date().toISOString()
      })
    }
    
    // Clear selection
    selectedUser.value = null
    searchQuery.value = ''
    
    alert(`${user?.name || 'User'} has been checked in successfully!`)
  } catch (error) {
    console.error('Failed to check in user:', error)
    alert('Failed to check in user. Please try again.')
  } finally {
    checkInLoading.value = false
  }
}

const refreshAttendees = async () => {
  refreshing.value = true
  try {
    await loadEvent()
    await loadRecentCheckIns()
  } finally {
    refreshing.value = false
  }
}

const goBack = () => {
  router.back()
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
