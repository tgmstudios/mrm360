<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-sm text-gray-400">Loading event...</p>
      </div>

      <!-- Event Check-in Form -->
      <div v-else-if="event" class="bg-gray-800 shadow rounded-lg border border-gray-700 p-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-100 mb-2">{{ event.title }}</h2>
          <p class="text-gray-400 mb-6">
            {{ formatDate(event.startTime) }} at {{ formatTime(event.startTime) }}
          </p>
          
          <!-- Check-in Status -->
          <div v-if="checkInStatus === 'success'" class="mb-6">
            <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-green-400 mb-2">Check-in Successful!</h3>
            <p class="text-gray-300">You have been checked in to this event.</p>
          </div>

          <div v-else-if="checkInStatus === 'error'" class="mb-6">
            <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-red-400 mb-2">Check-in Failed</h3>
            <p class="text-gray-300">{{ errorMessage }}</p>
          </div>

          <div v-else-if="checkInStatus === 'already-checked-in'" class="mb-6">
            <div class="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-yellow-400 mb-2">Already Checked In</h3>
            <p class="text-gray-300">You have already checked in to this event.</p>
          </div>

          <!-- Check-in Button -->
          <div v-else class="mb-6">
            <BaseButton
              @click="checkIn"
              variant="primary"
              size="lg"
              :loading="checkInLoading"
              class="w-full"
            >
              Check In to Event
            </BaseButton>
          </div>

          <!-- Event Details -->
          <div class="text-left bg-gray-700 rounded-lg p-4 mb-6">
            <h4 class="text-sm font-medium text-gray-400 mb-2">Event Details</h4>
            <div class="space-y-2 text-sm text-gray-300">
              <div><span class="font-medium">Category:</span> {{ event.category }}</div>
              <div><span class="font-medium">Attendance Type:</span> {{ event.attendanceType }}</div>
              <div v-if="event.description">
                <span class="font-medium">Description:</span> {{ event.description }}
              </div>
            </div>
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
        <p class="text-gray-400 mb-6">{{ errorMessage || 'The check-in code is invalid or the event doesn\'t exist.' }}</p>
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
const checkInLoading = ref(false)
const checkInStatus = ref<'idle' | 'success' | 'error' | 'already-checked-in' | 'rsvp-required' | 'event-full' | 'not-eligible' | 'would-be-waitlisted' | 'on-waitlist' | 'rsvp-declined' | 'rsvp-status-error'>('idle')
const errorMessage = ref('')

const checkInCode = computed(() => route.params.code as string)

onMounted(async () => {
  await loadEvent()
})

const loadEvent = async () => {
  try {
    loading.value = true
    const eventData = await eventStore.fetchEventByCheckInCode(checkInCode.value)
    event.value = eventData
    
    // Check if user is already checked in
    if (eventData.checkIns?.some(checkIn => checkIn.userId === authStore.user?.id)) {
      checkInStatus.value = 'already-checked-in'
    }
  } catch (error: any) {
    console.error('Failed to load event:', error)
    event.value = null
    
    // Set error message for display
    if (error?.response?.status === 404) {
      errorMessage.value = 'Event not found. The check-in code may be invalid or the event may have been removed.'
    } else if (error?.response?.status === 401) {
      errorMessage.value = 'You need to be logged in to access this check-in page.'
    } else {
      errorMessage.value = 'Failed to load event details. Please check your connection and try again.'
    }
  } finally {
    loading.value = false
  }
}

const checkIn = async () => {
  if (!event.value || !authStore.user) return
  
  checkInLoading.value = true
  
  try {
    const result = await eventStore.checkInUser(event.value.id, authStore.user.id)
    
    console.log('Check-in result:', result) // Debug log
    
    if (result.success) {
      checkInStatus.value = 'success'
      toast.success('Successfully checked in to the event!')
    } else {
      checkInStatus.value = 'error'
      
      // Provide more descriptive error messages
      let descriptiveMessage = result.message || 'Check-in failed'
      console.log('Original error message:', result.message) // Debug log
      
      if (result.message && result.message.includes('already checked in')) {
        descriptiveMessage = 'You have already checked in to this event.'
        checkInStatus.value = 'already-checked-in'
      } else if (result.message && result.message.includes('not found')) {
        descriptiveMessage = 'Event not found. Please check the QR code and try again.'
      } else if (result.message && result.message.includes('Invalid QR code')) {
        descriptiveMessage = 'Invalid QR code. Please scan the correct QR code for this event.'
      } else if (result.message && result.message.includes('requires manual RSVP')) {
        descriptiveMessage = 'This event requires you to RSVP first. Please RSVP to the event before checking in.'
        checkInStatus.value = 'rsvp-required'
      } else if (result.message && result.message.includes('full and has no waitlist')) {
        descriptiveMessage = 'This event is full and has no waitlist. Please RSVP manually first.'
        checkInStatus.value = 'event-full'
      } else if (result.message && result.message.includes('not eligible to RSVP')) {
        descriptiveMessage = 'You are not eligible to RSVP to this event. Please RSVP manually first.'
        checkInStatus.value = 'not-eligible'
      } else if (result.message && result.message.includes('would be placed on the waitlist')) {
        descriptiveMessage = 'This event is full and you would be placed on the waitlist. Please RSVP manually first to join the waitlist.'
        checkInStatus.value = 'would-be-waitlisted'
      } else if (result.message && result.message.includes('on the waitlist')) {
        descriptiveMessage = 'You are on the waitlist for this event. Please wait for confirmation before checking in.'
        checkInStatus.value = 'on-waitlist'
      } else if (result.message && result.message.includes('RSVP is declined')) {
        descriptiveMessage = 'Your RSVP for this event is declined. Please RSVP again if you want to attend.'
        checkInStatus.value = 'rsvp-declined'
      } else if (result.message && result.message.includes('RSVP status')) {
        descriptiveMessage = 'Your RSVP status prevents check-in. Please update your RSVP first.'
        checkInStatus.value = 'rsvp-status-error'
      }
      
      errorMessage.value = descriptiveMessage
      toast.error(descriptiveMessage)
    }
  } catch (error: any) {
    console.error('Failed to check in:', error)
    checkInStatus.value = 'error'
    
    // Handle network or server errors
    let errorMsg = 'An unexpected error occurred. Please try again.'
    if (error?.response?.status === 401) {
      errorMsg = 'You need to be logged in to check in. Please log in and try again.'
    } else if (error?.response?.status === 403) {
      errorMsg = 'You do not have permission to check in to this event.'
    } else if (error?.response?.status === 404) {
      errorMsg = 'Event not found. Please check the QR code and try again.'
    } else if (error?.response?.status >= 500) {
      errorMsg = 'Server error occurred. Please try again later.'
    }
    
    errorMessage.value = errorMsg
    toast.error(errorMsg)
  } finally {
    checkInLoading.value = false
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
</script>
