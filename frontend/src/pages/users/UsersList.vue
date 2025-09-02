<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-100">Members</h1>
        <p class="mt-2 text-sm text-gray-400">
          A list of all members in MRM360 including their name, email, status, and teams.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <!-- Add Member button removed - no modals in this app -->
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-700/50">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-900/50 rounded-lg">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-100">Filters</h3>
        </div>
        <BaseButton
          @click="clearFilters"
          variant="ghost"
          size="sm"
          class="text-gray-400 hover:text-gray-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Clear All
        </BaseButton>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Search -->
        <div class="space-y-2">
          <label for="search-filter" class="flex items-center text-sm font-medium text-gray-300">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Search
          </label>
          <input
            id="search-filter"
            v-model="filters.query"
            type="text"
            placeholder="Search by name or email..."
            class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        </div>
        
        <!-- Status -->
        <div class="space-y-2">
          <label for="status-filter" class="flex items-center text-sm font-medium text-gray-300">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Status
          </label>
          <select
            id="status-filter"
            v-model="filters.isActive"
            class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">All Statuses</option>
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>
        
        <!-- Payment Status -->
        <div class="space-y-2">
          <label for="paid-filter" class="flex items-center text-sm font-medium text-gray-300">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            Payment Status
          </label>
          <select
            id="paid-filter"
            v-model="filters.isPaid"
            class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">All Payment Statuses</option>
            <option :value="true">Paid</option>
            <option :value="false">Unpaid</option>
          </select>
        </div>
        
        <!-- Team -->
        <div class="space-y-2">
          <label for="team-filter" class="flex items-center text-sm font-medium text-gray-300">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Team
          </label>
          <select
            id="team-filter"
            v-model="filters.teamId"
            class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">All Teams</option>
            <option
              v-for="team in teams"
              :key="team.id"
              :value="team.id"
            >
              {{ team.name }}
            </option>
          </select>
        </div>
        
        <!-- Group -->
        <div class="space-y-2">
          <label for="group-filter" class="flex items-center text-sm font-medium text-gray-300">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Group
          </label>
          <select
            id="group-filter"
            v-model="filters.groupId"
            class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">All Groups</option>
            <option
              v-for="group in groups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-700">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Payment
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Teams
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-gray-800 divide-y divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user?.id" class="hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span class="text-sm font-medium text-white">
                        {{ getUserInitials(user) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-100">
                      {{ user.displayName }}
                    </div>
                    <div class="text-sm text-gray-400">
                      {{ user.firstName }} {{ user.lastName }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-300">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  user.isActive ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                ]">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  user.isPaid ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                ]">
                  {{ user.isPaid ? 'Paid' : 'Unpaid' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="team in user.teams"
                    :key="team.id"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200"
                  >
                    {{ team.name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <router-link
                    :to="`/users/${user.id}`"
                    class="text-blue-400 hover:text-blue-300"
                  >
                    View
                  </router-link>
                                     <button
                     @click="togglePaidStatus(user)"
                     :disabled="isTogglingPaidStatus === user.id"
                     :class="[
                       'transition-colors duration-200',
                       user.isPaid 
                         ? 'text-yellow-400 hover:text-yellow-300' 
                         : 'text-green-400 hover:text-green-300'
                     ]"
                   >
                     <span v-if="isTogglingPaidStatus === user.id" class="flex items-center">
                       <svg class="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       {{ user.isPaid ? 'Unpay' : 'Pay' }}
                     </span>
                     <span v-else>
                       {{ user.isPaid ? 'Unpay' : 'Pay' }}
                     </span>
                   </button>
                   <button
                     @click="deleteUser(user)"
                     class="text-red-400 hover:text-red-300"
                   >
                     Delete
                   </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredUsers.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-100">No users found</h3>
      <p class="mt-1 text-sm text-gray-400">
        {{ filters.query || filters.isActive !== undefined || filters.isPaid !== undefined || filters.teamId || filters.groupId ? 'Try adjusting your search or filter criteria.' : 'No users have been added yet.' }}
      </p>
    </div>

    <!-- Modals removed - no modals in this app -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useTeamStore } from '@/stores/teamStore'
import { useGroupStore } from '@/stores/groupStore'
import { useToast } from 'vue-toastification'
import type { User, Team, Group, UserFilters } from '@/types/api'
import BaseButton from '@/components/common/BaseButton.vue'

const userStore = useUserStore()
const teamStore = useTeamStore()
const groupStore = useGroupStore()
const toast = useToast()

// State
const isTogglingPaidStatus = ref<string | null>(null)

// Filters
const filters = ref<UserFilters>({
  page: 1,
  limit: 20,
  sortBy: 'displayName',
  sortOrder: 'asc',
  query: '',
  isActive: undefined,
  isPaid: undefined,
  teamId: '',
  groupId: ''
})

// Table columns
const tableColumns = [
  { key: 'displayName', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'isActive', label: 'Status', sortable: true },
  { key: 'isPaid', label: 'Payment', sortable: true },
  { key: 'teams', label: 'Teams', sortable: false },
  { key: 'createdAt', label: 'Joined', sortable: true, formatter: (value: string) => new Date(value).toLocaleDateString() },
  { key: 'actions', label: 'Actions', sortable: false, width: 'w-32' }
]

// Computed
const users = computed(() => userStore.users)
const teams = computed(() => teamStore.teams)
const groups = computed(() => groupStore.groups)

const filteredUsers = computed(() => {
  let filtered = users.value.filter(user => user && user.id) // Filter out undefined users

  // Apply search filter
  if (filters.value.query) {
    const query = filters.value.query.toLowerCase()
    filtered = filtered.filter(user => 
      user.displayName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (filters.value.isActive !== undefined) {
    filtered = filtered.filter(user => user.isActive === filters.value.isActive)
  }

  // Apply payment status filter
  if (filters.value.isPaid !== undefined) {
    filtered = filtered.filter(user => user.isPaid === filters.value.isPaid)
  }

  // Apply team filter
  if (filters.value.teamId) {
    const teamId = filters.value.teamId as string
    filtered = filtered.filter(user => 
      user.teams?.some(team => team.id === teamId)
    )
  }

  // Apply group filter
  if (filters.value.groupId) {
    const groupId = filters.value.groupId
    filtered = filtered.filter(user => 
      user.authentikGroups?.includes(groupId)
    )
  }

  return filtered
})

// Methods
const deleteUser = async (user: User) => {
  try {
    await userStore.deleteUser(user.id)
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const togglePaidStatus = async (user: User) => {
  if (!user?.id) {
    toast.error('Invalid user ID')
    return
  }
  
  isTogglingPaidStatus.value = user.id
  
  try {
    // Store the new paid status we're setting
    const newPaidStatus = !user.isPaid
    
    await userStore.updateUser(user.id, {
      isPaid: newPaidStatus
    })
    
    // Show success message since the operation completed
    toast.success(`User ${newPaidStatus ? 'paid' : 'unpaid'} successfully`)
    
  } catch (error) {
    console.error('Error toggling paid status:', error)
    toast.error('Failed to update paid status')
  } finally {
    isTogglingPaidStatus.value = null
  }
}



const clearFilters = () => {
  filters.value = {
    page: 1,
    limit: 20,
    sortBy: 'displayName',
    sortOrder: 'asc',
    query: '',
    isActive: undefined,
    isPaid: undefined,
    teamId: '',
    groupId: ''
  }
}

// Utility functions
const getUserInitials = (user: User) => {
  if (!user?.firstName || !user?.lastName) return '?'
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    teamStore.fetchTeams(),
    groupStore.fetchGroups()
  ])
})

// Watch filters for changes
watch(filters, async () => {
  // Reset to first page when filters change
  filters.value.page = 1;
  // Fetch users with new filters
  await userStore.fetchUsers(filters.value);
}, { deep: true })
</script>
