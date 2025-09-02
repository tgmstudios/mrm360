<template>
  <div class="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
    <h3 class="text-lg font-medium text-gray-100 mb-4">
      Member Paid Status Sync
    </h3>
    
    <div class="space-y-4">
      <!-- Current Status -->
      <div class="bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-300 mb-2">Current Status</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-400">Total Members:</span>
            <span class="text-gray-200 ml-2">{{ memberCount }}</span>
          </div>
          <div>
            <span class="text-gray-400">Last Sync:</span>
            <span class="text-gray-200 ml-2">{{ lastSyncTime || 'Never' }}</span>
          </div>
        </div>
      </div>

      <!-- Sync Actions -->
      <div class="space-y-3">
        <button
          @click="syncPaidStatuses"
          :disabled="isSyncing"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          <span v-if="isSyncing" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Syncing...
          </span>
          <span v-else>Sync Paid Statuses with Authentik</span>
        </button>

        <button
          @click="getMemberPaidGroup"
          :disabled="isLoadingMembers"
          class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          <span v-if="isLoadingMembers" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
          <span v-else>Get Member-Paid Group Members</span>
        </button>
      </div>

      <!-- Results -->
      <div v-if="syncResult" class="bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-300 mb-2">Sync Results</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Processed:</span>
            <span class="text-green-400">{{ syncResult.processed }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Errors:</span>
            <span class="text-red-400">{{ syncResult.errors }}</span>
          </div>
          <div class="text-gray-300 mt-2">
            {{ syncResult.message }}
          </div>
        </div>
      </div>

      <!-- Member List -->
      <div v-if="memberPaidGroup.length > 0" class="bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-300 mb-2">
          Member-Paid Group Members ({{ memberPaidGroup.length }})
        </h4>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="member in memberPaidGroup"
            :key="member.id"
            class="flex justify-between items-center py-2 px-3 bg-gray-600 rounded"
          >
            <div>
              <div class="text-gray-200 font-medium">
                {{ member.displayName || `${member.firstName} ${member.lastName}` }}
              </div>
              <div class="text-gray-400 text-xs">
                {{ member.email }}
              </div>
            </div>
            <div class="text-xs">
              <span
                :class="[
                  'px-2 py-1 rounded-full',
                  member.paidStatus ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                ]"
              >
                {{ member.paidStatus ? 'Paid' : 'Unpaid' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="bg-red-900 border border-red-700 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-200">
              Error
            </h3>
            <div class="mt-2 text-sm text-red-300">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiService from '@/services/api'

interface SyncResult {
  processed: number
  errors: number
  message: string
}

interface MemberPaidGroupMember {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName?: string
  authentikId: string
  paidStatus: boolean
}

const isSyncing = ref(false)
const isLoadingMembers = ref(false)
const syncResult = ref<SyncResult | null>(null)
const memberPaidGroup = ref<MemberPaidGroupMember[]>([])
const error = ref<string | null>(null)
const memberCount = ref(0)
const lastSyncTime = ref<string | null>(null)

const syncPaidStatuses = async () => {
  try {
    isSyncing.value = true
    error.value = null
    syncResult.value = null

    const response = await apiService.post('/admin/sync-paid-status')
    
    if (response.success) {
      syncResult.value = {
        processed: response.processed,
        errors: response.errors,
        message: response.message
      }
      lastSyncTime.value = new Date().toISOString()
    } else {
      error.value = response.message || 'Sync failed'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to sync paid statuses'
  } finally {
    isSyncing.value = false
  }
}

const getMemberPaidGroup = async () => {
  try {
    isLoadingMembers.value = true
    error.value = null

    const response = await apiService.get('/admin/member-paid-group')
    
    if (response.success) {
      memberPaidGroup.value = response.members
      memberCount.value = response.count
    } else {
      error.value = response.message || 'Failed to get member-paid group'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to get member-paid group'
  } finally {
    isLoadingMembers.value = false
  }
}

onMounted(() => {
  // Load initial data
  getMemberPaidGroup()
})
</script>
