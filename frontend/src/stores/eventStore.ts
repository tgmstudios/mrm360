import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/api'
import type { Event, EventCreate, EventUpdate, EventFilters, PaginatedResponse } from '@/types/api'

export const useEventStore = defineStore('events', () => {
  // State
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const filters = ref<EventFilters>({
    page: 1,
    limit: 20,
    sortBy: 'startTime',
    sortOrder: 'asc'
  })

  // Getters
  const upcomingEvents = computed(() => 
    events.value.filter(event => 
      new Date(event.startTime) > new Date()
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  )

  const pastEvents = computed(() => 
    events.value.filter(event => 
      new Date(event.endTime) < new Date()
    ).sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
  )

  const activeEvents = computed(() => 
    events.value.filter(event => new Date(event.startTime) > new Date())
  )

  const eventsByTeam = computed(() => (teamId: string) => 
    events.value.filter(event => 
      event.linkedTeamId === teamId
    )
  )

  // Actions
  async function fetchEvents(newFilters?: Partial<EventFilters>) {
    try {
      isLoading.value = true
      error.value = null
      
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }
      
      const response: PaginatedResponse<Event> = await apiService.getEvents(filters.value)
      
      events.value = response.data ?? []
      pagination.value = response.pagination
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch events'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEvent(id: string) {
    try {
      isLoading.value = true
      error.value = null
      
      const event = await apiService.getEvent(id)
      currentEvent.value = event
      
      return event
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch event'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createEvent(eventData: EventCreate) {
    try {
      isLoading.value = true
      error.value = null
      
      const newEvent = await apiService.createEvent(eventData)
      events.value.unshift(newEvent)
      pagination.value.total += 1
      
      return newEvent
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create event'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateEvent(id: string, eventData: EventUpdate) {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedEvent = await apiService.updateEvent(id, eventData)
      
      // Update in events array
      const index = events.value.findIndex(event => event.id === id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }
      
      // Update current event if it's the same
      if (currentEvent.value?.id === id) {
        currentEvent.value = updatedEvent
      }
      
      return updatedEvent
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update event'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEvent(id: string) {
    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteEvent(id)
      
      // Remove from events array
      const index = events.value.findIndex(event => event.id === id)
      if (index !== -1) {
        events.value.splice(index, 1)
        pagination.value.total -= 1
      }
      
      // Clear current event if it's the same
      if (currentEvent.value?.id === id) {
        currentEvent.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete event'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function rsvpToEvent(eventId: string, attending: boolean) {
    try {
      await apiService.rsvpToEvent(eventId, attending)
      
      // Update event in store
      const event = events.value.find(e => e.id === eventId)
      if (event) {
        // This would need to be updated based on the current user
        // For now, we'll just mark it as updated
        event.updatedAt = new Date().toISOString()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to RSVP to event'
      throw err
    }
  }

  function clearError() {
    error.value = null
  }

  function resetFilters() {
    filters.value = {
      page: 1,
      limit: 20,
      sortBy: 'startTime',
      sortOrder: 'asc'
    }
  }

  return {
    // State
    events,
    currentEvent,
    isLoading,
    error,
    pagination,
    filters,
    
    // Getters
    upcomingEvents,
    pastEvents,
    activeEvents,
    eventsByTeam,
    
    // Actions
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpToEvent,
    clearError,
    resetFilters
  }
})
