<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Background Tasks</h1>
        <p class="mt-2 text-sm text-gray-700">
          Monitor and manage background tasks and job queues in MRM360.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <BaseButton
          @click="refreshTasks"
          :loading="loading"
          variant="outline"
        >
          Refresh
        </BaseButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Tasks</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Completed</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.completed }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Failed</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.failed }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Triggers (Exec Board Only) -->
    <div v-if="can('manage', 'Task')" class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Trigger Example Tasks</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseButton
          @click="triggerTask('email')"
          :loading="triggeringTask"
          variant="outline"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          Send Test Email
        </BaseButton>

        <BaseButton
          @click="triggerTask('qr-code')"
          :loading="triggeringTask"
          variant="outline"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Generate QR Code
        </BaseButton>

        <BaseButton
          @click="triggerTask('sync-groups')"
          :loading="triggeringTask"
          variant="outline"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Sync Groups
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tasks..."
              class="block w-full pl-10 pr-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            v-model="statusFilter"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div class="flex items-end">
          <BaseButton
            @click="refreshTasks"
            :loading="loading"
            variant="outline"
          >
            Refresh Tasks
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Tasks Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Task
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Result
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="task in filteredTasks" :key="task.id">
              <!-- Parent Task Row -->
              <tr class="hover:bg-gray-50" v-if="!task.parentTaskId">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <button
                      v-if="task.subtasks && task.subtasks.length > 0"
                      @click="toggleTaskExpansion(task.id)"
                      class="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg 
                        :class="[
                          'w-4 h-4 transition-transform',
                          expandedTasks.includes(task.id) ? 'rotate-90' : ''
                        ]"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ task.name }}</div>
                      <div class="text-sm text-gray-500">{{ task.description || '-' }}</div>
                      <div v-if="task.subtasks && task.subtasks.length > 0" class="text-xs text-blue-600">
                        {{ task.subtasks.length }} subtask{{ task.subtasks.length !== 1 ? 's' : '' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : '',
                      task.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' : '',
                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : '',
                      task.status === 'FAILED' ? 'bg-red-100 text-red-800' : ''
                    ]"
                  >
                    {{ task.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(task.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(task.updatedAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="task.result" class="max-w-xs truncate">
                    {{ task.result }}
                  </div>
                  <div v-else class="text-gray-400">-</div>
                </td>
              </tr>
              
              <!-- Subtask Rows (when expanded) -->
              <template v-if="task.subtasks && task.subtasks.length > 0 && expandedTasks.includes(task.id)">
                <tr 
                  v-for="subtask in sortedSubtasks(task.subtasks)" 
                  :key="subtask.id"
                  class="hover:bg-gray-50 bg-gray-25"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-8 h-8 flex items-center justify-center mr-2">
                        <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-700">{{ subtask.name }}</div>
                        <div class="text-xs text-gray-500">Step {{ (subtask.stepIndex || 0) + 1 }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17l9.2-9.2M17 17V7H7"></path>
                      </svg>
                      <span class="text-blue-600 font-medium">{{ task.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        subtask.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : '',
                        subtask.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' : '',
                        subtask.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : '',
                        subtask.status === 'FAILED' ? 'bg-red-100 text-red-800' : ''
                      ]"
                    >
                      {{ subtask.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(subtask.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(subtask.updatedAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div v-if="subtask.result" class="max-w-xs truncate">
                      {{ subtask.result }}
                    </div>
                    <div v-else class="text-gray-400">-</div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTasks.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery || statusFilter ? 'Try adjusting your search or filter criteria.' : 'No background tasks have been created yet.' }}
        </p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
      <div class="flex-1 flex justify-between sm:hidden">
        <BaseButton
          variant="outline"
          size="sm"
          @click="currentPage > 1 && (currentPage = currentPage - 1)"
          :disabled="currentPage === 1"
        >
          Previous
        </BaseButton>
        <BaseButton
          variant="outline"
          size="sm"
          @click="currentPage < totalPages && (currentPage = currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next
        </BaseButton>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
            to
            <span class="font-medium">{{ Math.min(currentPage * pageSize, totalTasks) }}</span>
            of
            <span class="font-medium">{{ totalTasks }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <BaseButton
              variant="outline"
              size="sm"
              @click="currentPage > 1 && (currentPage = currentPage - 1)"
              :disabled="currentPage === 1"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </BaseButton>
            
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="{
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium': true,
                'z-10 bg-indigo-50 border-indigo-500 text-indigo-600': page === currentPage,
                'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': page !== currentPage
              }"
            >
              {{ page }}
            </button>

            <BaseButton
              variant="outline"
              size="sm"
              @click="currentPage < totalPages && (currentPage = currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
            </BaseButton>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from 'vue-toastification'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Task } from '@/types/api'

const taskStore = useTaskStore()
const { can } = usePermissions()
const toast = useToast()

// Reactive data
const loading = ref(false)
const triggeringTask = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 20
const expandedTasks = ref<string[]>([])

// Computed properties
const filteredTasks = computed(() => {
  let tasks = taskStore.tasks

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.name.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    )
  }

  if (statusFilter.value) {
    tasks = tasks.filter(task => task.status === statusFilter.value)
  }

  return tasks
})

const totalTasks = computed(() => filteredTasks.value.length)
const totalPages = computed(() => Math.ceil(totalTasks.value / pageSize))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const stats = computed(() => {
  const tasks = taskStore.tasks
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    running: tasks.filter(t => t.status === 'RUNNING').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    failed: tasks.filter(t => t.status === 'FAILED').length
  }
})

// Methods
const refreshTasks = async () => {
  loading.value = true
  try {
    await taskStore.fetchTasks()
    toast.success('Tasks refreshed successfully')
  } catch (error) {
    toast.error('Failed to refresh tasks')
    console.error('Error refreshing tasks:', error)
  } finally {
    loading.value = false
  }
}

const triggerTask = async (type: string) => {
  triggeringTask.value = true
  try {
    await taskStore.enqueueTask(type)
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} task enqueued successfully`)
    await refreshTasks()
  } catch (error) {
    toast.error(`Failed to enqueue ${type} task`)
    console.error(`Error enqueueing ${type} task:`, error)
  } finally {
    triggeringTask.value = false
  }
}

const toggleTaskExpansion = (taskId: string) => {
  const index = expandedTasks.value.indexOf(taskId)
  if (index > -1) {
    expandedTasks.value.splice(index, 1)
  } else {
    expandedTasks.value.push(taskId)
  }
}

const sortedSubtasks = (subtasks: Task[]) => {
  return subtasks.slice().sort((a, b) => (a.stepIndex || 0) - (b.stepIndex || 0))
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

// Watchers
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await taskStore.fetchTasks()
  } catch (error) {
    toast.error('Failed to load tasks')
    console.error('Error loading tasks:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bg-gray-25 {
  background-color: #f9fafb;
}
</style>
