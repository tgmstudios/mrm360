<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">{{ isEditing ? 'Edit Group' : 'Create Group' }}</h1>
      <p class="text-gray-600 mt-2">{{ isEditing ? 'Update group information' : 'Create a new group' }}</p>
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
              Group Name *
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
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              Group Type *
            </label>
            <select
              id="type"
              v-model="form.type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a type</option>
              <option value="academic">Academic</option>
              <option value="social">Social</option>
              <option value="professional">Professional</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the group's purpose and activities..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Group Settings -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Group Settings</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="maxMembers" class="block text-sm font-medium text-gray-700 mb-2">
              Maximum Members
            </label>
            <input
              id="maxMembers"
              v-model="form.maxMembers"
              type="number"
              min="1"
              max="1000"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="isPrivate" class="block text-sm font-medium text-gray-700 mb-2">
              Privacy Setting
            </label>
            <select
              id="isPrivate"
              v-model="form.isPrivate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="false">Public</option>
              <option :value="true">Private</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="form.isActive"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Group is active</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3">
        <router-link
          :to="isEditing ? `/groups/${groupId}` : '/groups'"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </router-link>
        <button
          type="submit"
          :disabled="submitting"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Saving...' : (isEditing ? 'Update Group' : 'Create Group') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({
  name: '',
  type: '',
  description: '',
  maxMembers: 50,
  isPrivate: false,
  isActive: true
})

const groupId = computed(() => route.params.id as string)
const isEditing = computed(() => !!groupId.value)

onMounted(async () => {
  if (isEditing.value) {
    await loadGroup()
  }
})

async function loadGroup() {
  loading.value = true
  try {
    // TODO: Load group data from API
    // const group = await groupStore.getGroup(groupId.value)
    // form.value = { ...group }
  } catch (error) {
    toast.error('Failed to load group')
    console.error('Error loading group:', error)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  errors.value = {}

  try {
    if (isEditing.value) {
      // TODO: Update group
      // await groupStore.updateGroup(groupId.value, form.value)
      toast.success('Group updated successfully')
    } else {
      // TODO: Create group
      // const newGroup = await groupStore.createGroup(form.value)
      toast.success('Group created successfully')
    }
    
    router.push('/groups')
  } catch (error: any) {
    if (error.errors) {
      errors.value = error.errors
    } else {
      toast.error(isEditing.value ? 'Failed to update group' : 'Failed to create group')
    }
    console.error('Error saving group:', error)
  } finally {
    submitting.value = false
  }
}
</script>
