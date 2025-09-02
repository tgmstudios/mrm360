<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-100">Add New Member</h1>
          <p class="mt-2 text-sm text-gray-400">
            Create a new inactive member with basic information. The member will become active when they login and their account gets linked.
          </p>
        </div>
        <router-link
          to="/users"
          class="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Members
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Form -->
        <div class="bg-gray-800 rounded-lg shadow border border-gray-700">
          <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
            <!-- Basic Information -->
            <div>
              <h3 class="text-lg font-medium text-gray-100 mb-4">Basic Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    :class="{ 'border-red-500': errors.firstName }"
                    placeholder="Enter first name"
                  />
                  <p v-if="errors.firstName" class="mt-1 text-sm text-red-400">{{ errors.firstName }}</p>
                </div>

                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    :class="{ 'border-red-500': errors.lastName }"
                    placeholder="Enter last name"
                  />
                  <p v-if="errors.lastName" class="mt-1 text-sm text-red-400">{{ errors.lastName }}</p>
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    :class="{ 'border-red-500': errors.email }"
                    placeholder="Enter email address"
                  />
                  <p v-if="errors.email" class="mt-1 text-sm text-red-400">{{ errors.email }}</p>
                </div>

                <div>
                  <label for="displayName" class="block text-sm font-medium text-gray-300 mb-2">
                    Display Name *
                  </label>
                  <input
                    id="displayName"
                    v-model="form.displayName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    :class="{ 'border-red-500': errors.displayName }"
                    placeholder="Enter display name"
                  />
                  <p v-if="errors.displayName" class="mt-1 text-sm text-red-400">{{ errors.displayName }}</p>
                </div>

                <div>
                  <label for="role" class="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    v-model="form.role"
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="EXEC_BOARD">Executive Board</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Membership Status -->
            <div>
              <h3 class="text-lg font-medium text-gray-100 mb-4">Membership Status</h3>
              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    id="paidStatus"
                    v-model="form.paidStatus"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="paidStatus" class="ml-2 block text-sm text-gray-300">
                    <span class="font-medium">Paid Member</span>
                    <span class="text-gray-400 block">Mark this member as having paid their dues</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <router-link
                to="/users"
                class="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </router-link>
              <BaseButton
                type="submit"
                :loading="isSubmitting"
                :disabled="!isFormValid"
              >
                Add Member
              </BaseButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Information Card -->
        <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
              Member Information
            </h3>
            
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-100">Inactive Status</p>
                  <p class="text-sm text-gray-400">
                    New members are created as inactive. They will become active when they login and their account gets linked.
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-100">Account Linking</p>
                  <p class="text-sm text-gray-400">
                    When the member logs in for the first time, their account will be automatically linked and activated.
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-100">Automatic Setup</p>
                  <p class="text-sm text-gray-400">
                    The member will be automatically added to the appropriate groups and teams based on their role.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import type { UserCreate } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()
const { can } = usePermissions()

// Check permissions
const canCreate = computed(() => can('create', 'User'))

// State
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

// Form data
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  displayName: '',
  role: 'MEMBER' as 'MEMBER' | 'EXEC_BOARD' | 'ADMIN',
  paidStatus: false
})

// Computed properties
const isFormValid = computed(() => {
  return form.firstName && 
         form.lastName && 
         form.email && 
         form.displayName
})

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.firstName.trim()) {
    errors.value.firstName = 'First name is required'
  }

  if (!form.lastName.trim()) {
    errors.value.lastName = 'Last name is required'
  }

  if (!form.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!form.displayName.trim()) {
    errors.value.displayName = 'Display name is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  try {
    const createData: UserCreate = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      displayName: form.displayName,
      role: form.role,
      paidStatus: form.paidStatus,
      authentikGroups: []
    }
    
    const newUser = await userStore.createUser(createData)
    router.push(`/users/${newUser.id}`)
  } catch (error) {
    console.error('Failed to create user:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
