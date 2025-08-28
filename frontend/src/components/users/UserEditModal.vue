<template>
  <BaseModal
    :is-open="isOpen"
    :title="isEditMode ? 'Edit Member' : 'Add Member'"
    size="lg"
    @close="handleClose"
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
      
      <div v-if="!isEditMode">
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
        
        <div v-if="!isEditMode">
          <label for="role" class="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            v-model="form.role"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="MEMBER">Member</option>
            <option value="EXEC_BOARD">Executive Board</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
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
            v-for="group in availableGroups"
            :key="group.id"
            :value="group.id"
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
          @click="handleClose"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          {{ isEditMode ? 'Update' : 'Create' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import type { User, UserCreate, UserUpdate, Group } from '@/types/api'

interface Props {
  isOpen: boolean
  user?: User | null
  availableGroups: Group[]
  isEditMode?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: UserCreate | UserUpdate): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false
})

const emit = defineEmits<Emits>()

// Form state
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  displayName: '',
  isPaid: false,
  role: 'MEMBER' as 'MEMBER' | 'EXEC_BOARD' | 'ADMIN',
  authentikGroups: [] as string[]
})

const isSubmitting = ref(false)

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    displayName: '',
    isPaid: false,
    role: 'MEMBER',
    authentikGroups: []
  }
}

// Watch for user changes to populate form
watch(() => props.user, (newUser) => {
  if (newUser && props.isEditMode) {
    form.value = {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      displayName: newUser.displayName,
      isPaid: newUser.isPaid,
      role: newUser.role,
      authentikGroups: [...newUser.authentikGroups]
    }
  } else {
    resetForm()
  }
})

// Watch for modal open/close to reset form
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

// Initialize form when component mounts
onMounted(() => {
  if (props.user && props.isEditMode) {
    form.value = {
      firstName: props.user.firstName,
      lastName: props.user.lastName,
      email: props.user.email,
      displayName: props.user.displayName,
      isPaid: props.user.isPaid,
      role: props.user.role,
      authentikGroups: [...props.user.authentikGroups]
    }
  } else {
    resetForm()
  }
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    if (props.isEditMode) {
      const updateData: UserUpdate = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        displayName: form.value.displayName,
        isPaid: form.value.isPaid,
        authentikGroups: form.value.authentikGroups
      }
      emit('submit', updateData)
    } else {
      const createData: UserCreate = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        displayName: form.value.displayName,
        role: form.value.role,
        paidStatus: form.value.isPaid,
        authentikGroups: form.value.authentikGroups
      }
      emit('submit', createData)
    }
  } catch (error) {
    console.error('Error in form submission:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
