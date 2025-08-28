<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Members</h1>
        <p class="mt-2 text-sm text-gray-700">
          A list of all members in MRM360 including their name, email, status, and teams.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <BaseButton
          v-if="can('create', 'User')"
          @click="showCreateModal = true"
          icon="PlusIcon"
        >
          Add Member
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            v-model="filters.isActive"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>
        
        <div>
          <label for="search-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search-filter"
            v-model="filters.search"
            type="text"
            placeholder="Search by name or email..."
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label for="role-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role-filter"
            v-model="filters.role"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="EXEC_BOARD">Executive Board</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
        
        <div>
          <label for="paid-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            id="paid-filter"
            v-model="filters.paidStatus"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Payment Statuses</option>
            <option value="true">Paid</option>
            <option value="false">Unpaid</option>
          </select>
        </div>
        
        <div>
          <label for="team-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Team
          </label>
          <select
            id="team-filter"
            v-model="filters.teamId"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
        
        <div>
          <label for="group-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Group
          </label>
          <select
            id="group-filter"
            v-model="filters.groupId"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
        
        <div class="flex items-end">
          <BaseButton
            variant="outline"
            size="sm"
            @click="clearFilters"
          >
            Clear Filters
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <DataTable
      :data="filteredUsers"
      :columns="tableColumns"
      :search-query="filters.search"
      search-placeholder="Search members..."
      @search="filters.search = $event"
    >
      <template #actions>
        <BaseButton
          variant="outline"
          size="sm"
          @click="exportUsers"
        >
          Export
        </BaseButton>
      </template>

      <!-- Custom cell for status -->
      <template #cell-isActive="{ value }">
        <span
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          ]"
        >
          {{ value ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <!-- Custom cell for payment status -->
      <template #cell-isPaid="{ value }">
        <span
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          ]"
        >
          {{ value ? 'Paid' : 'Unpaid' }}
        </span>
      </template>

      <!-- Custom cell for teams -->
      <template #cell-teams="{ value }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="team in value.slice(0, 2)"
            :key="team.id"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ team.name }}
          </span>
          <span
            v-if="value.length > 2"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            +{{ value.length - 2 }} more
          </span>
        </div>
      </template>

      <!-- Custom cell for actions -->
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <router-link
            :to="`/users/${item.id}`"
            class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            View
          </router-link>
          <BaseButton
            v-if="can('update', 'User')"
            variant="ghost"
            size="sm"
            @click="editUser(item)"
          >
            Edit
          </BaseButton>
          <BaseButton
            v-if="can('delete', 'User')"
            variant="ghost"
            size="sm"
            @click="deleteUser(item)"
          >
            Delete
          </BaseButton>
        </div>
      </template>
    </DataTable>

         <!-- Create/Edit User Modal -->
     <UserEditModal
       :is-open="showCreateModal || showEditModal"
       :user="userToEdit"
       :available-groups="groups"
       :is-edit-mode="showEditModal"
       @close="closeModal"
       @submit="handleModalSubmit"
     />

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :is-open="showDeleteModal"
      title="Delete Member"
      size="sm"
      @close="showDeleteModal = false"
    >
      <p class="text-sm text-gray-500">
        Are you sure you want to delete {{ userToDelete?.displayName }}? This action cannot be undone.
      </p>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="outline"
            @click="showDeleteModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="isDeleting"
            @click="confirmDelete"
          >
            Delete
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useTeamStore } from '@/stores/teamStore'
import { useGroupStore } from '@/stores/groupStore'
import { usePermissions } from '@/composables/usePermissions'
import { PlusIcon } from '@heroicons/vue/24/outline'
import DataTable from '@/components/common/DataTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import UserEditModal from '@/components/users/UserEditModal.vue'
import type { User, Team, Group, UserCreate, UserUpdate } from '@/types/api'

const userStore = useUserStore()
const teamStore = useTeamStore()
const groupStore = useGroupStore()
const { can } = usePermissions()

// State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const userToDelete = ref<User | null>(null)
const userToEdit = ref<User | null>(null)

// Filters
const filters = ref({
  page: 1,
  limit: 20,
  sortBy: 'displayName',
  sortOrder: 'asc',
  search: '',
  role: '',
  paidStatus: '',
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

const filteredUsers = computed(() => users.value)

// Methods
const editUser = (user: User) => {
  userToEdit.value = user
  showEditModal.value = true
}

const deleteUser = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  userToEdit.value = null
}



const handleModalSubmit = async (data: UserCreate | UserUpdate) => {
  try {
    if (showEditModal.value && userToEdit.value) {
      await userStore.updateUser(userToEdit.value.id, data as UserUpdate)
    } else {
      await userStore.createUser(data as UserCreate)
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

const clearFilters = () => {
  filters.value = {
    page: 1,
    limit: 20,
    sortBy: 'displayName',
    sortOrder: 'asc',
    search: '',
    role: '',
    paidStatus: '',
    teamId: '',
    groupId: ''
  }
}

const confirmDelete = async () => {
  if (!userToDelete.value) return
  
  isDeleting.value = true
  
  try {
    await userStore.deleteUser(userToDelete.value.id)
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    isDeleting.value = false
  }
}

const exportUsers = () => {
  // TODO: Implement export functionality
  console.log('Export users')
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
