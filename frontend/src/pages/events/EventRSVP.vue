<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-sm text-gray-400">Loading event...</p>
      </div>

      <!-- Event RSVP Form -->
      <div v-else-if="event" class="bg-gray-800 shadow rounded-lg border border-gray-700 p-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-100 mb-2">{{ event.title }}</h2>
          <p class="text-gray-400 mb-6">
            {{ formatDate(event.startTime) }} at {{ formatTime(event.startTime) }}
          </p>
          
          <!-- RSVP Status -->
          <div v-if="rsvpStatus === 'success'" class="mb-6">
            <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-green-400 mb-2">RSVP Successful!</h3>
            <p class="text-gray-300">{{ successMessage }}</p>
          </div>

          <div v-else-if="rsvpStatus === 'error'" class="mb-6">
            <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-red-400 mb-2">RSVP Failed</h3>
            <p class="text-gray-300">{{ errorMessage }}</p>
          </div>

          <div v-else-if="rsvpStatus === 'already-rsvped'" class="mb-6">
            <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-green-400 mb-2">RSVP Confirmed!</h3>
            <p class="text-gray-300">You have successfully RSVP'd to this event.</p>
            <p class="text-sm text-gray-400 mt-2">You can change your RSVP below if needed.</p>
          </div>

          <!-- RSVP Buttons -->
          <div v-if="rsvpStatus !== 'success' && rsvpStatus !== 'error'" class="mb-6">
            <div class="space-y-3">
              <BaseButton
                @click="rsvp(true)"
                :variant="currentUserRSVP?.status === 'CONFIRMED' ? 'primary' : 'outline'"
                size="lg"
                :loading="rsvpLoading"
                :class="[
                  'w-full',
                  currentUserRSVP?.status === 'CONFIRMED' ? 'ring-2 ring-green-500' : ''
                ]"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ getRSVPButtonText(true) }}
              </BaseButton>
              
              <BaseButton
                @click="rsvp(false)"
                :variant="currentUserRSVP?.status === 'DECLINED' ? 'secondary' : 'outline'"
                size="lg"
                :loading="rsvpLoading"
                :class="[
                  'w-full',
                  currentUserRSVP?.status === 'DECLINED' ? 'ring-2 ring-red-500' : ''
                ]"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                {{ getRSVPButtonText(false) }}
              </BaseButton>
            </div>
          </div>

          <!-- Event Details -->
          <div class="text-left bg-gray-700 rounded-lg p-4 mb-6">
            <h4 class="text-sm font-medium text-gray-400 mb-2">Event Details</h4>
            <div class="space-y-2 text-sm text-gray-300">
              <div><span class="font-medium">Category:</span> {{ event.category }}</div>
              <div><span class="font-medium">Attendance Type:</span> {{ event.attendanceType }}</div>
              <div v-if="event.attendanceCap">
                <span class="font-medium">Capacity:</span> {{ event.attendanceCap }} people
              </div>
              <div v-if="event.waitlistEnabled">
                <span class="font-medium">Waitlist:</span> Enabled
              </div>
              <div v-if="event.description">
                <span class="font-medium">Description:</span> {{ event.description }}
              </div>
            </div>
          </div>

          <!-- Current RSVP Status -->
          <div v-if="currentUserRSVP" class="text-left bg-gray-700 rounded-lg p-4 mb-6">
            <h4 class="text-sm font-medium text-gray-400 mb-2">Your RSVP Status</h4>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full mr-2" :class="getRSVPStatusColor(currentUserRSVP.status)"></div>
              <span class="text-sm text-gray-300">{{ getRSVPStatusText(currentUserRSVP.status) }}</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              RSVP'd on {{ formatDate(currentUserRSVP.createdAt) }}
            </p>
          </div>

          <!-- View Event Details Button -->
          <BaseButton
            @click="viewEventDetails"
            variant="primary"
            class="w-full mb-3"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Event Details
          </BaseButton>

          <!-- Back Button -->
          <BaseButton
            @click="goBack"
            variant="secondary"
            class="w-full"
          >
            Back to Dashboard
          </BaseButton>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center">
        <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-100 mb-2">Unable to Load Event</h3>
        <p class="text-gray-400 mb-6">{{ errorMessage || 'The event doesn\'t exist or you don\'t have permission to view it.' }}</p>
        <BaseButton
          @click="goBack"
          variant="secondary"
        >
          Back to Dashboard
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Event } from '@/types/api'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const authStore = useAuthStore()
const toast = useToast()

const event = ref<Event | null>(null)
const loading = ref(false)
const rsvpLoading = ref(false)
const rsvpStatus = ref<'idle' | 'success' | 'error' | 'already-rsvped'>('idle')
const errorMessage = ref('')
const successMessage = ref('')

const eventId = computed(() => route.params.id as string)

const currentUserRSVP = computed(() => {
  if (!event.value || !authStore.user) return null
  return event.value.rsvps?.find(rsvp => rsvp.userId === authStore.user?.id)
})

onMounted(async () => {
  await loadEvent()
})

const loadEvent = async () => {
  try {
    loading.value = true
    const eventData = await eventStore.fetchEvent(eventId.value)
    event.value = eventData
    
    // Check if user already has an RSVP
    if (currentUserRSVP.value) {
      rsvpStatus.value = 'already-rsvped'
    }
  } catch (error: any) {
    console.error('Failed to load event:', error)
    event.value = null
    
    // Set error message for display
    if (error?.response?.status === 404) {
      errorMessage.value = 'Event not found. The event may have been removed or you may not have permission to view it.'
    } else if (error?.response?.status === 401) {
      errorMessage.value = 'You need to be logged in to access this RSVP page.'
    } else {
      errorMessage.value = 'Failed to load event details. Please check your connection and try again.'
    }
  } finally {
    loading.value = false
  }
}

const rsvp = async (attending: boolean) => {
  if (!event.value || !authStore.user) return
  
  rsvpLoading.value = true
  
  try {
    const result = await eventStore.rsvpToEvent(event.value.id, attending)
    
    console.log('RSVP result:', result) // Debug log
    
    if (result.success) {
      rsvpStatus.value = 'success'
      successMessage.value = result.message
      toast.success(result.message)
      
      // Refresh the event to get updated RSVP data
      await loadEvent()
      
      // Reset status after a short delay to allow editing again
      setTimeout(() => {
        rsvpStatus.value = 'already-rsvped'
      }, 3000)
    } else {
      rsvpStatus.value = 'error'
      errorMessage.value = result.message || 'RSVP failed'
      toast.error(result.message || 'RSVP failed')
    }
  } catch (error: any) {
    console.error('Failed to RSVP:', error)
    rsvpStatus.value = 'error'
    
    // Handle network or server errors
    let errorMsg = 'An unexpected error occurred. Please try again.'
    if (error?.response?.status === 401) {
      errorMsg = 'You need to be logged in to RSVP. Please log in and try again.'
    } else if (error?.response?.status === 403) {
      errorMsg = 'You do not have permission to RSVP to this event.'
    } else if (error?.response?.status === 404) {
      errorMsg = 'Event not found. Please check the event ID and try again.'
    } else if (error?.response?.status >= 500) {
      errorMsg = 'Server error occurred. Please try again later.'
    }
    
    errorMessage.value = errorMsg
    toast.error(errorMsg)
  } finally {
    rsvpLoading.value = false
  }
}

const goBack = () => {
  router.push('/dashboard')
}

const viewEventDetails = () => {
  if (event.value?.id) {
    router.push(`/events/${event.value.id}`)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString?: string) => {
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getRSVPStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-500'
    case 'DECLINED':
      return 'bg-red-500'
    case 'PENDING':
      return 'bg-yellow-500'
    case 'MAYBE':
      return 'bg-blue-500'
    case 'WAITLIST':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

const getRSVPStatusText = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed - You\'re attending!'
    case 'DECLINED':
      return 'Declined - You\'re not attending'
    case 'PENDING':
      return 'Pending - Awaiting confirmation'
    case 'MAYBE':
      return 'Maybe - You might attend'
    case 'WAITLIST':
      return 'Waitlist - You\'re on the waitlist'
    default:
      return 'Unknown status'
  }
}

const getRSVPButtonText = (attending: boolean) => {
  if (!currentUserRSVP.value) {
    return attending ? 'Yes, I\'ll Attend' : 'No, I Can\'t Attend'
  }
  
  const currentStatus = currentUserRSVP.value.status
  const isCurrentlyAttending = currentStatus === 'CONFIRMED'
  
  if (attending && isCurrentlyAttending) {
    return 'Yes, I\'ll Attend'
  } else if (!attending && !isCurrentlyAttending) {
    return 'No, I Can\'t Attend'
  } else {
    return attending ? 'Change to: Yes, I\'ll Attend' : 'Change to: No, I Can\'t Attend'
  }
}
</script>
