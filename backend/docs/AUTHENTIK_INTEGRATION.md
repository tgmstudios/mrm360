# Authentik Integration Guide

This document describes the integration between the CCSO backend and Authentik for identity and access management.

## Overview

The Authentik integration provides:
- User authentication and authorization
- Group management for teams
- Role-based access control
- OIDC/OAuth2 integration
- API-based user and group operations

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Authentik     │
│   (Vue.js)      │◄──►│   (Next.js)      │◄──►│   (IAM)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. AuthentikService
Main service class that provides high-level operations:
- Group management (CRUD operations)
- User management
- Team member operations
- Health checks

### 2. AuthentikApiClient
Low-level HTTP client for Authentik API v3:
- RESTful API calls
- Error handling
- Response transformation

### 3. AuthentikTransformers
Data transformation utilities:
- Convert between API responses and internal types
- Validation
- Data filtering and manipulation

### 4. AuthentikServiceFactory
Factory pattern for service creation:
- Configuration validation
- Service instantiation
- Fallback handling

### 5. AuthentikConfigValidator
Configuration validation:
- Environment variable validation
- Production readiness checks
- Configuration summaries

## Configuration

### Environment Variables

```bash
# Required
AUTHENTIK_BASE_URL=http://localhost:9000
AUTHENTIK_TOKEN=your-api-token-here
AUTHENTIK_PARENT_GROUP_TEMPLATE={parent_team_type}-team

# Optional
AUTHENTIK_TIMEOUT=30000
AUTHENTIK_RETRY_ATTEMPTS=3
AUTHENTIK_RETRY_DELAY=1000
```

### Configuration Validation

The system automatically validates configuration on startup:

```typescript
import { AuthentikConfigValidator } from '@/utils/authentikConfigValidator';

const validation = AuthentikConfigValidator.validateEnvironment();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Usage Examples

### Basic Service Usage

```typescript
import { AuthentikServiceFactory } from '@/services/authentikServiceFactory';

// Create service from environment
const service = AuthentikServiceFactory.createServiceFromEnv();

// Create group
const group = await service.createGroup('team-name', 'Description', 'parent-group-id');

// Add users to group
await service.addUsersToGroup(group.id, ['user1', 'user2']);

// Get group information
const groupInfo = await service.getGroup(group.id);
```

### Team Provisioning

```typescript
import { TeamProvisioningManager } from '@/managers/teamProvisioningManager';

const manager = new TeamProvisioningManager(config);

// Create team with all integrations
const result = await manager.provisionTeam({
  action: 'create',
  teamId: 'team-123',
  data: {
    name: 'Competition Team',
    type: 'COMPETITION',
    description: 'Team for robotics competitions'
  }
});
```

### Health Checks

```typescript
// Check service health
const isHealthy = await service.healthCheck();

// Get detailed status
const status = await AuthentikServiceFactory.getServiceStatus(service);
console.log('Service healthy:', status.isHealthy);
```

## API Endpoints

### Health Check
```
GET /api/health/authentik
```

Response:
```json
{
  "status": "healthy",
  "service": "authentik",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "configuration": {
    "baseUrl": "http://localhost:9000",
    "parentGroupTemplate": "{parent_team_type}-team",
    "tokenConfigured": true
  },
  "health": {
    "isHealthy": true,
    "lastHealthCheck": "2024-01-01T00:00:00.000Z",
    "message": "Authentik service is responding correctly"
  }
}
```

## Error Handling

The service provides comprehensive error handling:

```typescript
try {
  const group = await service.createGroup('team-name', 'description');
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to create group:', error.message);
  }
}
```

Common error scenarios:
- Configuration validation failures
- Network connectivity issues
- Authentication failures
- API rate limiting
- Invalid data

## Testing

### Run Tests
```bash
npm run test:authentik
```

### Test Coverage
The test suite covers:
- Configuration validation
- Service creation
- Health checks
- Group operations (CRUD)
- User operations
- Error handling
- Service status

## Development

### Mock Service
For development without Authentik:
```typescript
const mockService = AuthentikServiceFactory.createMockService();
```

### Local Development
1. Set environment variables
2. Run Authentik locally on port 9000
3. Use `npm run test:authentik` to verify integration

## Production Deployment

### Prerequisites
- Valid Authentik instance
- API token with appropriate permissions
- HTTPS endpoint
- Proper firewall configuration

### Health Monitoring
- Regular health checks via `/api/health/authentik`
- Monitor logs for errors
- Set up alerts for service failures

### Security Considerations
- Use HTTPS in production
- Rotate API tokens regularly
- Implement rate limiting
- Monitor API usage

## Troubleshooting

### Common Issues

1. **Configuration Errors**
   - Check environment variables
   - Verify URL format
   - Ensure token is valid

2. **Connection Issues**
   - Check network connectivity
   - Verify firewall settings
   - Check Authentik service status

3. **Authentication Failures**
   - Verify API token
   - Check token permissions
   - Ensure token hasn't expired

4. **API Errors**
   - Check Authentik logs
   - Verify API version compatibility
   - Check rate limiting

### Debug Mode
Enable debug logging:
```typescript
import { logger } from '@/utils/logger';
logger.level = 'debug';
```

### Log Analysis
Look for patterns in logs:
- Configuration validation messages
- API request/response logs
- Error stack traces
- Performance metrics

## Migration from Mock Implementation

If you're upgrading from the mock implementation:

1. **Update Configuration**
   - Set proper environment variables
   - Remove mock token values

2. **Test Integration**
   - Run health checks
   - Test group operations
   - Verify user management

3. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Validate data consistency

## Support

For issues with the Authentik integration:
1. Check this documentation
2. Review error logs
3. Test with the provided test script
4. Verify Authentik configuration
5. Check network connectivity

## Contributing

When contributing to the Authentik integration:
1. Follow existing code patterns
2. Add comprehensive error handling
3. Include validation for new features
4. Update tests and documentation
5. Follow security best practices
