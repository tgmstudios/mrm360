# Wiki.js Group and Permission Management

This document describes the comprehensive group and permission management system implemented in the Wiki.js service, which provides granular access control at the path level.

## Overview

The Wiki.js service now includes advanced group management capabilities that allow you to:

- Create groups with specific permissions
- Assign groups to specific documentation paths
- Create private pages accessible only to authorized groups
- Automatically set up team groups with pages and permissions
- Manage user access through group membership
- Implement path-based access control for sensitive content

## Key Features

### 🔐 **Granular Access Control**
- Control access at the individual page/path level
- Different permission levels: `read`, `write`, `admin`
- Private pages with group-based access restrictions

### 👥 **Group Management**
- Create groups with custom names and descriptions
- Assign specific permissions to groups
- Add/remove users from groups
- List and manage existing groups

### 🏗️ **Team Setup Automation**
- Automatic creation of team groups
- Automatic creation of team pages
- Automatic permission assignment
- One-command team onboarding

### 📚 **Path-Based Permissions**
- Assign groups to specific documentation paths
- Create private documentation areas
- Manage access control for different project sections
- Flexible permission inheritance

## API Reference

### Core Methods

#### `createGroup(groupData: WikiJsGroupInput)`
Creates a new group with specified permissions.

```typescript
const group = await service.apiClient.createGroup({
  name: 'developers',
  description: 'Development team members',
  permissions: ['read', 'write', 'admin']
});
```

#### `createGroupForPath(groupName, path, description, permissions)`
Creates a group and assigns it to a specific path with permissions.

```typescript
const result = await service.createGroupForPath(
  'docs-editors',
  '/docs/technical',
  'Technical documentation editors',
  ['read', 'write']
);
```

#### `createTeamGroup(teamType, teamName, permissions)`
Creates a team group with automatic page creation and permission setup.

```typescript
const teamGroup = await service.createTeamGroup(
  'development',
  'FrontendTeam',
  ['read', 'write', 'admin']
);
```

#### `createTeamSetup(teamType, teamName, userIds, permissions)`
Complete team setup including group, page, and user management.

```typescript
const setup = await service.createTeamSetup(
  'engineering',
  'BackendTeam',
  ['user1', 'user2', 'user3'],
  ['read', 'write', 'admin']
);
```

#### `createPageWithPermissions(path, title, content, permissions)`
Creates a private page with specific group permissions.

```typescript
const privatePage = await service.createPageWithPermissions(
  '/internal/knowledge-base',
  'Internal Knowledge Base',
  '# Private Content\n\nThis is private...',
  [{
    groupId: 'group1',
    permissions: ['read', 'write']
  }]
);
```

#### `setPagePermissions(path, permissions)`
Sets permissions for an existing page.

```typescript
await service.setPagePermissions('/docs/private', [{
  groupId: 'group1',
  permissions: ['read']
}]);
```

#### `getGroupsForPath(path)`
Retrieves all groups with access to a specific path.

```typescript
const groups = await service.getGroupsForPath('/docs/technical');
console.log('Groups with access:', groups);
```

#### `addUsersToGroup(groupId, userIds)`
Adds users to a specific group.

```typescript
await service.addUsersToGroup('group1', ['user1', 'user2', 'user3']);
```

## Permission Levels

### Available Permissions

- **`read`**: View page content
- **`write`**: Edit page content
- **`admin`**: Full administrative access (delete, manage permissions)

### Permission Combinations

```typescript
// Read-only access
permissions: ['read']

// Read and write access
permissions: ['read', 'write']

// Full access
permissions: ['read', 'write', 'admin']
```

## Use Cases

### 1. **Team Documentation**
Create private team areas with automatic setup:

```typescript
// Creates group, page, and sets permissions automatically
const team = await service.createTeamSetup(
  'development',
  'FrontendTeam',
  ['user1', 'user2'],
  ['read', 'write', 'admin']
);
```

### 2. **Project-Specific Access**
Create groups for specific projects:

```typescript
const projectGroup = await service.createGroupForPath(
  'project-alpha-team',
  '/projects/alpha',
  'Team for Project Alpha',
  ['read', 'write', 'admin']
);
```

### 3. **Private Knowledge Base**
Create internal documentation areas:

```typescript
const privatePage = await service.createPageWithPermissions(
  '/internal/architecture',
  'System Architecture',
  '# Private Architecture Documentation...',
  [{
    groupId: 'architects',
    permissions: ['read', 'write']
  }]
);
```

### 4. **Department Access Control**
Set up different access levels for departments:

```typescript
const departments = [
  { type: 'engineering', permissions: ['read', 'write', 'admin'] },
  { type: 'design', permissions: ['read', 'write'] },
  { type: 'marketing', permissions: ['read'] }
];

for (const dept of departments) {
  await service.createTeamGroup(dept.type, 'Team', dept.permissions);
}
```

## Implementation Details

### Private Namespace Format

The system uses Wiki.js's `privateNS` field to store permission information in the format:

```
groupId1:permission1,permission2;groupId2:permission1
```

Example:
```
1:read,write;2:read,write,admin
```

### Path Construction

The system automatically handles path construction to avoid double slashes:

```typescript
// If basePath is "/", it becomes "/team-name"
// If basePath is "/docs", it becomes "/docs/team-name"
const path = `${basePath === '/' ? '' : basePath}/${teamType}-team/${teamName}`;
```

### Error Handling

All methods include comprehensive error handling:

```typescript
try {
  const result = await service.createTeamGroup('dev', 'Team', ['read', 'write']);
  console.log('Success:', result);
} catch (error) {
  console.error('Failed:', error.message);
}
```

## Testing

### Run Tests

```bash
# Test group and permission functionality
npm run test:wikijs:groups

# Run examples
npm run example:wikijs:groups
```

### Test Coverage

The test suite covers:
- ✅ Basic group creation
- ✅ Path-specific group creation
- ✅ Team group creation with automatic setup
- ✅ Private page creation with permissions
- ✅ Path-based group retrieval
- ✅ Complete team setup workflow
- ✅ Group listing and management

## Best Practices

### 1. **Group Naming Convention**
Use descriptive names that indicate purpose:
```typescript
// Good
'development-team-frontend'
'docs-editors-technical'
'project-alpha-team'

// Avoid
'group1'
'test'
'team'
```

### 2. **Permission Assignment**
Assign minimal required permissions:
```typescript
// For public documentation
permissions: ['read']

// For team collaboration
permissions: ['read', 'write']

// For team leadership
permissions: ['read', 'write', 'admin']
```

### 3. **Path Organization**
Organize paths logically:
```typescript
// Team areas
'/development-team/TeamName'
'/engineering-team/TeamName'

// Project areas
'/projects/ProjectName'
'/projects/ProjectName/docs'

// Department areas
'/departments/DepartmentName'
'/departments/DepartmentName/policies'
```

### 4. **User Management**
Add users to groups after group creation:
```typescript
// Create group first
const group = await service.createTeamGroup('dev', 'Team', ['read', 'write']);

// Then add users
await service.addUsersToGroup(group.id, ['user1', 'user2', 'user3']);
```

## Troubleshooting

### Common Issues

#### 1. **Permission Denied Errors**
- Ensure the Wiki.js API token has sufficient permissions
- Check that groups exist before assigning permissions
- Verify that the `privateNS` field is being set correctly

#### 2. **Path Not Found Errors**
- Ensure pages exist before setting permissions
- Check path construction logic
- Verify base path configuration

#### 3. **Group Creation Failures**
- Check group name uniqueness
- Verify permission format
- Ensure API token has group management permissions

### Debug Information

Enable debug logging to see detailed information:

```typescript
// GraphQL variables are logged automatically
// Check logs for detailed error information
logger.debug('GraphQL variables:', variables);
```

## Integration with Other Services

This system integrates with:

- **Team Provisioning Manager**: Automatic team setup
- **User Management**: User assignment to groups
- **Authentication**: Permission-based access control
- **Content Management**: Private page creation

## Future Enhancements

Planned improvements include:

- **Role-Based Access Control (RBAC)**: More granular permission system
- **Permission Inheritance**: Hierarchical permission structure
- **Audit Logging**: Track permission changes and access
- **Bulk Operations**: Manage multiple groups/pages simultaneously
- **Permission Templates**: Predefined permission sets for common scenarios

## Conclusion

The Wiki.js Group and Permission Management system provides a robust foundation for implementing access control in documentation systems. It enables organizations to:

- Maintain security for sensitive content
- Provide appropriate access levels for different user groups
- Automate team onboarding processes
- Implement flexible permission structures
- Scale access control as organizations grow

For questions or support, refer to the test scripts and examples provided in the `scripts/` directory.
