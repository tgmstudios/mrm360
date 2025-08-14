<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Events</h1>
          <p class="text-gray-600 mt-2">Manage and view all events</p>
        </div>
        <button
          v-if="canCreate"
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Event
        </button>
      </div>
    </div>

    <!-- View Toggle -->
    <div class="mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'table'"
              :class="{
                'px-3 py-2 text-sm font-medium rounded-md transition-colors': true,
                'bg-white text-gray-900 shadow-sm': viewMode === 'table',
                'text-gray-600 hover:text-gray-900': viewMode === 'calendar'
              }"
            >
              Table View
            </button>
            <button
              @click="viewMode = 'calendar'"
              :class="{
                'px-3 py-2 text-sm font-medium rounded-md transition-colors': true,
                'bg-white text-gray-900 shadow-sm': viewMode === 'calendar',
                'text-gray-600 hover:text-gray-900': viewMode === 'table'
              }"
            >
              Calendar View
            </button>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="showCheckInModal = true"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Check In
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            id="search"
            v-model="filters.search"
            type="text"
            placeholder="Search events..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            id="category"
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="meeting">Meeting</option>
            <option value="social">Social</option>
            <option value="workshop">Workshop</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label for="team" class="block text-sm font-medium text-gray-700 mb-2">Team</label>
          <select
            id="team"
            v-model="filters.linkedTeamId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Teams</option>
            <option v-for="team in availableTeams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="dateRange" class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            id="dateRange"
            v-model="filters.dateRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="filteredEvents.length === 0" class="text-center py-12">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p class="text-gray-500">Try adjusting your search or filters</p>
        </div>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="event in paginatedEvents"
              :key="event.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ event.title }}</div>
                  <div class="text-sm text-gray-500">{{ event.description }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ new Date(event.startTime).toLocaleDateString() }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ new Date(event.startTime).toLocaleTimeString() }} - {{ new Date(event.endTime).toLocaleTimeString() }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-blue-100 text-blue-800': event.category === 'meeting',
                    'bg-green-100 text-green-800': event.category === 'social',
                    'bg-purple-100 text-purple-800': event.category === 'workshop',
                    'bg-orange-100 text-orange-800': event.category === 'other'
                  }"
                >
                  {{ event.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="event.linkedTeam" class="text-sm text-gray-900">
                  {{ event.linkedTeam.name }}
                </div>
                <div v-else class="text-sm text-gray-500">No team</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ event.rsvps?.filter(r => r.status === 'CONFIRMED').length || 0 }} attending
                </div>
                <div class="text-sm text-gray-500">
                  {{ event.attendanceType }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewEvent(event.id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button
                    v-if="canEdit"
                    @click="editEvent(event.id)"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                  <button
                    v-if="canDelete"
                    @click="deleteEvent(event.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <nav class="flex items-center space-x-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="{
                'px-3 py-2 text-sm font-medium rounded-md': true,
                'bg-blue-600 text-white': currentPage === page,
                'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50': currentPage !== page
              }"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-else-if="viewMode === 'calendar'" class="bg-white rounded-lg shadow p-6">
      <div class="text-center text-gray-500 py-8">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
        <p class="text-gray-500">Calendar view will be implemented with vue-cal or FullCalendar</p>
      </div>
    </div>

    <!-- Create Event Modal -->
    <BaseModal
      v-model:show="showCreateModal"
      title="Create New Event"
      @close="showCreateModal = false"
    >
      <form @submit.prevent="handleCreateEvent" class="space-y-4">
        <div>
          <label for="eventTitle" class="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
          <input
            id="eventTitle"
            v-model="newEvent.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label for="eventDescription" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            id="eventDescription"
            v-model="newEvent.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="startTime" class="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
            <input
              id="startTime"
              v-model="newEvent.startTime"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="endTime" class="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
            <input
              id="endTime"
              v-model="newEvent.endTime"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="eventCategory" class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              id="eventCategory"
              v-model="newEvent.category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="meeting">Meeting</option>
              <option value="social">Social</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label for="linkedTeam" class="block text-sm font-medium text-gray-700 mb-2">Linked Team</label>
            <select
              id="linkedTeam"
              v-model="newEvent.linkedTeamId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Team</option>
              <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div>
          <label for="attendanceType" class="block text-sm font-medium text-gray-700 mb-2">Attendance Type *</label>
          <select
            id="attendanceType"
            v-model="newEvent.attendanceType"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="required">Required</option>
            <option value="optional">Optional</option>
            <option value="rsvp">RSVP</option>
          </select>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="showCreateModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="creating"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="creating">Creating...</span>
            <span v-else>Create Event</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Check In Modal -->
    <BaseModal
      v-model:show="showCheckInModal"
      title="Event Check-In"
      @close="showCheckInModal = false"
    >
      <div class="space-y-4">
        <div>
          <label for="checkInEvent" class="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
          <select
            id="checkInEvent"
            v-model="checkInData.eventId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose an event...</option>
            <option v-for="event in upcomingEvents" :key="event.id" :value="event.id">
              {{ event.title }} - {{ new Date(event.startTime).toLocaleDateString() }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="qrCode" class="block text-sm font-medium text-gray-700 mb-2">QR Code</label>
          <input
            id="qrCode"
            v-model="checkInData.qrCode"
            type="text"
            placeholder="Enter QR code or scan..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="showCheckInModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            @click="handleCheckIn"
            :disabled="!checkInData.eventId || !checkInData.qrCode || checkingIn"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="checkingIn">Checking In...</span>
            <span v-else>Check In</span>
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '@/stores/eventStore'
import { useTeamStore } from '@/stores/teamStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Event, Team } from '@/types/api'

const router = useRouter()
const eventStore = useEventStore()
const teamStore = useTeamStore()
const { can } = usePermissions()

const loading = ref(false)
const creating = ref(false)
const checkingIn = ref(false)
const showCreateModal = ref(false)
const showCheckInModal = ref(false)
const viewMode = ref<'table' | 'calendar'>('table')
const currentPage = ref(1)
const itemsPerPage = 10

const filters = reactive({
  search: '',
  category: '',
  linkedTeamId: '',
  dateRange: ''
})

const newEvent = reactive({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  category: 'meeting' as const,
  linkedTeamId: '',
  attendanceType: 'required' as const
})

const checkInData = reactive({
  eventId: '',
  qrCode: ''
})

const canCreate = computed(() => can('create', 'Event'))
const canEdit = computed(() => can('update', 'Event'))
const canDelete = computed(() => can('delete', 'Event'))

const availableTeams = computed(() => teamStore.teams.filter(t => t.status === 'active'))

const filteredEvents = computed(() => {
  let events = eventStore.events

  if (filters.search) {
    const search = filters.search.toLowerCase()
    events = events.filter(event => 
      event.title.toLowerCase().includes(search) ||
      event.description?.toLowerCase().includes(search)
    )
  }

  if (filters.category) {
    events = events.filter(event => event.category === filters.category)
  }

  if (filters.linkedTeamId) {
    events = events.filter(event => event.linkedTeamId === filters.linkedTeamId)
  }

  if (filters.dateRange) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (filters.dateRange) {
      case 'today':
        events = events.filter(event => {
          const eventDate = new Date(event.startTime)
          return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
        })
        break
      case 'week':
        events = events.filter(event => {
          const eventDate = new Date(event.startTime)
          return eventDate >= weekStart && eventDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        })
        break
      case 'month':
        events = events.filter(event => {
          const eventDate = new Date(event.startTime)
          return eventDate >= monthStart && eventDate < new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
        })
        break
      case 'upcoming':
        events = events.filter(event => new Date(event.startTime) > now)
        break
      case 'past':
        events = events.filter(event => new Date(event.startTime) < now)
        break
    }
  }

  return events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
})

const totalPages = computed(() => Math.ceil(filteredEvents.value.length / itemsPerPage))
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredEvents.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const upcomingEvents = computed(() => 
  eventStore.events.filter(event => new Date(event.startTime) > new Date())
)

onMounted(async () => {
  await loadData()
})

watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

const loadData = async () => {
  try {
    loading.value = true
    await Promise.all([
      eventStore.fetchEvents(),
      teamStore.fetchTeams()
    ])
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
}

const viewEvent = (eventId: string) => {
  router.push(`/events/${eventId}`)
}

const editEvent = (eventId: string) => {
  router.push(`/events/${eventId}/edit`)
}

const deleteEvent = async (eventId: string) => {
  if (!confirm('Are you sure you want to delete this event?')) return
  
  try {
    await eventStore.deleteEvent(eventId)
    await loadData()
  } catch (error) {
    console.error('Failed to delete event:', error)
  }
}

const handleCreateEvent = async () => {
  try {
    creating.value = true
    
    await eventStore.createEvent({
      title: newEvent.title,
      description: newEvent.description,
      startTime: new Date(newEvent.startTime),
      endTime: new Date(newEvent.endTime),
      category: newEvent.category,
      linkedTeamId: newEvent.linkedTeamId || null,
      attendanceType: newEvent.attendanceType
    })
    
    // Reset form and close modal
    Object.assign(newEvent, {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      category: 'meeting',
      linkedTeamId: '',
      attendanceType: 'required'
    })
    
    showCreateModal.value = false
    await loadData()
  } catch (error) {
    console.error('Failed to create event:', error)
  } finally {
    creating.value = false
  }
}

const handleCheckIn = async () => {
  try {
    checkingIn.value = true
    
    const result = await eventStore.checkInAttendance({
      qrCode: checkInData.qrCode,
      eventId: checkInData.eventId
    })
    
    if (result.success) {
      alert(`Check-in successful for ${result.user?.name}`)
      showCheckInModal.value = false
      Object.assign(checkInData, { eventId: '', qrCode: '' })
    } else {
      alert(`Check-in failed: ${result.message}`)
    }
  } catch (error) {
    console.error('Failed to check in:', error)
    alert('Check-in failed. Please try again.')
  } finally {
    checkingIn.value = false
  }
}
</script>
