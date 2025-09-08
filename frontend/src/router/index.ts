import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePermissions } from '@/composables/usePermissions'
import { initiateOAuthLogin } from '@/utils/oauth'
import type { RouteRecordRaw } from 'vue-router'

// Layouts
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Pages
import Dashboard from '@/pages/dashboard/Dashboard.vue'
import UsersList from '@/pages/users/UsersList.vue'
import UserDetails from '@/pages/users/UserDetails.vue'
import UserEdit from '@/pages/users/UserEdit.vue'
import UserCreate from '@/pages/users/create.vue'
import TeamsList from '@/pages/teams/TeamsList.vue'
import TeamDetails from '@/pages/teams/TeamDetails.vue'
import TeamEdit from '@/pages/teams/TeamEdit.vue'
import TeamCreate from '@/pages/teams/create.vue'
import EventsList from '@/pages/events/EventsList.vue'
import EventDetails from '@/pages/events/EventDetails.vue'
import EventEdit from '@/pages/events/EventEdit.vue'
import EventCheckIn from '@/pages/events/EventCheckIn.vue'
import TasksList from '@/pages/tasks/TasksList.vue'
import Callback from '@/pages/auth/Callback.vue'
import Join from '@/pages/join/Join.vue'
import DiscordVerify from '@/pages/join/DiscordVerify.vue'
import Interests from '@/pages/join/Interests.vue'
import Profile from '@/pages/Profile.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },

  {
    path: '/auth/callback',
    name: 'Callback',
    component: Callback,
    meta: { requiresGuest: true }
  },
  {
    path: '/join',
    name: 'Join',
    component: Join,
    meta: {}
  },
  {
    path: '/join/dd-verify',
    name: 'DiscordVerify',
    component: DiscordVerify,
    meta: { requiresAuth: true }
  },
  {
    path: '/join/interests',
    name: 'Interests',
    component: Interests,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkin/:code',
    name: 'PublicCheckIn',
    component: () => import('@/pages/checkin/PublicCheckIn.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: 'Your Profile' }
      },
      {
        path: 'users',
        name: 'Users',
        meta: { title: 'Users' },
        children: [
          {
            path: '',
            name: 'UsersList',
            component: UsersList,
            meta: { title: 'Users' }
          },
          {
            path: 'new',
            name: 'UserNew',
            component: UserCreate,
            meta: { 
              title: 'Create User',
              requiresExecBoard: true
            }
          },
          {
            path: ':id',
            name: 'UserDetails',
            component: UserDetails,
            meta: { title: 'User Details' }
          },
          {
            path: ':id/edit',
            name: 'UserEdit',
            component: UserEdit,
            meta: { 
              title: 'Edit User',
              requiresExecBoard: true
            }
          }
        ]
      },
      {
        path: 'teams',
        name: 'Teams',
        meta: { title: 'Teams' },
        children: [
          {
            path: '',
            name: 'TeamsList',
            component: TeamsList,
            meta: { title: 'Teams' }
          },
          {
            path: 'new',
            name: 'TeamNew',
            component: TeamCreate,
            meta: { 
              title: 'Create Team',
              requiresExecBoard: true
            }
          },
          {
            path: ':id',
            name: 'TeamDetails',
            component: TeamDetails,
            meta: { title: 'Team Details' }
          },
          {
            path: ':id/edit',
            name: 'TeamEdit',
            component: TeamEdit,
            meta: { 
              title: 'Edit Team',
              requiresExecBoard: true
            }
          }
        ]
      },
      {
        path: 'events',
        name: 'Events',
        meta: { title: 'Events' },
        children: [
          {
            path: '',
            name: 'EventsList',
            component: EventsList,
            meta: { title: 'Events' }
          },
          {
            path: 'new',
            name: 'EventNew',
            component: EventEdit,
            meta: { 
              title: 'Create Event',
              requiresExecBoard: true
            }
          },
          {
            path: ':id',
            name: 'EventDetails',
            component: EventDetails,
            meta: { title: 'Event Details' }
          },
          {
            path: ':id/edit',
            name: 'EventEdit',
            component: EventEdit,
            meta: { 
              title: 'Edit Event',
              requiresExecBoard: true
            }
          },
          {
            path: ':id/checkin',
            name: 'EventCheckIn',
            component: EventCheckIn,
            meta: { 
              title: 'Event Check-In',
              requiresExecBoard: true
            }
          }
        ]
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: TasksList,
        meta: { 
          title: 'Tasks',
          requiresExecBoard: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Skip auth checks for callback page
  if (to.path === '/auth/callback') {
    next()
    return
  }
  
  const authStore = useAuthStore()
  const permissions = usePermissions()

  // Initialize auth store if not already done
  if (!authStore.isAuthenticated && !authStore.accessToken) {
    await authStore.checkAuth()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirect to OAuth if not authenticated
      initiateOAuthLogin()
      return
    }
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      next('/dashboard')
      return
    }
  }

  // Check if route requires executive board access
  if (to.meta.requiresExecBoard) {
    if (!permissions.isExecBoard()) {
      next('/dashboard')
      return
    }
  }

  // Check if route requires admin access
  if (to.meta.requiresAdmin) {
    if (!permissions.isAdmin()) {
      next('/dashboard')
      return
    }
  }

  next()
})

export default router
