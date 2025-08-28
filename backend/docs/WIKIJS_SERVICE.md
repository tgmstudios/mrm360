# Wiki.js Service Implementation

This document describes the comprehensive Wiki.js service implementation for the CCSO project, following the same architectural pattern as the Authentik service.

## Overview

The Wiki.js service provides a complete integration with Wiki.js instances through their GraphQL API, allowing for page management, user management, and group operations.

## Architecture

The service follows a layered architecture pattern:

```
WikiJsService (Main Service)
    ↓
WikiJsApiClient (API Communication)
    ↓
HttpClient (HTTP Operations)
    ↓
Wiki.js GraphQL API
```

### Components

1. **WikiJsService** - Main service interface
2. **WikiJsApiClient** - Handles GraphQL API communication
3. **WikiJsTransformers** - Data transformation and validation
4. **WikiJsServiceFactory** - Service creation and management
5. **WikiJsConfigValidator** - Configuration validation

## Configuration

### Environment Variables

Set the following environment variables:

```bash
WIKIJS_BASE_URL=https://your-wiki.example.com
WIKIJS_API_TOKEN=your-api-token-here
WIKIJS_BASE_PATH=/wiki
```

### Configuration Validation

The service automatically validates configuration:

- **Base URL**: Must be a valid HTTP/HTTPS URL
- **API Token**: Must be provided and valid
- **Base Path**: Must start with forward slash and contain valid characters

## Usage

### Basic Service Creation

```typescript
import { WikiJsServiceFactory } from '@/services/wikijsServiceFactory';

// Create service from environment variables
const service = WikiJsServiceFactory.createServiceFromEnv();

// Create service with custom configuration
const service = WikiJsServiceFactory.createService({
  baseUrl: 'https://wiki.example.com',
  token: 'your-token',
  basePath: '/docs'
});

// Create service with fallback to mock
const service = WikiJsServiceFactory.createServiceWithFallback();
```

### Page Operations

```typescript
// Create a page
const page = await service.createPage('/path/to/page', 'Page Title', '# Content');

// Get a page
const page = await service.getPage('/path/to/page');

// Update a page
const updatedPage = await service.updatePage('/path/to/page', {
  title: 'New Title',
  content: '# New Content'
});

// Delete a page
await service.deletePage('/path/to/page');

// Check if page exists
const exists = await service.pageExists('/path/to/page');

// Get all pages
const allPages = await service.getAllPages();

// Search pages
const results = await service.searchPages('search term');
```

### Team Page Creation

```typescript
// Create team index page
const teamPage = await service.createTeamIndexPage('development', 'TeamName');

// This creates a page at: /wiki/development-team/TeamName
// With structured content including team information and quick links
```

### Auto Path Generation

```typescript
// Create page with auto-generated path
const page = await service.createPageWithAutoPath(
  'Page Title With Spaces',
  '# Content here',
  '/custom/base/path'
);

// Generates safe path: /custom/base/path/page-title-with-spaces
// Automatically handles path collisions
```

### Health Monitoring

```typescript
// Check service health
const isHealthy = await service.healthCheck();

// Get detailed service status
const status = await service.getServiceStatus();
console.log(status);
// {
//   isHealthy: true,
//   basePath: '/wiki',
//   lastHealthCheck: '2024-01-01T00:00:00.000Z',
//   pageCount: 42
// }
```

## API Endpoints

### Health Check

```
GET /api/health/wikijs
```

Returns service health status, configuration details, and validation results.

## Error Handling

The service provides comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **API Errors**: GraphQL error handling with response parsing
- **Network Errors**: HTTP client error handling with retry logic
- **Configuration Errors**: Environment variable validation

### Error Types

- `ValidationError`: Input data validation failures
- `PageNotFoundError`: Page not found in Wiki.js
- `APIError`: GraphQL API communication errors
- `ConfigurationError`: Service configuration issues

## Testing

### Test Script

Run the comprehensive test suite:

```bash
cd backend
npm run ts-node src/scripts/testWikiJsService.ts
```

The test script covers:
- Configuration validation
- Service creation
- Health checks
- Page operations (CRUD)
- Team page creation
- Auto path generation
- Error handling

### Mock Service

For development and testing, the service provides a mock implementation:

```typescript
const mockService = WikiJsServiceFactory.createMockService();
```

## Production Considerations

### Security

- Use HTTPS in production
- Ensure API tokens are strong and secure
- Validate all input data
- Sanitize page content

### Performance

- Implement caching for frequently accessed pages
- Use pagination for large page lists
- Monitor API rate limits

### Monitoring

- Health check endpoints for monitoring
- Comprehensive logging
- Error tracking and alerting

## Troubleshooting

### Common Issues

1. **Configuration Errors**
   - Check environment variables are set correctly
   - Verify API token is valid
   - Ensure base URL is accessible

2. **API Communication Errors**
   - Check Wiki.js instance is running
   - Verify GraphQL endpoint is accessible
   - Check API token permissions

3. **Page Operation Errors**
   - Validate page paths are correct
   - Check content doesn't contain invalid characters
   - Ensure proper permissions

### Debug Mode

Enable debug logging:

```typescript
import { logger } from '@/utils/logger';
logger.setLevel('debug');
```

## API Reference

### WikiJsService

Main service class with methods for page management.

### WikiJsApiClient

Low-level GraphQL API client for Wiki.js operations.

### WikiJsTransformers

Data transformation utilities for API communication.

### WikiJsServiceFactory

Factory for creating and managing service instances.

### WikiJsConfigValidator

Configuration validation and environment checking.

## GraphQL Schema

The service supports the following Wiki.js GraphQL operations:

- **Pages**: Create, read, update, delete
- **Users**: Create, search, list
- **Groups**: Create, list
- **Health**: Service status checks

## Contributing

When extending the service:

1. Follow the existing architectural patterns
2. Add comprehensive error handling
3. Include validation for new inputs
4. Add tests for new functionality
5. Update documentation

## License

This service is part of the CCSO project and follows the same licensing terms.
