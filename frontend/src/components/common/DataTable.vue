<template>
  <div class="bg-white shadow-sm rounded-lg">
    <!-- Search and Actions Bar -->
    <div class="px-4 py-3 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
      <!-- Search -->
      <div class="flex-1 max-w-lg">
        <label for="search" class="sr-only">Search</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="search"
            v-model="searchQuery"
            type="search"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :placeholder="searchPlaceholder"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-3 sm:mt-0 sm:ml-4">
        <slot name="actions" />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : '',
                column.width ? column.width : ''
              ]"
              @click="column.sortable ? handleSort(column.key) : undefined"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="flex flex-col">
                  <ChevronUpIcon
                    :class="[
                      'h-3 w-3',
                      sortBy === column.key && sortOrder === 'asc'
                        ? 'text-indigo-500'
                        : 'text-gray-400'
                    ]"
                  />
                  <ChevronDownIcon
                    :class="[
                      'h-3 w-3 -mt-1',
                      sortBy === column.key && sortOrder === 'desc'
                        ? 'text-indigo-500'
                        : 'text-gray-400'
                    ]"
                  />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(item, index) in paginatedData"
            :key="getItemKey(item, index)"
            class="hover:bg-gray-50"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                column.width ? column.width : ''
              ]"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getItemValue(item, column.key)"
                :column="column"
              >
                {{ formatCellValue(getItemValue(item, column.key), column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-if="paginatedData.length === 0"
      class="text-center py-12"
    >
      <slot name="empty">
        <div class="text-gray-500">
          <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating a new item.' }}
          </p>
        </div>
      </slot>
    </div>

    <!-- Pagination -->
    <div
      v-if="showPagination && totalPages > 1"
      class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
    >
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ startIndex + 1 }}</span>
            to
            <span class="font-medium">{{ endIndex }}</span>
            of
            <span class="font-medium">{{ totalItems }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="goToPage(currentPage - 1)"
            >
              <span class="sr-only">Previous</span>
              <ChevronLeftIcon class="h-5 w-5" />
            </button>
            
            <template v-for="page in visiblePages" :key="page">
              <button
                v-if="page !== '...'"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <span
                v-else
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
            </template>
            
            <button
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="goToPage(currentPage + 1)"
            >
              <span class="sr-only">Next</span>
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon
} from '@heroicons/vue/24/outline'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  formatter?: (value: any) => string
}

interface Props {
  data: any[]
  columns: Column[]
  searchPlaceholder?: string
  showPagination?: boolean
  itemsPerPage?: number
  searchable?: boolean
  sortable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...',
  showPagination: true,
  itemsPerPage: 10,
  searchable: true,
  sortable: true
})

// State
const searchQuery = ref('')
const currentPage = ref(1)
const sortBy = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Computed
const filteredData = computed(() => {
  let filtered = [...props.data]
  
  // Search
  if (props.searchable && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(query)
      )
    )
  }
  
  // Sort
  if (props.sortable && sortBy.value) {
    filtered.sort((a, b) => {
      const aVal = getItemValue(a, sortBy.value)
      const bVal = getItemValue(b, sortBy.value)
      
      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return filtered
})

const totalItems = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + props.itemsPerPage, totalItems.value))

const paginatedData = computed(() => {
  if (!props.showPagination) return filteredData.value
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const handleSearch = () => {
  currentPage.value = 1
}

const handleSort = (key: string) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const getItemKey = (item: any, index: number) => {
  return item.id || item.key || index
}

const getItemValue = (item: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const formatCellValue = (value: any, column: Column) => {
  if (column.formatter) {
    return column.formatter(value)
  }
  
  if (value === null || value === undefined) {
    return '-'
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  return String(value)
}

// Watch for data changes
watch(() => props.data, () => {
  currentPage.value = 1
}, { deep: true })
</script>
