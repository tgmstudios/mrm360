<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">
        Welcome back, {{ authStore.user?.displayName }}! Here's what's happening with MRM360.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in dashboardStats"
        :key="stat.name"
        class="bg-white overflow-hidden shadow rounded-lg"
      >
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component
                :is="stat.icon"
                :class="[
                  'h-6 w-6',
                  stat.iconColor
                ]"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ stat.name }}
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stat.value }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <router-link
              :to="stat.href"
              class="font-medium text-indigo-700 hover:text-indigo-900"
            >
              View all
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Role-based Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Events -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Upcoming Events
          </h3>
          <div v-if="upcomingEvents.length > 0" class="space-y-3">
            <div
              v-for="event in upcomingEvents.slice(0, 5)"
              :key="event.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ event.title }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatDate(event.startTime) }}
                </p>
              </div>
              <router-link
                :to="`/events/${event.id}`"
                class="ml-4 flex-shrink-0 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View
              </router-link>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <CalendarIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No upcoming events</h3>
            <p class="mt-1 text-sm text-gray-500">
              Get started by creating a new event.
            </p>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3">
          <router-link
            to="/events"
            class="text-sm font-medium text-indigo-700 hover:text-indigo-900"
          >
            View all events
          </router-link>
        </div>
      </div>

      <!-- Recent Users (Exec Board Only) -->
      <div v-if="can('read', 'User')" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Members
          </h3>
          <div v-if="recentUsers.length > 0" class="space-y-3">
            <div
              v-for="user in recentUsers.slice(0, 5)"
              :key="user.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span class="text-white text-sm font-medium">
                      {{ getUserInitials(user) }}
                    </span>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    {{ user.displayName }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ user.email }}
                  </p>
                </div>
              </div>
              <router-link
                :to="`/users/${user.id}`"
                class="ml-4 flex-shrink-0 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View
              </router-link>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No recent members</h3>
            <p class="mt-1 text-sm text-gray-500">
              Get started by adding a new member.
            </p>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3">
          <router-link
            to="/users"
            class="text-sm font-medium text-indigo-700 hover:text-indigo-900"
          >
            View all members
          </router-link>
        </div>
      </div>

      <!-- Quick Actions (Exec Board Only) -->
      <div v-if="can('create', 'Event') || can('create', 'Team')" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div class="space-y-3">
            <router-link
              v-if="can('create', 'Event')"
              to="/events/new"
              class="flex items-center p-3 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <CalendarIcon class="h-5 w-5 text-indigo-600 mr-3" />
              <span class="text-sm font-medium text-indigo-900">Create Event</span>
            </router-link>
            
            <router-link
              v-if="can('create', 'Team')"
              to="/teams/new"
              class="flex items-center p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
            >
              <UserGroupIcon class="h-5 w-5 text-green-600 mr-3" />
              <span class="text-sm font-medium text-green-900">Create Team</span>
            </router-link>
            
            <router-link
              v-if="can('create', 'User')"
              to="/users/new"
              class="flex items-center p-3 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
            >
              <UsersIcon class="h-5 w-5 text-purple-600 mr-3" />
              <span class="text-sm font-medium text-purple-900">Add Member</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- My Teams (Regular Members) -->
      <div v-if="!can('create', 'Event')" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            My Teams
          </h3>
          <div v-if="userTeams.length > 0" class="space-y-3">
            <div
              v-for="team in userTeams.slice(0, 5)"
              :key="team.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ team.name }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ team.type }}
                </p>
              </div>
              <router-link
                :to="`/teams/${team.id}`"
                class="ml-4 flex-shrink-0 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View
              </router-link>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No teams assigned</h3>
            <p class="mt-1 text-sm text-gray-500">
              Contact an administrator to get assigned to a team.
            </p>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3">
          <router-link
            to="/teams"
            class="text-sm font-medium text-indigo-700 hover:text-indigo-900"
          >
            View all teams
          </router-link>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div class="flow-root">
          <ul class="-mb-8">
            <li
              v-for="(activity, index) in recentActivity"
              :key="activity.id"
              :class="[
                index === recentActivity.length - 1 ? '' : 'relative pb-8'
              ]"
            >
              <div v-if="index !== recentActivity.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                    <component
                      :is="activity.icon"
                      class="h-5 w-5 text-white"
                    />
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm text-gray-500">
                      {{ activity.description }}
                    </p>
                  </div>
                  <div class="text-right text-sm whitespace-nowrap text-gray-500">
                    <time :datetime="activity.timestamp">
                      {{ formatRelativeTime(activity.timestamp) }}
                    </time>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { useEventStore } from '@/stores/eventStore'
import { useTeamStore } from '@/stores/teamStore'
import { usePermissions } from '@/composables/usePermissions'
import {
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  UserPlusIcon
} from '@heroicons/vue/24/outline'
import type { User, Event, Team } from '@/types/api'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const eventStore = useEventStore()
const teamStore = useTeamStore()
const { can } = usePermissions()

// Dashboard stats
const dashboardStats = computed(() => [
  {
    name: 'Total Members',
    value: userStore.users.length,
    icon: UsersIcon,
    iconColor: 'text-blue-600',
    href: '/users'
  },
  {
    name: 'Total Teams',
    value: teamStore.teams.length,
    icon: UserGroupIcon,
    iconColor: 'text-green-600',
    href: '/teams'
  },
  {
    name: 'Upcoming Events',
    value: upcomingEvents.value.length,
    icon: CalendarIcon,
    iconColor: 'text-purple-600',
    href: '/events'
  },
  {
    name: 'Paid Members',
    value: userStore.users.filter(u => u.isPaid).length,
    icon: CurrencyDollarIcon,
    iconColor: 'text-yellow-600',
    href: '/users'
  }
])

// Upcoming events
const upcomingEvents = computed(() => {
  const now = new Date()
  return eventStore.events
    .filter(event => new Date(event.startTime) > now)
    .sort((a, b) => new Date(event.startTime).getTime() - new Date(b.startTime).getTime())
})

// Recent users
const recentUsers = computed(() => {
  return userStore.users
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// User teams
const userTeams = computed(() => {
  const user = authStore.user
  if (!user) return []
  return teamStore.teams.filter(team => 
    team.members.some(member => member.id === user.id)
  )
})

// Recent activity (mock data for now)
const recentActivity = computed(() => [
  {
    id: 1,
    description: 'New member John Doe joined',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    icon: UserPlusIcon
  },
  {
    id: 2,
    description: 'Team "Marketing Committee" created',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: UserGroupIcon
  },
  {
    id: 3,
    description: 'Event "Annual Meeting" scheduled',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: CalendarIcon
  }
])

// Utility functions
const getUserInitials = (user: User) => {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Load data on mount
onMounted(async () => {
  console.log('Dashboard mounted - checking auth state')
  console.log('Auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.accessToken,
    hasUser: !!authStore.user
  })
  
  // Wait for auth store to initialize if needed
  if (!authStore.isAuthenticated || !authStore.accessToken) {
    console.log('Auth not ready, calling checkAuth...')
    await authStore.checkAuth()
  }
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated || !authStore.accessToken) {
    console.log('Still not authenticated, redirecting to login')
    // If not authenticated, redirect to login
    router.push('/auth/login')
    return
  }
  
  console.log('Auth confirmed, loading dashboard data...')
  
  // Load dashboard data
  try {
    await Promise.all([
      userStore.fetchUsers(),
      eventStore.fetchEvents(),
      teamStore.fetchTeams()
    ])
    console.log('Dashboard data loaded successfully')
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})
</script>
