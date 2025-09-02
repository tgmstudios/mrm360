<template>
  <div class="min-h-screen bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-100">
              {{ isEditing ? 'Edit Event' : 'Create New Event' }}
            </h1>
            <p class="text-gray-400 mt-2">
              {{ isEditing ? 'Update event details and settings' : 'Set up a new event for your organization' }}
            </p>
          </div>
          <BaseButton
            @click="goBack"
            variant="outline"
            size="lg"
          >
            Cancel
          </BaseButton>
        </div>
      </div>

      <!-- Event Form -->
      <div class="bg-gray-800 rounded-lg shadow border border-gray-700">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Provisioning Progress -->
          <div v-if="provisionTask" class="mb-4 p-4 border border-blue-600 rounded-md bg-blue-900">
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium text-blue-200">Setting up event resources</div>
              <div class="text-sm text-blue-300">{{ provisionTask.progress }}%</div>
            </div>
            <div class="w-full bg-blue-800 rounded h-2 overflow-hidden">
              <div class="bg-blue-400 h-2" :style="{ width: provisionTask.progress + '%' }"></div>
            </div>
            <ul class="mt-3 space-y-1">
              <li v-for="sub in sortedSubtasks" :key="sub.id" class="flex items-center text-sm">
                <span class="w-4 h-4 mr-2" :class="{
                  'text-green-400': sub.status === 'COMPLETED',
                  'text-blue-400': sub.status === 'RUNNING',
                  'text-gray-400': sub.status === 'PENDING',
                  'text-red-400': sub.status === 'FAILED'
                }">
                  <svg v-if="sub.status === 'COMPLETED'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <svg v-else-if="sub.status === 'RUNNING'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  <svg v-else-if="sub.status === 'FAILED'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </span>
                <span class="flex-1 text-blue-200">{{ sub.name }}</span>
                <span class="text-xs text-blue-300">{{ sub.progress }}%</span>
              </li>
            </ul>
          </div>
          <!-- Basic Information -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-100">Basic Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  :class="{ 'border-red-500': errors.title }"
                  placeholder="Enter event title"
                />
                <p v-if="errors.title" class="mt-1 text-sm text-red-400">{{ errors.title }}</p>
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  v-model="form.category"
                  class="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                >
                  <option value="MEETING">Meeting</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="SOCIAL">Social</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                placeholder="Enter event description"
              ></textarea>
            </div>
          </div>

          <!-- Date and Time -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-100">Date and Time</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="startTime" class="block text-sm font-medium text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  id="startTime"
                  v-model="form.startTime"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  :class="{ 'border-red-500': errors.startTime }"
                />
                <p v-if="errors.startTime" class="mt-1 text-sm text-red-400">{{ errors.startTime }}</p>
              </div>

              <div>
                <label for="endTime" class="block text-sm font-medium text-gray-300 mb-2">
                  End Time *
                </label>
                <input
                  id="endTime"
                  v-model="form.endTime"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  :class="{ 'border-red-500': errors.endTime }"
                />
                <p v-if="errors.endTime" class="mt-1 text-sm text-red-400">{{ errors.endTime }}</p>
              </div>
            </div>
          </div>

          <!-- Event Settings -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-100">Event Settings</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="attendanceType" class="block text-sm font-medium text-gray-300 mb-2">
                  Attendance Type
                </label>
                <select
                  id="attendanceType"
                  v-model="form.attendanceType"
                  class="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                >
                  <option value="SOFT">Soft (Optional)</option>
                  <option value="STRICT">Strict (Required)</option>
                </select>
              </div>

              <div>
                <label for="linkedTeam" class="block text-sm font-medium text-gray-300 mb-2">
                  Linked Team
                </label>
                <select
                  id="linkedTeam"
                  v-model="form.linkedTeamId"
                  class="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                >
                  <option value="">No team</option>
                  <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                    {{ team.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <BaseButton
              @click="goBack"
              variant="outline"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
              :loading="isSubmitting"
              :disabled="!isFormValid"
            >
              {{ isEditing ? 'Update Event' : 'Create Event' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '@/stores/eventStore'
import { useTaskStore } from '@/stores/taskStore'
import { useTeamStore } from '@/stores/teamStore'

import { usePermissions } from '@/composables/usePermissions'
import type { Task } from '@/types/api'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Team } from '@/types/api'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()

usePermissions()

const eventId = computed(() => route.params.id as string)
const isEditing = computed(() => !!eventId.value)

const submitting = ref(false)
const teams = ref<Team[]>([])


const form = ref({
  title: '',
  description: '',
  category: 'MEETING' as 'MEETING' | 'COMPETITION' | 'WORKSHOP' | 'SOCIAL' | 'TRAINING',
  startTime: '',
  endTime: '',
  attendanceType: 'SOFT' as 'SOFT' | 'STRICT',
  linkedTeamId: '' as string
})

const errors = ref<Record<string, string>>({})
const provisionTask = ref<Task | null>(null)
let provisionTimer: number | null = null

onMounted(async () => {
  await loadTeams()
  
  if (isEditing.value) {
    await loadEvent()
  }
})

const loadTeams = async () => {
  try {
    await teamStore.fetchTeams()
  } catch (error) {
    console.error('Failed to load teams:', error)
  }
}



const loadEvent = async () => {
  try {
    const event = await eventStore.fetchEvent(eventId.value)
    if (event) {
      form.value = {
        title: event.title || '',
        description: event.description || '',
        category: (event.category as any) || 'MEETING',
        startTime: event.startTime ? formatDateTimeLocal(event.startTime) : '',
        endTime: event.endTime ? formatDateTimeLocal(event.endTime) : '',
        attendanceType: event.attendanceType || 'SOFT',
        linkedTeamId: event.linkedTeamId || ''
      }
    }
  } catch (error) {
    console.error('Failed to load event:', error)
  }
}



const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Event title is required'
  }
  
  if (!form.value.startTime) {
    errors.value.startTime = 'Start time is required'
  }
  
  if (form.value.endTime && form.value.startTime) {
    const startTime = new Date(form.value.startTime)
    const endTime = new Date(form.value.endTime)
    
    if (endTime <= startTime) {
      errors.value.endTime = 'End time must be after start time'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  
  try {
    const eventData = {
      ...form.value,
      startTime: new Date(form.value.startTime).toISOString(),
      endTime: form.value.endTime ? new Date(form.value.endTime).toISOString() : new Date(form.value.startTime).toISOString()
    }
    
    if (isEditing.value) {
      await eventStore.updateEvent(eventId.value, eventData)
    } else {
      const created = await eventStore.createEvent(eventData)
      startProvisionPolling('EVENT', created.id)
    }
    
    router.push('/tasks')
  } catch (error) {
    console.error('Failed to save event:', error)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

const formatDateTimeLocal = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const startProvisionPolling = (entityType: 'EVENT' | 'TEAM', entityId: string) => {
  if (provisionTimer) {
    clearInterval(provisionTimer)
    provisionTimer = null
  }
  provisionTask.value = {
    id: '',
    name: 'Provision',
    status: 'RUNNING',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: []
  } as any
  provisionTimer = window.setInterval(async () => {
    try {
      const resp = await taskStore.fetchTasks({ entityType, entityId, page: 1, limit: 1 })
      const task = resp.data[0]
      if (task) {
        provisionTask.value = task as any
        if (task.status === 'COMPLETED' || task.status === 'FAILED') {
          if (provisionTimer) clearInterval(provisionTimer)
          provisionTimer = null
        }
      }
    } catch (e) {
      // ignore polling errors
    }
  }, 1000)
}

const sortedSubtasks = computed(() => (provisionTask.value?.subtasks || []).slice().sort((a, b) => a.stepIndex - b.stepIndex))
</script>
