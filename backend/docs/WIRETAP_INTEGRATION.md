# Wiretap Integration Guide

This document describes the integration between the CCSO backend and Wiretap for OpenStack resource provisioning and management.

## Overview

The Wiretap integration provides:
- Event-based resource provisioning
- Project management for teams and events
- User management and access control
- Resource lifecycle management
- Health monitoring and status checks

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Wiretap       │
│   (Vue.js)      │◄──►│   (Next.js)      │◄──►│   (OpenStack)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. WiretapService
Main service class that provides high-level operations:
- Project management (CRUD operations)
- User management
- Resource provisioning and cleanup
- Event-based resource management
- Health checks

### 2. WiretapApiClient
Low-level HTTP client for Wiretap API v1:
- RESTful API calls
- Error handling
- Response transformation
- Resource management

### 3. WiretapTransformers
Data transformation utilities:
- Convert between API responses and internal types
- Validation
- Data filtering and manipulation
- Resource status management

### 4. WiretapServiceFactory
Factory pattern for service creation:
- Configuration validation
- Service instantiation
- Fallback handling
- Mock service creation

### 5. WiretapConfigValidator
Configuration validation:
- Environment variable validation
- Production readiness checks
- Configuration summaries

## Configuration

### Environment Variables

```bash
# Required
WIRETAP_BASE_URL=http://localhost:8080
WIRETAP_TOKEN=your-api-token-here
WIRETAP_PROJECT_TEMPLATE={event_type}-project

# Optional
WIRETAP_TIMEOUT=30000
WIRETAP_RETRY_ATTEMPTS=3
WIRETAP_RETRY_DELAY=1000
```

### Configuration Validation

The system automatically validates configuration on startup:
- **Base URL**: Must be a valid HTTP/HTTPS URL
- **Token**: Must be provided and valid
- **Project Template**: Must contain `{event_type}` placeholder

## Usage

### Basic Service Creation

```typescript
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';

// Create service from environment variables
const service = WiretapServiceFactory.createServiceFromEnv();

// Create service with custom configuration
const service = WiretapServiceFactory.createService({
  baseUrl: 'https://wiretap.example.com',
  token: 'your-token',
  projectTemplate: '{event_type}-resources'
});

// Create service with fallback to mock
const service = WiretapServiceFactory.createServiceWithFallback();
```

### Project Operations

```typescript
// Create a project
const project = await service.createProject('event-123', 'Resources for event 123');

// Update a project
const updatedProject = await service.updateProject(project.id, {
  description: 'Updated description'
});

// Get a project
const project = await service.getProject(projectId);

// List projects
const projects = await service.listProjects({ name: 'event-' });

// Delete a project
await service.deleteProject(projectId);
```

### User Management

```typescript
// Add users to project
await service.addUsersToProject(projectId, ['user1', 'user2']);

// Remove users from project
await service.removeUsersFromProject(projectId, ['user1']);

// Get user by email
const user = await service.getUserByEmail('user@example.com');

// List users
const users = await service.listUsers({ project: projectId });
```

### Resource Management

```typescript
// Create a resource
const resource = await service.createResource(projectId, 'compute', {
  name: 'web-server',
  flavor: 'm1.small',
  image: 'ubuntu-20.04'
});

// List resources
const resources = await service.listResources(projectId, 'compute');

// Delete a resource
await service.deleteResource(resourceId);
```

### Event Resource Provisioning

```typescript
// Provision resources for an event
const resources = await service.provisionEventResources('event-123', 'COMPETITION', [
  { type: 'compute', data: { flavor: 'm1.large', count: 5 } },
  { type: 'storage', data: { size: '100GB', count: 2 } },
  { type: 'network', data: { cidr: '10.0.0.0/24' } }
]);

// Cleanup resources after event
await service.cleanupEventResources('event-123');
```

## API Endpoints

### Health Check
- **GET** `/api/health/wiretap` - Check Wiretap service health

### Background Tasks
The system supports background processing for:
- Event resource provisioning
- Resource cleanup
- User synchronization
- Health monitoring

## Resource Types

Wiretap supports various OpenStack resource types:

### Compute Resources
- **Instances**: Virtual machines
- **Flavors**: Instance size definitions
- **Images**: Operating system images
- **Keypairs**: SSH key management

### Storage Resources
- **Volumes**: Block storage
- **Snapshots**: Volume backups
- **Images**: Storage images

### Network Resources
- **Networks**: Virtual networks
- **Subnets**: Network segments
- **Routers**: Network routing
- **Security Groups**: Firewall rules

### Identity Resources
- **Projects**: Resource containers
- **Users**: Access management
- **Roles**: Permission definitions

## Event Integration

### Event Types
- **COMPETITION**: High-performance compute resources
- **WORKSHOP**: Shared development environments
- **MEETING**: Lightweight collaboration tools
- **SOCIAL**: Basic communication resources
- **TRAINING**: Educational resource environments

### Resource Templates
Each event type has predefined resource templates:

```typescript
const competitionTemplate = [
  { type: 'compute', data: { flavor: 'm1.xlarge', count: 10 } },
  { type: 'storage', data: { size: '500GB', count: 5 } },
  { type: 'network', data: { cidr: '10.1.0.0/16' } }
];

const workshopTemplate = [
  { type: 'compute', data: { flavor: 'm1.medium', count: 20 } },
  { type: 'storage', data: { size: '50GB', count: 20 } },
  { type: 'network', data: { cidr: '10.2.0.0/16' } }
];
```

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const project = await service.createProject('test-project');
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // Handle validation errors
  } else if (error.message.includes('Authentication failed')) {
    // Handle auth errors
  } else {
    // Handle other errors
  }
}
```

## Monitoring and Logging

All operations are logged with structured data:

```typescript
logger.info('Creating Wiretap project', { 
  name: projectName, 
  description: description 
});

logger.error('Failed to create Wiretap project', { 
  name: projectName, 
  error: error.message 
});
```

## Testing

### Mock Service
For testing and development:

```typescript
const mockService = WiretapServiceFactory.createMockService();
```

### Health Checks
Monitor service health:

```typescript
const isHealthy = await service.healthCheck();
const status = await WiretapServiceFactory.getServiceStatus(service);
```

## Security Considerations

- All API calls use token-based authentication
- Sensitive data is logged with masking
- Configuration validation prevents insecure settings
- Production readiness checks ensure proper security

## Performance Optimization

- Connection pooling for HTTP clients
- Retry mechanisms for failed requests
- Background processing for long-running operations
- Caching for frequently accessed data

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check Wiretap service is running
   - Verify base URL configuration
   - Check network connectivity

2. **Authentication Failed**
   - Verify token is valid and not expired
   - Check token permissions
   - Ensure token has required scopes

3. **Resource Creation Failed**
   - Check OpenStack quotas
   - Verify resource specifications
   - Check project permissions

### Debug Mode
Enable debug logging:

```bash
LOG_LEVEL=debug
```

### Health Check
Use the health check endpoint to diagnose issues:

```bash
curl http://localhost:3000/api/health/wiretap
```

## Future Enhancements

- Support for additional OpenStack services
- Advanced resource scheduling
- Cost optimization features
- Multi-region support
- Resource usage analytics


