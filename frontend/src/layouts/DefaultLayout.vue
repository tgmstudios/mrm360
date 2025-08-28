<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation Bar -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-indigo-600">MRM360</h1>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.to"
              :class="[
                isNavigationItemActive(item.to)
                  ? 'text-indigo-600 border-indigo-500 bg-indigo-50'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                'inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all duration-200 rounded-t-md'
              ]"
            >
              {{ item.name }}
            </router-link>
          </div>

          <!-- User Menu -->
          <div class="flex items-center">
            <div class="ml-3 relative">
              <div>
                <button
                  @click="isUserMenuOpen = !isUserMenuOpen"
                  class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span class="text-white text-sm font-medium">
                      {{ userInitials }}
                    </span>
                  </div>
                  <span class="ml-2 text-gray-700">{{ authStore.user?.displayName }}</span>
                </button>
              </div>
              
              <!-- User Dropdown Menu -->
              <div
                v-if="isUserMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="isUserMenuOpen = false"
                >
                  Your Profile
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- Page-Specific Sidebar -->
      <div class="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
        <div class="p-4">
          <!-- Sidebar Header with Current Section -->
          <div class="mb-6 pb-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 transition-all duration-300">
              {{ currentSectionTitle }}
            </h2>
            <p class="text-sm text-gray-500 mt-1 transition-all duration-300">
              {{ currentSectionDescription }}
            </p>
          </div>
          
          <!-- Page-Specific Sidebar Content -->
          <nav class="space-y-2">
            <!-- Dashboard Sidebar -->
            <div v-if="currentPath === '/dashboard'" class="space-y-2">
              <div class="bg-gray-50 rounded-lg p-3">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Create Actions
                </h3>
                <div class="space-y-2">
                  <button
                    v-if="can('create', 'User')"
                    @click="createUser"
                    class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-md transition-all duration-200 group border border-transparent hover:border-green-200"
                  >
                    <PlusIcon class="mr-3 h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors duration-200" />
                    Create User
                  </button>
                  
                  <button
                    v-if="can('create', 'Team')"
                    @click="createTeam"
                    class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-md transition-all duration-200 group border border-transparent hover:border-green-200"
                  >
                    <PlusIcon class="mr-3 h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors duration-200" />
                    Create Team
                  </button>
                  
                  <button
                    v-if="can('create', 'Event')"
                    @click="createEvent"
                    class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-md transition-all duration-200 group border border-transparent hover:border-green-200"
                  >
                    <PlusIcon class="mr-3 h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors duration-200" />
                    Create Event
                  </button>
                </div>
              </div>
            </div>

            <!-- Users Sidebar -->
            <div v-else-if="currentPath.startsWith('/users')" class="space-y-2">
              <router-link
                to="/users"
                :class="[
                  currentPath === '/users'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <UsersIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                All Members
              </router-link>
              
              <router-link
                to="/users/new"
                :class="[
                  currentPath === '/users/new'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <PlusIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                Add Member
              </router-link>
            </div>

            <!-- Teams Sidebar -->
            <div v-else-if="currentPath.startsWith('/teams')" class="space-y-2">
              <router-link
                to="/teams"
                :class="[
                  currentPath === '/teams'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <UserGroupIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                All Teams
              </router-link>
              
              <router-link
                to="/teams/new"
                :class="[
                  currentPath === '/teams/new'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <PlusIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                Create Team
              </router-link>
            </div>

            <!-- Events Sidebar -->
            <div v-else-if="currentPath.startsWith('/events')" class="space-y-2">
              <router-link
                to="/events"
                :class="[
                  currentPath === '/events'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <CalendarIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                All Events
              </router-link>
              
              <router-link
                to="/events/new"
                :class="[
                  currentPath === '/events/new'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <PlusIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                Create Event
              </router-link>
            </div>

            <!-- Tasks Sidebar -->
            <div v-else-if="currentPath.startsWith('/tasks')" class="space-y-2">
              <router-link
                to="/tasks"
                :class="[
                  currentPath === '/tasks'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <CogIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                All Tasks
              </router-link>
            </div>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-6">
        <!-- Breadcrumb Navigation -->
        <nav v-if="breadcrumbs.length > 0" class="mb-6">
          <ol class="flex items-center space-x-2 text-sm text-gray-500">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
              <router-link
                v-if="index < breadcrumbs.length - 1"
                :to="crumb.path"
                class="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {{ crumb.name }}
              </router-link>
              <span v-else class="text-gray-900 font-medium">
                {{ crumb.name }}
              </span>
              <ChevronRightIcon
                v-if="index < breadcrumbs.length - 1"
                class="h-4 w-4 mx-2 text-gray-400"
              />
            </li>
          </ol>
        </nav>
        
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useTeamStore } from '@/stores/teamStore'
import { usePermissions } from '@/composables/usePermissions'
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  CogIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const teamStore = useTeamStore()
const { can } = usePermissions()

const isUserMenuOpen = ref(false)

// Current path for sidebar logic
const currentPath = computed(() => route.path)

// Navigation items for top bar
const navigationItems = computed(() => [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Users', to: '/users' },
  { name: 'Teams', to: '/teams' },
  { name: 'Events', to: '/events' },
  { name: 'Tasks', to: '/tasks' }
])

// Helper function to determine if a navigation item is active
const isNavigationItemActive = (itemPath: string) => {
  const currentPath = route.path
  
  // Special case for dashboard - only active when exactly on dashboard
  if (itemPath === '/dashboard') {
    return currentPath === '/dashboard'
  }
  
  // For other items, check if current path starts with the item path
  // This handles nested routes like /users/123, /teams/456/edit, etc.
  return currentPath.startsWith(itemPath)
}

// Current section title and description
const currentSectionTitle = computed(() => {
  const currentPath = route.path
  
  if (currentPath === '/dashboard') {
    return 'Dashboard'
  } else if (currentPath.startsWith('/users')) {
    if (currentPath === '/users/new') {
      return 'Create User'
    } else if (currentPath.includes('/edit')) {
      return 'Edit User'
    } else if (currentPath.match(/\/users\/[^\/]+$/)) {
      return 'User Details'
    }
    return 'Users'
  } else if (currentPath.startsWith('/teams')) {
    if (currentPath === '/teams/new') {
      return 'Create Team'
    } else if (currentPath.includes('/edit')) {
      return 'Edit Team'
    } else if (currentPath.match(/\/teams\/[^\/]+$/)) {
      return 'Team Details'
    }
    return 'Teams'
  } else if (currentPath.startsWith('/events')) {
    if (currentPath === '/events/new') {
      return 'Create Event'
    } else if (currentPath.includes('/edit')) {
      return 'Edit Event'
    } else if (currentPath.includes('/checkin')) {
      return 'Event Check-In'
    } else if (currentPath.match(/\/events\/[^\/]+$/)) {
      return 'Event Details'
    }
    return 'Events'
  } else if (currentPath.startsWith('/tasks')) {
    return 'Tasks'
  }
  
  return 'Navigation'
})

const currentSectionDescription = computed(() => {
  const currentPath = route.path
  
  if (currentPath === '/dashboard') {
    return 'Overview and key metrics'
  } else if (currentPath.startsWith('/users')) {
    if (currentPath === '/users/new') {
      return 'Add a new user to the system'
    } else if (currentPath.includes('/edit')) {
      return 'Modify user information'
    } else if (currentPath.match(/\/users\/[^\/]+$/)) {
      return 'View user details and activity'
    }
    return 'Manage system users'
  } else if (currentPath.startsWith('/teams')) {
    if (currentPath === '/teams/new') {
      return 'Create a new team'
    } else if (currentPath.includes('/edit')) {
      return 'Modify team information'
    } else if (currentPath.match(/\/teams\/[^\/]+$/)) {
      return 'View team details and members'
    }
    return 'Manage teams and memberships'
  } else if (currentPath.startsWith('/events')) {
    if (currentPath === '/events/new') {
      return 'Schedule a new event'
    } else if (currentPath.includes('/edit')) {
      return 'Modify event information'
    } else if (currentPath.includes('/checkin')) {
      return 'Check in event attendees'
    } else if (currentPath.match(/\/events\/[^\/]+$/)) {
      return 'View event details and attendees'
    }
    return 'Manage events and schedules'
  } else if (currentPath.startsWith('/tasks')) {
    return 'Manage tasks and assignments'
  }
  
  return 'Navigate through the system'
})

// Breadcrumb navigation
const breadcrumbs = computed(() => {
  const currentPath = route.path
  const crumbs = [{ name: 'Home', path: '/dashboard' }]
  
  if (currentPath === '/dashboard') {
    return crumbs
  }
  
  if (currentPath.startsWith('/users')) {
    crumbs.push({ name: 'Users', path: '/users' })
    if (currentPath === '/users/new') {
      crumbs.push({ name: 'Create User', path: currentPath })
    } else if (currentPath.includes('/edit')) {
      crumbs.push({ name: 'Edit User', path: currentPath })
    } else if (currentPath.match(/\/users\/[^\/]+$/)) {
      crumbs.push({ name: 'User Details', path: currentPath })
    }
  } else if (currentPath.startsWith('/teams')) {
    crumbs.push({ name: 'Teams', path: '/teams' })
    if (currentPath === '/teams/new') {
      crumbs.push({ name: 'Create Team', path: currentPath })
    } else if (currentPath.includes('/edit')) {
      crumbs.push({ name: 'Edit Team', path: currentPath })
    } else if (currentPath.match(/\/teams\/[^\/]+$/)) {
      crumbs.push({ name: 'Team Details', path: currentPath })
    }
  } else if (currentPath.startsWith('/events')) {
    crumbs.push({ name: 'Events', path: '/events' })
    if (currentPath === '/events/new') {
      crumbs.push({ name: 'Create Event', path: currentPath })
    } else if (currentPath.includes('/edit')) {
      crumbs.push({ name: 'Edit Event', path: currentPath })
    } else if (currentPath.includes('/checkin')) {
      crumbs.push({ name: 'Event Check-In', path: currentPath })
    } else if (currentPath.match(/\/events\/[^\/]+$/)) {
      crumbs.push({ name: 'Event Details', path: currentPath })
    }
  } else if (currentPath.startsWith('/tasks')) {
    crumbs.push({ name: 'Tasks', path: '/tasks' })
  }
  
  return crumbs
})

// User initials for avatar
const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return '?'
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
})

// Handle logout
const handleLogout = async () => {
  isUserMenuOpen.value = false
  await authStore.logout()
  router.push('/auth/login')
}

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Navigation functions for create buttons
const createUser = () => {
  router.push('/users/new')
}

const createTeam = () => {
  // Navigate to teams page and trigger the modal
  router.push('/teams')
  // Use nextTick to ensure navigation completes before opening modal
  nextTick(() => {
    teamStore.openCreateModal()
  })
}

const createEvent = () => {
  router.push('/events/new')
}
</script>
