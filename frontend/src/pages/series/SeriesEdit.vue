<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-100">
            {{ isEditing ? 'Edit Series' : 'Create Workshop Series' }}
          </h1>
          <p class="mt-2 text-sm text-gray-400">
            {{ isEditing ? 'Update series details and badge settings' : 'Create a new workshop series with automatic badge rewards' }}
          </p>
        </div>
        <router-link
          to="/series"
          class="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Series
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2">
        <div class="bg-gray-800 rounded-lg shadow border border-gray-700">
          <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
            <!-- Basic Information -->
            <div>
              <h3 class="text-lg font-medium text-gray-100 mb-4">Basic Information</h3>
              <div class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                    Series Name *
                  </label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    :class="{ 'border-red-500': errors.name }"
                    placeholder="e.g. Spring 2026 Cyber Defense Series"
                  />
                  <p v-if="errors.name" class="mt-1 text-sm text-red-400">{{ errors.name }}</p>
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    v-model="form.description"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    placeholder="Describe what this workshop series covers"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Badge Settings -->
            <div>
              <h3 class="text-lg font-medium text-gray-100 mb-4">Badge Settings</h3>
              <div class="space-y-4">
                <div>
                  <label for="requiredCheckIns" class="block text-sm font-medium text-gray-300 mb-2">
                    Required Check-ins *
                  </label>
                  <input
                    id="requiredCheckIns"
                    v-model.number="form.requiredCheckIns"
                    type="number"
                    min="1"
                    required
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    :class="{ 'border-red-500': errors.requiredCheckIns }"
                    placeholder="e.g. 5"
                  />
                  <p class="mt-1 text-sm text-gray-400">
                    Number of workshops a member must check in to before receiving a badge invite
                  </p>
                  <p v-if="errors.requiredCheckIns" class="mt-1 text-sm text-red-400">{{ errors.requiredCheckIns }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Badge Invite Mode</label>
                  <div class="flex items-center space-x-4">
                    <label class="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        :value="true"
                        v-model="form.autoIssue"
                        class="text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600"
                      />
                      <span class="ml-2 text-sm text-gray-300">Auto-invite on threshold</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        :value="false"
                        v-model="form.autoIssue"
                        class="text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600"
                      />
                      <span class="ml-2 text-sm text-gray-300">Manual invite only</span>
                    </label>
                  </div>
                  <p class="mt-1 text-sm text-gray-400">
                    {{ form.autoIssue
                      ? 'Badge invite will be sent automatically when a member reaches the required check-ins'
                      : 'Admins must manually send badge invites from the series details page' }}
                  </p>
                </div>

                <div>
                  <label for="badgeClass" class="block text-sm font-medium text-gray-300 mb-2">
                    Badge Class *
                  </label>
                  <div v-if="loadingBadges" class="flex items-center text-sm text-gray-400">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Loading badge classes from OpenBadge...
                  </div>
                  <div v-else-if="badgeClasses.length === 0" class="text-sm text-yellow-400">
                    No badge classes found. Create one in OpenBadge first.
                  </div>
                  <select
                    v-else
                    id="badgeClass"
                    v-model="form.badgeClassId"
                    required
                    class="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
                    :class="{ 'border-red-500': errors.badgeClassId }"
                  >
                    <option value="">Select a badge class</option>
                    <option v-for="badge in badgeClasses" :key="badge.id" :value="badge.id">
                      {{ badge.name }}
                    </option>
                  </select>
                  <p v-if="errors.badgeClassId" class="mt-1 text-sm text-red-400">{{ errors.badgeClassId }}</p>

                  <!-- Selected Badge Preview -->
                  <div v-if="selectedBadge" class="mt-3 p-3 bg-gray-750 rounded-lg border border-gray-600">
                    <div class="flex items-start space-x-3">
                      <img
                        v-if="selectedBadge.imageUrl"
                        :src="selectedBadge.imageUrl"
                        :alt="selectedBadge.name"
                        class="w-12 h-12 rounded-lg object-cover"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-200">{{ selectedBadge.name }}</div>
                        <div class="text-xs text-gray-400 mt-1">{{ selectedBadge.description }}</div>
                        <div v-if="selectedBadge.tags?.length" class="flex flex-wrap gap-1 mt-2">
                          <span
                            v-for="tag in selectedBadge.tags"
                            :key="tag"
                            class="px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded-full"
                          >
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <BaseButton @click="$router.back()" variant="outline">
                Cancel
              </BaseButton>
              <BaseButton
                type="submit"
                :loading="submitting"
                :disabled="!isFormValid"
              >
                {{ isEditing ? 'Update Series' : 'Create Series' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-100 mb-4">
              How Series Work
            </h3>
            <div class="space-y-3 text-sm text-gray-400">
              <p>
                <strong class="text-gray-300">Workshop Series</strong> group related workshops together and automatically reward members who attend enough sessions.
              </p>
              <p>
                <strong class="text-gray-300">Badge Invite:</strong> When a member checks in to enough workshops in the series (meeting the required check-in threshold), they receive a badge invite via email from OpenBadge. Once claimed, the badge is issued to them.
              </p>
              <p>
                <strong class="text-gray-300">Assigning Workshops:</strong> After creating a series, assign workshops to it from the event create/edit page using the "Workshop Series" dropdown.
              </p>
              <p>
                <strong class="text-gray-300">Duplicate Prevention:</strong> Each member only receives one badge invite per series, even if they exceed the required check-ins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeriesStore } from '@/stores/seriesStore'
import { usePermissions } from '@/composables/usePermissions'
import BaseButton from '@/components/common/BaseButton.vue'
import type { BadgeClass } from '@/types/api'

const route = useRoute()
const router = useRouter()
const seriesStore = useSeriesStore()
usePermissions()

const seriesId = computed(() => route.params.id as string)
const isEditing = computed(() => !!seriesId.value)

const submitting = ref(false)
const loadingBadges = ref(false)
const badgeClasses = ref<BadgeClass[]>([])

const form = ref({
  name: '',
  description: '',
  badgeClassId: '',
  requiredCheckIns: 3,
  autoIssue: true,
})

const errors = ref<Record<string, string>>({})

const selectedBadge = computed(() =>
  badgeClasses.value.find(b => b.id === form.value.badgeClassId) || null
)

const isFormValid = computed(() =>
  form.value.name.trim() !== '' &&
  form.value.badgeClassId !== '' &&
  form.value.requiredCheckIns >= 1
)

onMounted(async () => {
  loadingBadges.value = true
  try {
    badgeClasses.value = await seriesStore.fetchBadgeClasses()
  } catch (err) {
    console.error('Failed to load badge classes:', err)
  } finally {
    loadingBadges.value = false
  }

  if (isEditing.value) {
    try {
      const series = await seriesStore.fetchSeries(seriesId.value)
      if (series) {
        form.value = {
          name: series.name,
          description: series.description || '',
          badgeClassId: series.badgeClassId,
          requiredCheckIns: series.requiredCheckIns,
          autoIssue: series.autoIssue ?? true,
        }
      }
    } catch (err) {
      console.error('Failed to load series:', err)
    }
  }
})

const handleSubmit = async () => {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = 'Name is required'
  if (!form.value.badgeClassId) errors.value.badgeClassId = 'Badge class is required'
  if (form.value.requiredCheckIns < 1) errors.value.requiredCheckIns = 'Must be at least 1'
  if (Object.keys(errors.value).length > 0) return

  submitting.value = true
  try {
    const data = {
      name: form.value.name,
      description: form.value.description || undefined,
      badgeClassId: form.value.badgeClassId,
      requiredCheckIns: form.value.requiredCheckIns,
      autoIssue: form.value.autoIssue,
    }

    if (isEditing.value) {
      await seriesStore.updateSeries(seriesId.value, data)
      router.push(`/series/${seriesId.value}`)
    } else {
      const created = await seriesStore.createSeries(data)
      router.push(`/series/${created.id}`)
    }
  } catch (err) {
    console.error('Failed to save series:', err)
  } finally {
    submitting.value = false
  }
}
</script>
