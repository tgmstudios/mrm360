<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ event?.title }}</h1>
            <p class="text-gray-600 mt-2">{{ formatDate(event?.startTime) }} - {{ formatTime(event?.startTime) }}</p>
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
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Event Information</h2>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Date & Time</p>
                  <p class="text-gray-900">{{ formatDate(event?.startTime) }} at {{ formatTime(event?.startTime) }}</p>
                  <p v-if="event?.endTime" class="text-sm text-gray-600">Ends: {{ formatDate(event?.endTime) }} at {{ formatTime(event?.endTime) }}</p>
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
                  <p class="text-sm font-medium text-gray-500">Category</p>
                  <p class="text-gray-900">{{ event?.category || 'N/A' }}</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Description</p>
                  <p class="text-gray-900">{{ event?.description || 'No description available' }}</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Attendance Type</p>
                  <p class="text-gray-900">{{ event?.attendanceType || 'SOFT' }}</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 mt-1">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Status</p>
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      event?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ event?.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- RSVP Section -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">RSVP</h2>
            <div v-if="!hasRSVPed" class="space-y-4">
              <p class="text-gray-600">Will you be attending this event?</p>
              <div class="flex space-x-3">
                <BaseButton
                  @click="rsvpToEvent('yes')"
                  variant="primary"
                  :loading="rsvpLoading"
                >
                  Yes, I'll be there
                </BaseButton>
                <BaseButton
                  @click="rsvpToEvent('no')"
                  variant="secondary"
                  :loading="rsvpLoading"
                >
                  No, I can't make it
                </BaseButton>
                <BaseButton
                  @click="rsvpToEvent('maybe')"
                  variant="outline"
                  :loading="rsvpLoading"
                >
                  Maybe
                </BaseButton>
              </div>
            </div>
            <div v-else class="space-y-4">
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-900">You have RSVP'd: <span class="font-medium">{{ userRSVP }}</span></p>
              </div>
              <BaseButton
                @click="changeRSVP"
                variant="outline"
                size="sm"
              >
                Change RSVP
              </BaseButton>
            </div>
          </div>

          <!-- Attendance Section -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Attendance</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ attendanceStats.yes }}</p>
                <p class="text-sm text-blue-600">Attending</p>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <p class="text-2xl font-bold text-red-600">{{ attendanceStats.no }}</p>
                <p class="text-sm text-red-600">Not Attending</p>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <p class="text-2xl font-bold text-yellow-600">{{ attendanceStats.maybe }}</p>
                <p class="text-sm text-yellow-600">Maybe</p>
              </div>
            </div>
            
            <div v-if="event?.rsvps && event.rsvps.length > 0" class="space-y-3">
              <h3 class="text-lg font-medium text-gray-900">RSVPs</h3>
              <div class="space-y-2">
                <div 
                  v-for="rsvp in event.rsvps" 
                  :key="rsvp.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ getInitials(rsvp.user?.firstName + ' ' + rsvp.user?.lastName || 'Unknown') }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ rsvp.user?.firstName + ' ' + rsvp.user?.lastName || 'Unknown User' }}</p>
                      <p class="text-sm text-gray-500">{{ rsvp.user?.email || 'No email' }}</p>
                    </div>
                  </div>
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      rsvp.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                      rsvp.status === 'DECLINED' ? 'bg-red-100 text-red-800' : 
                      rsvp.status === 'MAYBE' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ rsvp.status === 'CONFIRMED' ? 'Attending' : 
                       rsvp.status === 'DECLINED' ? 'Not Attending' : 
                       rsvp.status === 'MAYBE' ? 'Maybe' : 'Pending' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>No RSVPs yet</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Event Actions -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Event Actions</h3>
            <div class="space-y-3">
              <BaseButton
                v-if="canEditEvent"
                @click="editEvent"
                variant="secondary"
                class="w-full"
              >
                Edit Event
              </BaseButton>
              <BaseButton
                v-if="canCheckIn"
                @click="goToCheckIn"
                variant="primary"
                class="w-full"
              >
                Check-in Attendees
              </BaseButton>
              <BaseButton
                v-if="canDeleteEvent"
                @click="deleteEvent"
                variant="danger"
                class="w-full"
              >
                Delete Event
              </BaseButton>
            </div>
          </div>

          <!-- Event Team -->
          <div v-if="event?.linkedTeam" class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Linked Team</h3>
            <div class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                 @click="goToTeam(event.linkedTeam.id)">
              <p class="font-medium text-gray-900">{{ event.linkedTeam.name }}</p>
              <p class="text-sm text-gray-500">{{ event.linkedTeam.type }}</p>
            </div>
          </div>

          <!-- Event Groups -->
          <div v-if="event?.groups && event.groups.length > 0" class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Related Groups</h3>
            <div class="space-y-3">
              <div 
                v-for="group in event.groups" 
                :key="group.id"
                class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                @click="goToGroup(group.id)"
              >
                <p class="font-medium text-gray-900">{{ group.name }}</p>
                <p class="text-sm text-gray-500">{{ group.type }}</p>
              </div>
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
</script>
