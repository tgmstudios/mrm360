import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { AbilityBuilder, Ability, AbilityClass, PureAbility } from '@casl/ability'
import type { AuthUser, Ability as UserAbility } from '@/types/api'

type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Subjects = 'User' | 'Team' | 'Event' | 'Group' | 'Task' | 'all'

export type AppAbility = Ability<[Actions, Subjects]>
export const AppAbility = Ability as AbilityClass<AppAbility>

export function usePermissions() {
  const authStore = useAuthStore()

  // Create ability instance from user abilities
  const ability = computed(() => {
    if (!authStore.user) {
      return new AppAbility()
    }

    const { can, build } = new AbilityBuilder<AppAbility>(AppAbility)

    // Convert backend abilities to CASL format
    // Ensure abilities is an array before calling forEach
    const userAbilities = authStore.user.abilities || []
    userAbilities.forEach((userAbility: UserAbility) => {
      if (userAbility.conditions) {
        can(userAbility.action as Actions, userAbility.subject as Subjects, userAbility.conditions)
      } else {
        can(userAbility.action as Actions, userAbility.subject as Subjects)
      }
    })

    return build()
  })

  // Permission check methods
  function can(action: Actions, subject: Subjects, conditions?: Record<string, any>): boolean {
    return ability.value.can(action, subject, conditions)
  }

  function cannot(action: Actions, subject: Subjects, conditions?: Record<string, any>): boolean {
    return ability.value.cannot(action, subject, conditions)
  }

  // Convenience methods for common operations
  function canCreate(subject: Subjects, conditions?: Record<string, any>): boolean {
    return can('create', subject, conditions)
  }

  function canRead(subject: Subjects, conditions?: Record<string, any>): boolean {
    return can('read', subject, conditions)
  }

  function canUpdate(subject: Subjects, conditions?: Record<string, any>): boolean {
    return can('update', subject, conditions)
  }

  function canDelete(subject: Subjects, conditions?: Record<string, any>): boolean {
    return can('delete', subject, conditions)
  }

  function canManage(subject: Subjects, conditions?: Record<string, any>): boolean {
    return can('manage', subject, conditions)
  }

  // Role-based permission checks
  function isExecBoard(): boolean {
    return authStore.isExecBoard
  }

  function isAdmin(): boolean {
    return authStore.isAdmin
  }

  function isMember(): boolean {
    return authStore.isAuthenticated && !authStore.isExecBoard
  }

  // Specific permission checks for common scenarios
  function canManageUsers(): boolean {
    return canManage('User') || isAdmin()
  }

  function canManageTeams(): boolean {
    return canManage('Team') || isExecBoard()
  }

  function canManageEvents(): boolean {
    return canManage('Event') || isExecBoard()
  }

  function canManageGroups(): boolean {
    return canManage('Group') || isAdmin()
  }

  function canManageTasks(): boolean {
    return canManage('Task') || isExecBoard()
  }

  function canViewUserProfile(userId: string): boolean {
    // Users can view their own profile, exec board can view all
    return canRead('User') || 
           authStore.user?.id === userId || 
           isExecBoard()
  }

  function canEditUser(userId: string): boolean {
    // Users can edit their own profile, exec board can edit all
    return canUpdate('User') || 
           authStore.user?.id === userId || 
           isExecBoard()
  }

  function canDeleteUser(userId: string): boolean {
    // Only exec board can delete users
    return canDelete('User') || isExecBoard()
  }

  function canCreateTeam(): boolean {
    return canCreate('Team') || isExecBoard()
  }

  function canEditTeam(teamId: string): boolean {
    return canUpdate('Team') || isExecBoard()
  }

  function canDeleteTeam(teamId: string): boolean {
    return canDelete('Team') || isExecBoard()
  }

  function canCreateEvent(): boolean {
    return canCreate('Event') || isExecBoard()
  }

  function canEditEvent(eventId: string): boolean {
    return canUpdate('Event') || isExecBoard()
  }

  function canDeleteEvent(eventId: string): boolean {
    return canDelete('Event') || isExecBoard()
  }

  function canRSVPToEvent(eventId: string): boolean {
    return canRead('Event') && authStore.isAuthenticated
  }

  function canViewAttendance(eventId: string): boolean {
    return canRead('Event') || isExecBoard()
  }

  function canEnqueueTasks(): boolean {
    return canCreate('Task') || isExecBoard()
  }

  function canViewTasks(): boolean {
    return canRead('Task') || isExecBoard()
  }

  return {
    // Core CASL methods
    can,
    cannot,
    ability,
    
    // Convenience methods
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    
    // Role checks
    isExecBoard,
    isAdmin,
    isMember,
    
    // Specific permission checks
    canManageUsers,
    canManageTeams,
    canManageEvents,
    canManageGroups,
    canManageTasks,
    
    // User permissions
    canViewUserProfile,
    canEditUser,
    canDeleteUser,
    
    // Team permissions
    canCreateTeam,
    canEditTeam,
    canDeleteTeam,
    
    // Event permissions
    canCreateEvent,
    canEditEvent,
    canDeleteEvent,
    canRSVPToEvent,
    canViewAttendance,
    
    // Task permissions
    canEnqueueTasks,
    canViewTasks
  }
}
