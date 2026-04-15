import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiService from '@/services/api'
import type { WorkshopSeries, WorkshopSeriesCreate, WorkshopSeriesUpdate, BadgeClass } from '@/types/api'

export const useSeriesStore = defineStore('series', () => {
  const seriesList = ref<WorkshopSeries[]>([])
  const currentSeries = ref<WorkshopSeries | null>(null)
  const badgeClasses = ref<BadgeClass[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAllSeries() {
    try {
      isLoading.value = true
      error.value = null
      const response = await apiService.getSeries()
      seriesList.value = response.data ?? []
      return seriesList.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch series'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSeries(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const series = await apiService.getSeriesById(id)
      currentSeries.value = series
      return series
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch series'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createSeries(data: WorkshopSeriesCreate) {
    try {
      isLoading.value = true
      error.value = null
      const newSeries = await apiService.createSeries(data)
      seriesList.value.unshift(newSeries)
      return newSeries
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create series'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateSeries(id: string, data: WorkshopSeriesUpdate) {
    try {
      isLoading.value = true
      error.value = null
      const updated = await apiService.updateSeries(id, data)
      const index = seriesList.value.findIndex(s => s.id === id)
      if (index !== -1) seriesList.value[index] = updated
      if (currentSeries.value?.id === id) currentSeries.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update series'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteSeries(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await apiService.deleteSeries(id)
      seriesList.value = seriesList.value.filter(s => s.id !== id)
      if (currentSeries.value?.id === id) currentSeries.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete series'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBadgeClasses() {
    try {
      const response = await apiService.getBadgeClasses()
      badgeClasses.value = response.data ?? []
      return badgeClasses.value
    } catch (err) {
      console.error('Failed to fetch badge classes:', err)
      badgeClasses.value = []
      return []
    }
  }

  return {
    seriesList,
    currentSeries,
    badgeClasses,
    isLoading,
    error,
    fetchAllSeries,
    fetchSeries,
    createSeries,
    updateSeries,
    deleteSeries,
    fetchBadgeClasses,
  }
})
