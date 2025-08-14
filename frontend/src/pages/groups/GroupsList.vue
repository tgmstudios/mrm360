<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Groups</h1>
            <p class="text-gray-600 mt-2">Manage organization groups and memberships</p>
          </div>
          <div class="flex space-x-3">
            <BaseButton
              v-if="canCreateGroup"
              @click="createGroup"
              variant="primary"
              size="lg"
            >
              Create Group
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
              Search Groups
            </label>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name or description"
              @input="debouncedSearch"
            />
          </div>
          
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              Group Type
            </label>
            <select
              id="type"
              v-model="filters.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              @change="applyFilters"
            >
              <option value="">All Types</option>
              <option value="department">Department</option>
              <option value="committee">Committee</option>
              <option value="project">Project</option>
              <option value="interest">Interest Group</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              @change="applyFilters"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label for="sortBy" class="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sortBy"
              v-model="filters.sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              @change="applyFilters"
            >
              <option value="name">Name</option>
              <option value="memberCount">Member Count</option>
              <option value="createdAt">Created Date</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Groups Grid -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="filteredGroups.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
        <p class="text-gray-500">
          {{ filters.search || filters.type || filters.status ? 'Try adjusting your filters' : 'Get started by creating your first group' }}
        </p>
        <div v-if="!filters.search && !filters.type && !filters.status" class="mt-4">
          <BaseButton
            v-if="canCreateGroup"
            @click="createGroup"
            variant="primary"
          >
            Create Group
          </BaseButton>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="group in paginatedGroups"
          :key="group.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewGroup(group.id)"
        >
          <div class="p-6">
            <!-- Group Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ group.name }}</h3>
                <p class="text-sm text-gray-500">{{ group.description || 'No description' }}</p>
              </div>
              <div class="flex space-x-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ group.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <!-- Group Info -->
            <div class="space-y-3 mb-4">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span class="text-sm text-gray-600">{{ group.type || 'No type' }}</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="text-sm text-gray-600">{{ group.memberCount || 0 }} members</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm text-gray-600">{{ formatDate(group.createdAt) }}</span>
              </div>
            </div>

            <!-- Group Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <div class="flex space-x-2">
                <BaseButton
                  @click.stop="viewGroup(group.id)"
                  variant="outline"
                  size="sm"
                >
                  View
                </BaseButton>
                <BaseButton
                  v-if="canUpdateGroup"
                  @click.stop="editGroup(group.id)"
                  variant="secondary"
                  size="sm"
                >
                  Edit
                </BaseButton>
              </div>
              
              <div v-if="canDeleteGroup" class="flex space-x-2">
                <BaseButton
                  @click.stop="deleteGroup(group.id)"
                  variant="danger"
                  size="sm"
                >
                  Delete
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <nav class="flex items-center space-x-2">
          <BaseButton
            @click="goToPage(currentPage - 1)"
            variant="outline"
            size="sm"
            :disabled="currentPage === 1"
          >
            Previous
          </BaseButton>
          
          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-md',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <BaseButton
            @click="goToPage(currentPage + 1)"
            variant="outline"
            size="sm"
            :disabled="currentPage === totalPages"
          >
            Next
          </BaseButton>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/groupStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Group } from '@/types/api'

const router = useRouter()
const groupStore = useGroupStore()
const { can } = usePermissions()

const loading = ref(false)
const groups = ref<Group[]>([])
const currentPage = ref(1)
const itemsPerPage = 12

const filters = ref({
  search: '',
  type: '',
  status: '',
  sortBy: 'name'
})

const canCreateGroup = computed(() => can('create', 'Group'))
const canUpdateGroup = computed(() => can('update', 'Group'))
const canDeleteGroup = computed(() => can('delete', 'Group'))

const filteredGroups = computed(() => {
  let filtered = [...groups.value]
  
  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(group => 
      group.name.toLowerCase().includes(search) ||
      (group.description && group.description.toLowerCase().includes(search))
    )
  }
  
  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter(group => group.type === filters.value.type)
  }
  
  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(group => group.status === filters.value.status)
  }
  
  // Sort
  filtered.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'memberCount':
        return (b.memberCount || 0) - (a.memberCount || 0)
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'type':
        return (a.type || '').localeCompare(b.type || '')
      default:
        return 0
    }
  })
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredGroups.value.length / itemsPerPage))

const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredGroups.value.slice(start, end)
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

onMounted(async () => {
  await loadGroups()
})

watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

const loadGroups = async () => {
  loading.value = true
  try {
    const groupsData = await groupStore.getGroups()
    groups.value = groupsData
  } catch (error) {
    console.error('Failed to load groups:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      applyFilters()
    }, 300)
  }
})()

const applyFilters = () => {
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const createGroup = () => {
  router.push('/groups/create')
}

const viewGroup = (groupId: string) => {
  router.push(`/groups/${groupId}`)
}

const editGroup = (groupId: string) => {
  router.push(`/groups/${groupId}/edit`)
}

const deleteGroup = async (groupId: string) => {
  if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
    return
  }
  
  try {
    await groupStore.deleteGroup(groupId)
    await loadGroups()
  } catch (error) {
    console.error('Failed to delete group:', error)
    alert('Failed to delete group. Please try again.')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>
