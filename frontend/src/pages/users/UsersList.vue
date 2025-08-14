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
          <label for="paid-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            id="paid-filter"
            v-model="filters.isPaid"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Payment Statuses</option>
            <option :value="true">Paid</option>
            <option :value="false">Unpaid</option>
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
      </div>
    </div>

    <!-- Users Table -->
    <DataTable
      :data="filteredUsers"
      :columns="tableColumns"
      search-placeholder="Search members..."
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
    <BaseModal
      :is-open="showCreateModal || showEditModal"
      :title="showEditModal ? 'Edit Member' : 'Add Member'"
      size="lg"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label for="displayName" class="block text-sm font-medium text-gray-700">
            Display Name *
          </label>
          <input
            id="displayName"
            v-model="form.displayName"
            type="text"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="isActive" class="flex items-center">
              <input
                id="isActive"
                v-model="form.isActive"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Active Member</span>
            </label>
          </div>
          
          <div>
            <label for="isPaid" class="flex items-center">
              <input
                id="isPaid"
                v-model="form.isPaid"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Paid Member</span>
            </label>
          </div>
        </div>
        
        <div>
          <label for="paidUntil" class="block text-sm font-medium text-gray-700">
            Paid Until
          </label>
          <input
            id="paidUntil"
            v-model="form.paidUntil"
            type="date"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label for="authentikGroups" class="block text-sm font-medium text-gray-700">
            Authentik Groups
          </label>
          <select
            id="authentikGroups"
            v-model="form.authentikGroups"
            multiple
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option
              v-for="group in groups"
              :key="group.id"
              :value="group.name"
            >
              {{ group.name }}
            </option>
          </select>
        </div>
      </form>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="outline"
            @click="closeModal"
          >
            Cancel
          </BaseButton>
          <BaseButton
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            {{ showEditModal ? 'Update' : 'Create' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

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
import type { User, Team, Group, UserCreate, UserUpdate } from '@/types/api'

const userStore = useUserStore()
const teamStore = useTeamStore()
const groupStore = useGroupStore()
const { can } = usePermissions()

// State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const userToDelete = ref<User | null>(null)

// Filters
const filters = ref({
  isActive: '',
  isPaid: '',
  teamId: '',
  groupId: ''
})

// Form
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  displayName: '',
  isActive: true,
  isPaid: false,
  paidUntil: '',
  authentikGroups: [] as string[]
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
  let filtered = [...users.value]
  
  if (filters.value.isActive !== '') {
    filtered = filtered.filter(user => user.isActive === filters.value.isActive)
  }
  
  if (filters.value.isPaid !== '') {
    filtered = filtered.filter(user => user.isPaid === filters.value.isPaid)
  }
  
  if (filters.value.teamId) {
    filtered = filtered.filter(user => 
      user.teams.some(team => team.id === filters.value.teamId)
    )
  }
  
  if (filters.value.groupId) {
    filtered = filtered.filter(user => 
      user.authentikGroups.includes(filters.value.groupId)
    )
  }
  
  return filtered
})

// Methods
const editUser = (user: User) => {
  form.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    displayName: user.displayName,
    isActive: user.isActive,
    isPaid: user.isPaid,
    paidUntil: user.paidUntil || '',
    authentikGroups: [...user.authentikGroups]
  }
  showEditModal.value = true
}

const deleteUser = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    displayName: '',
    isActive: true,
    isPaid: false,
    paidUntil: '',
    authentikGroups: []
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    if (showEditModal.value && userToDelete.value) {
      const updateData: UserUpdate = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        displayName: form.value.displayName,
        isActive: form.value.isActive,
        isPaid: form.value.isPaid,
        paidUntil: form.value.paidUntil || undefined,
        authentikGroups: form.value.authentikGroups
      }
      await userStore.updateUser(userToDelete.value.id, updateData)
    } else {
      const createData: UserCreate = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        displayName: form.value.displayName,
        authentikGroups: form.value.authentikGroups
      }
      await userStore.createUser(createData)
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    isSubmitting.value = false
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
watch(filters, () => {
  // Reset to first page when filters change
}, { deep: true })
</script>
