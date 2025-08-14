<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Edit User</h1>
      <p class="text-gray-600 mt-2">Update user profile information</p>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="graduationYear" class="block text-sm font-medium text-gray-700 mb-2">
              Graduation Year
            </label>
            <input
              id="graduationYear"
              v-model="form.graduationYear"
              type="number"
              min="2000"
              max="2030"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Membership & Status -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Membership & Status</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="membershipStatus" class="block text-sm font-medium text-gray-700 mb-2">
              Membership Status
            </label>
            <select
              id="membershipStatus"
              v-model="form.membershipStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label for="paidStatus" class="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              id="paidStatus"
              v-model="form.paidStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              v-model="form.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="member">Member</option>
              <option value="exec-board">Executive Board</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label for="qrCode" class="block text-sm font-medium text-gray-700 mb-2">
              QR Code
            </label>
            <input
              id="qrCode"
              v-model="form.qrCode"
              type="text"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
            <p class="text-xs text-gray-500 mt-1">Auto-generated QR code for attendance</p>
          </div>
        </div>
      </div>

      <!-- Teams Assignment -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Team Assignments</h3>
        
        <div class="space-y-4">
          <div v-for="team in availableTeams" :key="team.id" class="flex items-center">
            <input
              :id="`team-${team.id}`"
              type="checkbox"
              :value="team.id"
              v-model="form.teamIds"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label :for="`team-${team.id}`" class="ml-3 text-sm text-gray-700">
              {{ team.name }} ({{ team.type }})
            </label>
          </div>
          
          <p v-if="availableTeams.length === 0" class="text-gray-500 text-sm">
            No teams available for assignment
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="$router.go(-1)"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="saving">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useTeamStore } from '@/stores/teamStore'
import { usePermissions } from '@/composables/usePermissions'
import type { User, Team } from '@/types/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const teamStore = useTeamStore()
const { can } = usePermissions()

const loading = ref(false)
const saving = ref(false)
const availableTeams = ref<Team[]>([])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  graduationYear: '',
  membershipStatus: 'active' as const,
  paidStatus: 'unpaid' as const,
  role: 'member' as const,
  qrCode: '',
  teamIds: [] as string[]
})

const errors = reactive({
  name: '',
  email: ''
})

const canEdit = computed(() => can('update', 'User'))

onMounted(async () => {
  if (!canEdit.value) {
    router.push('/users')
    return
  }

  const userId = route.params.id as string
  
  try {
    loading.value = true
    
    // Load user data
    const user = await userStore.fetchUserById(userId)
    if (user) {
      Object.assign(form, {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        graduationYear: user.graduationYear?.toString() || '',
        membershipStatus: user.membershipStatus || 'active',
        paidStatus: user.paidStatus || 'unpaid',
        role: user.role || 'member',
        qrCode: user.qrCode || '',
        teamIds: user.teams?.map(t => t.id) || []
      })
    }

    // Load available teams
    await teamStore.fetchTeams()
    availableTeams.value = teamStore.teams
  } catch (error) {
    console.error('Failed to load user data:', error)
  } finally {
    loading.value = false
  }
})

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  errors.name = ''
  errors.email = ''

  if (!form.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    saving.value = true
    
    const userId = route.params.id as string
    const updateData = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      graduationYear: form.graduationYear ? parseInt(form.graduationYear) : null,
      membershipStatus: form.membershipStatus,
      paidStatus: form.paidStatus,
      role: form.role,
      teamIds: form.teamIds
    }

    await userStore.updateUser(userId, updateData)
    
    // Redirect to user details
    router.push(`/users/${userId}`)
  } catch (error) {
    console.error('Failed to update user:', error)
  } finally {
    saving.value = false
  }
}
</script>
