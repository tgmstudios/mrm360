<template>
  <div class="min-h-screen bg-gray-900 dark">
    <!-- Top Navigation Bar -->
    <nav class="bg-gray-800 shadow-lg border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <img src="@/assets/logo.png" alt="CCSO MRM Logo" class="h-8 w-auto mr-2" />
              <h1 class="text-xl font-bold text-blue-400">CCSO MRM</h1>
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
                  ? 'text-blue-400 border-blue-500 bg-gray-700'
                  : 'text-gray-300 border-transparent hover:text-gray-100 hover:border-gray-600 hover:bg-gray-700',
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
                  class="max-w-xs bg-gray-700 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-white text-sm font-medium">
                      {{ userInitials }}
                    </span>
                  </div>
                  <span class="ml-2 mr-4 text-gray-200">{{ authStore.user?.displayName }}</span>
                </button>
              </div>
              
              <!-- User Dropdown Menu -->
              <div
                v-if="isUserMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                  @click="isUserMenuOpen = false"
                >
                  Your Profile
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
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
      <div class="w-64 bg-gray-800 shadow-lg border-r border-gray-700 min-h-screen">
        <div class="p-4">
          <!-- Sidebar Header with Current Section -->
          <div class="mb-6 pb-4 border-b border-gray-700">
            <h2 class="text-lg font-semibold text-gray-100 transition-all duration-300">
              {{ currentSectionTitle }}
            </h2>
            <p class="text-sm text-gray-400 mt-1 transition-all duration-300">
              {{ currentSectionDescription }}
            </p>
          </div>
          
          <!-- Page-Specific Sidebar Content -->
          <nav class="space-y-2">
            <!-- Dashboard Sidebar -->
            <div v-if="currentPath === '/dashboard'" class="space-y-2">
              <!-- Quick Create Actions - Only show to admins -->
              <div v-if="authStore.user && (authStore.isAdmin || authStore.isExecBoard)" class="bg-gray-700 rounded-lg p-3">
                <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quick Create Actions
                </h3>
                <div class="space-y-2">
                  <button
                    v-if="can('create', 'User')"
                    @click="createUser"
                    class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-green-900 hover:text-green-300 rounded-md transition-all duration-200 group border border-transparent hover:border-green-700"
                  >
                    <UsersIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-green-400 transition-colors duration-200" />
                    Add Member
                  </button>
                  
                  <button
                    v-if="can('create', 'Team')"
                    @click="createTeam"
                    class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-blue-900 hover:text-blue-300 rounded-md transition-all duration-200 group border border-transparent hover:border-blue-700"
                  >
                    <UserGroupIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                    Create Team
                  </button>
                  
                  <button
                    v-if="can('create', 'Event')"
                    @click="createEvent"
                    class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-purple-900 hover:text-purple-300 rounded-md transition-all duration-200 group border border-transparent hover:border-purple-700"
                  >
                    <CalendarIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-200" />
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
                    ? 'bg-gray-700 border-blue-500 text-blue-300 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <UsersIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                All Members
              </router-link>
              
              <router-link
                to="/users/new"
                :class="[
                  currentPath === '/users/new'
                    ? 'bg-gray-700 border-blue-500 text-blue-300 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <PlusIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                Add Member
              </router-link>
            </div>

            <!-- Teams Sidebar -->
            <div v-else-if="currentPath.startsWith('/teams')" class="space-y-2">
              <router-link
                to="/teams"
                :class="[
                  currentPath === '/teams'
                    ? 'bg-gray-700 border-blue-500 text-blue-300 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <UserGroupIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                All Teams
              </router-link>
              
              <router-link
                to="/teams/new"
                :class="[
                  currentPath === '/teams/new'
                    ? 'bg-gray-700 border-blue-500 text-blue-300 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <PlusIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                Create Team
              </router-link>
            </div>

            <!-- Events Sidebar -->
            <div v-else-if="currentPath.startsWith('/events')" class="space-y-2">
              <router-link
                to="/events"
                :class="[
                  currentPath === '/events'
                    ? 'bg-gray-700 border-blue-500 text-blue-300 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <CalendarIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                All Events
              </router-link>
              
              <router-link
                to="/events/new"
                :class="[
                  currentPath === '/events/new'
                    ? 'bg-gray-700 border-blue-500 text-blue-300 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <PlusIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                Create Event
              </router-link>
            </div>

            <!-- Tasks Sidebar -->
            <div v-else-if="currentPath.startsWith('/tasks')" class="space-y-2">
              <router-link
                to="/tasks"
                :class="[
                  currentPath === '/tasks'
                    ? 'bg-gray-700 border-blue-500 text-blue-300 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200'
                ]"
              >
                <CogIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                All Tasks
              </router-link>
            </div>

            <!-- Profile Sidebar -->
            <div v-else-if="currentPath === '/profile'" class="space-y-2">
              <div class="bg-gray-700 rounded-lg p-3">
                <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Profile Settings
                </h3>
                <div class="space-y-2">
                  <div class="text-sm text-gray-300">
                    Manage your account settings, interests, and preferences
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-6">
        <!-- Breadcrumb Navigation -->
        <nav v-if="breadcrumbs.length > 0" class="mb-6">
          <ol class="flex items-center space-x-2 text-sm text-gray-400">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
              <router-link
                v-if="index < breadcrumbs.length - 1"
                :to="crumb.path"
                class="text-gray-400 hover:text-gray-200 transition-colors"
              >
                {{ crumb.name }}
              </router-link>
              <span v-else class="text-gray-100 font-medium">
                {{ crumb.name }}
              </span>
              <ChevronRightIcon
                v-if="index < breadcrumbs.length - 1"
                class="h-4 w-4 mx-2 text-gray-500"
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
import { initiateOAuthLogin } from '@/utils/oauth'
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
const { can, canManageUsers, canManageTeams, canManageEvents, canManageTasks } = usePermissions()

const isUserMenuOpen = ref(false)

// Current path for sidebar logic
const currentPath = computed(() => route.path)

// Navigation items for top bar - filtered by permissions
const navigationItems = computed(() => {
  const items = [
    { name: 'Dashboard', to: '/dashboard' }
  ]
  
  // Only show admin/exec board sections to users with appropriate permissions
  if (canManageUsers()) {
    items.push({ name: 'Users', to: '/users' })
  }
  
  if (canManageTeams()) {
    items.push({ name: 'Teams', to: '/teams' })
  }
  
  if (canManageEvents()) {
    items.push({ name: 'Events', to: '/events' })
  }
  
  if (canManageTasks()) {
    items.push({ name: 'Tasks', to: '/tasks' })
  }
  
  return items
})

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
  } else if (currentPath === '/profile') {
    return 'Your Profile'
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
  } else if (currentPath === '/profile') {
    return 'Manage your account settings and preferences'
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
  
  if (currentPath === '/profile') {
    crumbs.push({ name: 'Your Profile', path: currentPath })
  } else if (currentPath.startsWith('/users')) {
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
  // Redirect to OAuth after logout
  initiateOAuthLogin()
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
