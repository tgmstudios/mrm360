# Nextcloud Service Implementation

## Overview

The Nextcloud service provides integration with Nextcloud instances for team provisioning, including group management, folder creation, calendar management, and deck board management. This service follows the same architectural pattern as other external services in the system.

## Architecture

### Service Layers

1. **NextcloudService** - Main service interface for business logic
2. **NextcloudApiClient** - Low-level API communication with Nextcloud
3. **NextcloudTransformers** - Data transformation and validation utilities
4. **NextcloudServiceFactory** - Service creation and configuration management
5. **NextcloudConfigValidator** - Configuration validation and recommendations

### Dependencies

- `@nextcloud/axios` - Official Nextcloud HTTP client
- `@nextcloud/auth` - Nextcloud authentication utilities
- Custom HTTP client for fallback operations

## Configuration

### Environment Variables

```bash
# Required
NEXTCLOUD_BASE_URL=https://your-nextcloud-instance.com
NEXTCLOUD_USERNAME=admin
NEXTCLOUD_PASSWORD=your-secure-password
NEXTCLOUD_BASE_PATH=/teams

# Optional
NEXTCLOUD_USE_SESSION_AUTH=true  # Use session-based authentication instead of Basic Auth
NODE_ENV=production  # For production-specific validation
```

### Configuration Validation

The service includes comprehensive configuration validation:

- **URL Validation**: Ensures valid HTTP/HTTPS URLs
- **Credential Validation**: Validates username and password requirements
- **Path Validation**: Ensures safe base paths without traversal attacks
- **Production Checks**: Additional validation for production environments

## API Endpoints

### Group Management

- **Create Group**: `POST /ocs/v1.php/cloud/groups`
- **Update Group**: Limited support (mainly display name)
- **Delete Group**: `DELETE /ocs/v1.php/cloud/groups/{groupId}`
- **Get Group**: `GET /ocs/v1.php/cloud/groups/{groupId}`
- **Add Users**: `POST /ocs/v1.php/cloud/users/{userId}/groups`
- **Remove Users**: `DELETE /ocs/v1.php/cloud/users/{userId}/groups/{groupId}`

### Folder Management (WebDAV)

- **Create Folder**: `PUT /path/to/folder` (WebDAV MKCOL)
- **Update Folder**: `PROPPATCH /path/to/folder` (WebDAV)
- **Delete Folder**: `DELETE /path/to/folder` (WebDAV)
- **Get Folder**: `PROPFIND /path/to/folder` (WebDAV)

### Calendar Management

- **Create Calendar**: `POST /remote.php/dav/calendars`
- **Delete Calendar**: `DELETE /remote.php/dav/calendars/{name}`

### Deck Board Management

- **Create Board**: `POST /index.php/apps/deck/api/v1.0/boards`
- **Delete Board**: Requires board ID lookup (simplified implementation)

## Usage Examples

### Basic Service Creation

```typescript
import { NextcloudServiceFactory } from '@/services/nextcloudServiceFactory';

// Create service from environment variables
const service = NextcloudServiceFactory.createServiceFromEnv();

// Create service with custom configuration
const service = NextcloudServiceFactory.createService({
  baseUrl: 'https://nextcloud.example.com',
  username: 'admin',
  password: 'password',
  basePath: '/teams'
});
```

### Group Management

```typescript
// Create a new group
const group = await service.createGroup('team-alpha', 'Alpha Team Group');

// Add users to group
await service.addUsersToGroup(group.id, ['user1', 'user2', 'user3']);

// Remove users from group
await service.removeUsersFromGroup(group.id, ['user1']);

// Update group
const updatedGroup = await service.updateGroup(group.id, { 
  name: 'team-alpha-updated' 
});

// Delete group
await service.deleteGroup(group.id);
```

### Folder Management

```typescript
// Create a group folder
const folder = await service.createGroupFolder('documents', groupId);

// Update folder permissions
const updatedFolder = await service.updateGroupFolder(folder.path, {
  permissions: ['read', 'write', 'share']
});

// Delete folder
await service.deleteGroupFolder(folder.path);
```

### Calendar Management

```typescript
// Create a calendar for a group
const calendar = await service.createCalendar('team-events', groupId);

// Delete calendar
await service.deleteCalendar(calendar.name);
```

### Deck Board Management

```typescript
// Create a deck board for a group
const board = await service.createDeckBoard('project-tasks', groupId);

// Delete deck board
await service.deleteDeckBoard(board.name);
```

## Data Transformation

### Input Sanitization

The service automatically sanitizes inputs for Nextcloud compatibility:

- **Group Names**: Converted to lowercase, alphanumeric with hyphens/underscores
- **Folder Paths**: Sanitized for WebDAV compatibility
- **Calendar Names**: Sanitized for calendar API compatibility
- **Board Names**: Sanitized for deck API compatibility

### Validation Rules

- **Group Names**: 3-64 characters, alphanumeric with hyphens/underscores
- **Folder Paths**: Must start with `/`, no traversal sequences
- **Calendar Names**: 1-128 characters, no invalid characters
- **Board Names**: 1-128 characters, no invalid characters

## Error Handling

### Comprehensive Error Handling

- **API Errors**: HTTP status codes and response bodies
- **Validation Errors**: Input validation with detailed error messages
- **Network Errors**: Timeout and connectivity issues
- **Authentication Errors**: Invalid credentials and permissions

### Error Response Format

```typescript
{
  status: 'error',
  message: 'Failed to create Nextcloud group',
  details: {
    originalError: 'HTTP 400: Bad Request',
    validationErrors: ['Group name is required']
  }
}
```

## Health Monitoring

### Health Check Endpoint

`GET /api/health/nextcloud`

### Health Status Levels

- **Healthy**: Service responding correctly
- **Degraded**: Service responding with unexpected behavior
- **Unhealthy**: Service not responding

### Health Check Response

```json
{
  "status": "healthy",
  "service": "nextcloud",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "configuration": {
    "baseUrl": "https://nextcloud.example.com",
    "username": "admin",
    "basePath": "/teams",
    "passwordConfigured": true
  },
  "health": {
    "status": "healthy",
    "message": "Nextcloud service is responding correctly",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Testing

### Test Scripts

Run the comprehensive test suite:

```bash
npm run test:nextcloud
```

Test authentication methods specifically:

```bash
npm run test:nextcloud:auth
```

### Test Coverage

- Service factory creation
- Health checks
- Group management (CRUD operations)
- Folder management (CRUD operations)
- Calendar management (CRUD operations)
- Deck board management (CRUD operations)
- Error handling
- Configuration validation
- Data sanitization

## Security Considerations

### Authentication

- **Basic Authentication**: Username/password via HTTP Basic Auth (default)
- **Session Authentication**: Login-based session management (set `NEXTCLOUD_USE_SESSION_AUTH=true`)
- Credentials stored in environment variables
- No hardcoded credentials in code
- Automatic authentication method detection and fallback

### Input Validation

- Comprehensive input sanitization
- Path traversal prevention
- Character set restrictions
- Length limitations

### Production Security

- HTTPS enforcement in production
- Strong password requirements
- Reserved username checks
- Configuration validation

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify username and password
   - Check Nextcloud user permissions
   - Ensure user has admin privileges
   - Try setting `NEXTCLOUD_USE_SESSION_AUTH=true` for session-based auth
   - Check if Basic Auth is disabled on your Nextcloud instance

2. **Group Creation Fails**
   - Verify group name format (lowercase, alphanumeric)
   - Check for duplicate group names
   - Ensure sufficient permissions

3. **Folder Creation Fails**
   - Verify base path exists and is writable
   - Check WebDAV permissions
   - Ensure path format is correct

4. **API Endpoint Not Found**
   - Verify Nextcloud version compatibility
   - Check if required apps are installed
   - Ensure OCS API is enabled

### Debug Mode

Enable detailed logging:

```typescript
import { logger } from '@/utils/logger';
logger.setLevel('debug');
```

### Health Check

Use the health endpoint to diagnose issues:

```bash
curl http://localhost:3000/api/health/nextcloud
```

## Performance Considerations

### Timeouts

- Default timeout: 30 seconds
- Configurable per service instance
- Separate timeouts for different operations

### Caching

- No built-in caching (stateless design)
- Consider implementing caching for frequently accessed data
- Cache group information for better performance

### Rate Limiting

- Nextcloud may have rate limits
- Implement exponential backoff for retries
- Monitor API usage patterns

## Future Enhancements

### Planned Features

- **User Management**: Create and manage Nextcloud users
- **File Operations**: Upload, download, and manage files
- **Sharing Management**: Control file and folder sharing
- **Advanced Permissions**: Granular permission management
- **Bulk Operations**: Batch operations for multiple resources

### Integration Opportunities

- **LDAP Integration**: Connect with existing LDAP systems
- **SSO Support**: Single sign-on integration
- **Webhook Support**: Real-time notifications
- **Audit Logging**: Comprehensive activity tracking

## Contributing

### Development Setup

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run tests: `npm run test:nextcloud`
4. Start development server: `npm run dev`

### Code Standards

- Follow TypeScript best practices
- Use comprehensive error handling
- Include proper logging
- Write unit tests for new features
- Update documentation for changes

### Testing Guidelines

- Test all error scenarios
- Verify data transformation
- Test configuration validation
- Include integration tests
- Test with real Nextcloud instances
