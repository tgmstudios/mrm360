import { AbilityBuilder, Ability, AbilityClass } from '@casl/ability';
import { AuthenticatedUser } from '@/types';
import { getEffectiveSystemRole } from '@/utils/roleUtils';

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'rsvp';
export type Subjects = 'User' | 'Group' | 'Team' | 'Event' | 'Task' | 'RSVP' | 'CheckIn' | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export function defineAbilitiesFor(user: AuthenticatedUser) {
  const { can, build } = new AbilityBuilder<AppAbility>(AppAbility);

  // Get the effective system role, ensuring it's not a class rank role
  const effectiveRole = getEffectiveSystemRole(user.role);

  // Admin can do everything
  if (effectiveRole === 'ADMIN') {
    can('manage', 'all');
    return build();
  }

  // Executive Board permissions
  if (effectiveRole === 'EXEC_BOARD') {
    // User management
    can('read', 'User');
    can('create', 'User');
    can('update', 'User');
    can('delete', 'User');

    // Group management
    can('manage', 'Group');

    // Team management
    can('manage', 'Team');

    // Event management
    can('manage', 'Event');

    // Task management
    can('manage', 'Task');

    // RSVP management
    can('read', 'RSVP');
    can('update', 'RSVP');

    // Check-in management
    can('manage', 'CheckIn');
  }

  // Member permissions
  if (effectiveRole === 'MEMBER') {
    // User management
    can('read', 'User');
    can('update', 'User');

    // Group management
    can('read', 'Group');

    // Team management
    can('read', 'Team');
    can('create', 'Team');
    can('update', 'Team');
    can('delete', 'Team');

    // Event management
    can('read', 'Event');
    can('create', 'Event');
    can('update', 'Event');
    can('delete', 'Event');

    // Task management
    can('read', 'Task');
    can('create', 'Task');
    can('update', 'Task');
    can('delete', 'Task');

    // RSVP management
    can('read', 'RSVP');
    can('create', 'RSVP');
    can('update', 'RSVP');
    can('delete', 'RSVP');

    // Check-in management
    can('read', 'CheckIn');
    can('create', 'CheckIn');
  }

  // Common permissions for all authenticated users
  can('read', 'Event');
  can('rsvp', 'Event');

  return build();
}

export function createMongoQueryMatcher(ability: AppAbility) {
  return (query: any) => {
    return query;
  };
}

// Helper function to check permissions
export function checkPermission(
  ability: AppAbility, 
  action: Actions, 
  subject: Subjects, 
  subjectId?: string
): boolean {
  if (subjectId) {
    return ability.can(action, subject);
  }
  return ability.can(action, subject);
}
