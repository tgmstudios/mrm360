# ListMonk Service Implementation

This document describes the comprehensive ListMonk service implementation for the CCSO project, following the same architectural pattern as the Authentik service.

## Overview

The ListMonk service provides a complete integration with ListMonk instances through their REST API, allowing for subscriber management, list management, and campaign operations.

## Architecture

The service follows a layered architecture pattern:

```
ListMonkService (Main Service)
    ↓
ListMonkApiClient (API Communication)
    ↓
HttpClient (HTTP Operations)
    ↓
ListMonk REST API
```

### Components

1. **ListMonkService** - Main service interface
2. **ListMonkApiClient** - Handles REST API communication
3. **ListMonkTransformers** - Data transformation and validation
4. **ListMonkServiceFactory** - Service creation and management
5. **ListMonkConfigValidator** - Configuration validation

## Configuration

### Environment Variables

Set the following environment variables:

```bash
# Required
LISTMONK_BASE_URL=http://localhost:9000
LISTMONK_USERNAME=admin
LISTMONK_PASSWORD=your-listmonk-password
LISTMONK_NEWSLETTER_LIST_ID=your-newsletter-list-id

# Optional
LISTMONK_TIMEOUT=30000
```

### Configuration Validation

The service automatically validates configuration:

- **Base URL**: Must be a valid HTTP/HTTPS URL
- **Username**: Must be provided and valid
- **Password**: Must be provided and meet minimum requirements
- **Timeout**: Must be a positive number between 1000ms and 300000ms

## Usage

### Basic Service Creation

```typescript
import { ListMonkServiceFactory } from '@/services/listmonkServiceFactory';

// Create service from environment variables
const service = ListMonkServiceFactory.createServiceFromEnv();

// Create service with custom configuration
const service = ListMonkServiceFactory.createService({
  baseUrl: 'http://listmonk.example.com',
  username: 'admin',
  password: 'your-password',
  timeout: 30000
});

// Create service with fallback to mock
const service = ListMonkServiceFactory.createServiceWithAutoFallback();
```

### Subscriber Operations

```typescript
// Create a subscriber
const subscriber = await service.createSubscriber({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  status: 'enabled',
  lists: [1, 2]
});

// Get subscriber by email
const subscriber = await service.getSubscriberByEmail('user@example.com');

// Update subscriber
await service.updateSubscriber(subscriberId, {
  status: 'disabled',
  lists: [1, 3]
});

// Delete subscriber
await service.deleteSubscriber(subscriberId);

// List subscribers
const subscribers = await service.listSubscribers({ list: 1 });
```

### List Operations

```typescript
// Create a list
const list = await service.createList({
  name: 'Newsletter Subscribers',
  description: 'Main newsletter list',
  type: 'public',
  optin: 'single',
  tags: ['newsletter', 'main']
});

// Get list
const list = await service.getList(listId);

// Update list
await service.updateList(listId, {
  description: 'Updated description',
  tags: ['newsletter', 'main', 'updated']
});

// Delete list
await service.deleteList(listId);

// List all lists
const lists = await service.listLists();
```

### Campaign Operations

```typescript
// Create a campaign
const campaign = await service.createCampaign({
  name: 'Welcome Campaign',
  subject: 'Welcome to our newsletter!',
  body: '<h1>Welcome!</h1><p>Thank you for subscribing...</p>',
  lists: [1],
  status: 'draft'
});

// Get campaign
const campaign = await service.getCampaign(campaignId);

// Update campaign
await service.updateCampaign(campaignId, {
  subject: 'Updated subject',
  status: 'scheduled'
});

// Start campaign
await service.startCampaign(campaignId);

// Pause campaign
await service.pauseCampaign(campaignId);

// Delete campaign
await service.deleteCampaign(campaignId);

// List campaigns
const campaigns = await service.listCampaigns({ status: 'draft' });
```

### Newsletter Operations (Backward Compatibility)

```typescript
// Subscribe to newsletter
await service.subscribeToList('1', 'user@example.com', {
  firstName: 'John',
  lastName: 'Doe'
});

// Unsubscribe from newsletter
await service.unsubscribeFromList('1', 'user@example.com');

// Get newsletter lists
const lists = await service.getLists();

// Get newsletter subscribers
const subscribers = await service.getSubscribers('1');
```

### Health Checks

```typescript
// Check service health
const isHealthy = await service.healthCheck();

// Get service status
const status = await ListMonkServiceFactory.getServiceStatus(service);
```

## API Endpoints

### Subscriber Management

- **Create Subscriber**: `POST /api/subscribers`
- **Update Subscriber**: `PUT /api/subscribers/{id}`
- **Delete Subscriber**: `DELETE /api/subscribers/{id}`
- **Get Subscriber**: `GET /api/subscribers/{id}`
- **Get Subscriber by Email**: `GET /api/subscribers?query=email:{email}`
- **List Subscribers**: `GET /api/subscribers`
- **Add to List**: `PUT /api/subscribers/{id}` (update lists)
- **Remove from List**: `PUT /api/subscribers/{id}` (update lists)

### List Management

- **Create List**: `POST /api/lists`
- **Update List**: `PUT /api/lists/{id}`
- **Delete List**: `DELETE /api/lists/{id}`
- **Get List**: `GET /api/lists/{id}`
- **List Lists**: `GET /api/lists`

### Campaign Management

- **Create Campaign**: `POST /api/campaigns`
- **Update Campaign**: `PUT /api/campaigns/{id}`
- **Delete Campaign**: `DELETE /api/campaigns/{id}`
- **Get Campaign**: `GET /api/campaigns/{id}`
- **List Campaigns**: `GET /api/campaigns`
- **Start Campaign**: `POST /api/campaigns/{id}/start`
- **Pause Campaign**: `POST /api/campaigns/{id}/pause`

## Data Types

### ListMonkSubscriber

```typescript
interface ListMonkSubscriber {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  status: 'enabled' | 'disabled' | 'blocklisted';
  lists: number[];
  attributes?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### ListMonkList

```typescript
interface ListMonkList {
  id: number;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'optin' | 'optout';
  optin: 'single' | 'double';
  tags?: string[];
  subscriberCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### ListMonkCampaign

```typescript
interface ListMonkCampaign {
  id: number;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'finished';
  lists: number[];
  templateId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
}
```

## Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: Data validation before API calls
- **Authentication Errors**: Automatic retry and token refresh
- **Network Errors**: Timeout and retry mechanisms
- **API Errors**: Detailed error messages with context

## Logging

All operations are logged with appropriate levels:

- **INFO**: Successful operations
- **WARN**: Non-critical issues (warnings)
- **ERROR**: Failed operations with details

## Testing

### Mock Service

For testing and development, use the mock service:

```typescript
const mockService = ListMonkServiceFactory.createMockService();
```

### Health Checks

```typescript
// Validate service health
const isHealthy = await ListMonkServiceFactory.validateServiceHealth(service);

// Check environment configuration
const status = ListMonkServiceFactory.checkEnvironmentStatus();
```

## Migration from Old Service

The new service maintains backward compatibility with the old `subscribeToList` and `unsubscribeFromList` methods while providing enhanced functionality.

### Old Usage

```typescript
// Old way (still supported)
await listmonkService.subscribeToList('1', 'user@example.com', {
  firstName: 'John',
  lastName: 'Doe'
});
```

### New Usage

```typescript
// New way (recommended)
const subscriber = await listmonkService.createSubscriber({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'enabled',
  lists: [1]
});
```

## Contributing

When extending the service:

1. Follow the existing architectural patterns
2. Add comprehensive error handling
3. Include validation for new inputs
4. Add tests for new functionality
5. Update documentation

## License

This service is part of the CCSO project and follows the same licensing terms.
