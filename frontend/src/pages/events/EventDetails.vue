<template>
  <div class="min-h-screen bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-100">{{ event?.title }}</h1>
            <p class="text-gray-400 mt-2">{{ formatDate(event?.startTime) }} - {{ formatTime(event?.startTime) }}</p>
          </div>
          <div class="flex space-x-3">
            <BaseButton
              v-if="canEditEvent"
              @click="editEvent"
              variant="secondary"
              size="lg"
            >
              Edit Event
            </BaseButton>
            <BaseButton
              v-if="canCheckIn"
              @click="goToCheckIn"
              variant="primary"
              size="lg"
            >
              Check-in
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Event Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Event Info Card -->
          <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-100 mb-4">Event Information</h2>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-400">Date & Time</p>
                  <p class="text-gray-100">{{ formatDate(event?.startTime) }} at {{ formatTime(event?.startTime) }}</p>
                  <p v-if="event?.endTime" class="text-sm text-gray-400">Ends: {{ formatDate(event?.endTime) }} at {{ formatTime(event?.endTime) }}</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-400">Category</p>
                  <p class="text-gray-100">{{ event?.category || 'N/A' }}</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-400">Description</p>
                  <p class="text-gray-100">{{ event?.description || 'No description available' }}</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-400">Attendance Type</p>
                  <p class="text-gray-100">{{ event?.attendanceType || 'SOFT' }}</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-400">Status</p>
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getEventStatusColor(event?.startTime, event?.endTime)
                    ]"
                  >
                    {{ getEventStatus(event?.startTime, event?.endTime) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendees Card -->
          <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-100">Attendees</h2>
              <span class="text-sm text-gray-400">{{ event?.attendees?.length || 0 }} attendees</span>
            </div>
            
            <div v-if="event?.attendees && event.attendees.length > 0" class="space-y-3">
              <div
                v-for="attendee in event.attendees"
                :key="attendee.id"
                class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-white">
                      {{ getUserInitials(attendee.user) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-100">
                      {{ attendee.user.displayName || `${attendee.user.firstName} ${attendee.user.lastName}` }}
                    </p>
                    <p class="text-xs text-gray-400">{{ attendee.user.email }}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-1 bg-green-900 text-green-200 rounded-full text-xs font-medium">
                    {{ attendee.status }}
                  </span>
                  <span class="text-xs text-gray-400">{{ formatDate(attendee.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-6">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-100">No attendees</h3>
              <p class="mt-1 text-sm text-gray-400">No one has checked in to this event yet.</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Event Stats -->
          <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-100 mb-4">Event Stats</h3>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-gray-400">Total Attendees</dt>
                <dd class="text-sm text-gray-100">{{ event?.attendees?.length || 0 }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-gray-400">Confirmed</dt>
                <dd class="text-sm text-gray-100">{{ confirmedAttendees }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-gray-400">Pending</dt>
                <dd class="text-sm text-gray-100">{{ pendingAttendees }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-gray-400">No Show</dt>
                <dd class="text-sm text-gray-100">{{ noShowAttendees }}</dd>
              </div>
            </dl>
          </div>

          <!-- Linked Team -->
          <div v-if="event?.linkedTeam" class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-100 mb-4">Linked Team</h3>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ event.linkedTeam.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-100">{{ event.linkedTeam.name }}</p>
                <p class="text-xs text-gray-400">{{ event.linkedTeam.type }}</p>
              </div>
            </div>
            <router-link
              :to="`/teams/${event.linkedTeam.id}`"
              class="mt-3 inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View Team
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </router-link>
          </div>

          <!-- QR Code -->
          <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-100 mb-4">Check-in QR Code</h3>
            <div class="text-center">
              <div class="bg-white p-4 rounded-lg inline-block">
                <QRCodeVue3
                  :value="qrCodeValue"
                  :size="150"
                  :level="'M'"
                  :render-as="'svg'"
                />
              </div>
              <p class="mt-3 text-sm text-gray-400">Scan this code to check in</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RSVP Change Modal -->
    <BaseModal
      v-model="showRSVPModal"
      title="Change RSVP"
      size="md"
    >
      <div class="space-y-4">
        <p class="text-gray-600">What would you like to change your RSVP to?</p>
        <div class="flex space-x-3">
          <BaseButton
            @click="updateRSVP('yes')"
            variant="primary"
            :loading="rsvpLoading"
          >
            Yes, I'll be there
          </BaseButton>
          <BaseButton
            @click="updateRSVP('no')"
            variant="secondary"
            :loading="rsvpLoading"
          >
            No, I can't make it
          </BaseButton>
          <BaseButton
            @click="updateRSVP('maybe')"
            variant="outline"
            :loading="rsvpLoading"
          >
            Maybe
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Event, EventAttendee } from '@/types/api'
import QRCodeVue3 from 'qrcode-vue3'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const authStore = useAuthStore()
const { can } = usePermissions()

const event = ref<Event | null>(null)
const rsvpLoading = ref(false)
const showRSVPModal = ref(false)
const userRSVP = ref<string | null>(null)

const eventId = computed(() => route.params.id as string)

const canEditEvent = computed(() => can('update', 'Event'))
const canDeleteEvent = computed(() => can('delete', 'Event'))
const canCheckIn = computed(() => can('checkIn', 'Event'))

const attendanceStats = computed(() => {
  if (!event.value?.rsvps) return { CONFIRMED: 0, DECLINED: 0, MAYBE: 0, PENDING: 0 }
  
  return event.value.rsvps.reduce((acc, rsvp) => {
    acc[rsvp.status] = (acc[rsvp.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
})

const hasRSVPed = computed(() => userRSVP.value !== null)

onMounted(async () => {
  await loadEvent()
  checkUserRSVP()
})

const loadEvent = async () => {
  try {
    const eventData = await eventStore.getEvent(eventId.value)
    event.value = eventData
  } catch (error) {
    console.error('Failed to load event:', error)
  }
}

const checkUserRSVP = () => {
  if (!event.value?.rsvps || !authStore.user) return
  
  const userRSVPData = event.value.rsvps.find(
    rsvp => rsvp.userId === authStore.user?.id
  )
  
  if (userRSVPData) {
    userRSVP.value = userRSVPData.status
  }
}

const rsvpToEvent = async (status: string) => {
  if (!event.value) return
  
  rsvpLoading.value = true
  try {
    await eventStore.rsvpToEvent(eventId.value, status)
    userRSVP.value = status
    await loadEvent() // Refresh event data
  } catch (error) {
    console.error('Failed to RSVP:', error)
  } finally {
    rsvpLoading.value = false
  }
}

const changeRSVP = () => {
  showRSVPModal.value = true
}

const updateRSVP = async (status: string) => {
  await rsvpToEvent(status)
  showRSVPModal.value = false
}

const editEvent = () => {
  router.push(`/events/${eventId.value}/edit`)
}

const goToCheckIn = () => {
  router.push(`/events/${eventId.value}/checkin`)
}

const deleteEvent = async () => {
  if (!event.value || !confirm('Are you sure you want to delete this event?')) return
  
  try {
    await eventStore.deleteEvent(eventId.value)
    router.push('/events')
  } catch (error) {
    console.error('Failed to delete event:', error)
  }
}

const goToTeam = (teamId: string) => {
  router.push(`/teams/${teamId}`)
}

const goToGroup = (groupId: string) => {
  router.push(`/groups/${groupId}`)
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

const getUserInitials = (user: any) => {
  if (!user) return 'U'
  return user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()
}

const getEventStatus = (startTime?: string, endTime?: string) => {
  if (!startTime) return 'Inactive'
  const now = new Date()
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : null

  if (end && now > end) {
    return 'Inactive'
  }
  if (now < start) {
    return 'Upcoming'
  }
  return 'Active'
}

const getEventStatusColor = (startTime?: string, endTime?: string) => {
  if (!startTime) return 'bg-gray-700 text-gray-400'
  const now = new Date()
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : null

  if (end && now > end) {
    return 'bg-gray-700 text-gray-400'
  }
  if (now < start) {
    return 'bg-blue-900 text-blue-200'
  }
  return 'bg-green-900 text-green-200'
}

const confirmedAttendees = computed(() => {
  return event.value?.attendees?.filter(a => a.status === 'CONFIRMED').length || 0
})

const pendingAttendees = computed(() => {
  return event.value?.attendees?.filter(a => a.status === 'PENDING').length || 0
})

const noShowAttendees = computed(() => {
  return event.value?.attendees?.filter(a => a.status === 'DECLINED').length || 0
})

const qrCodeValue = computed(() => {
  if (!event.value) return ''
  return `${window.location.origin}/checkin/${event.value.id}`
})
</script>
