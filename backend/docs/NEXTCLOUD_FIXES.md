# Nextcloud Integration Fixes

## Overview

This document outlines the fixes implemented to resolve the three main issues with Nextcloud integration:

1. **Folder Management 404 Error** - Path structure issues
2. **Calendar Management 501 Error** - Calendar app not installed/configured
3. **Deck Board Management 400 Error** - Color validation issues

## Issues and Solutions

### 1. Folder Management 404 Error

**Problem**: The original implementation used `PUT` requests for folder creation, which is incorrect for WebDAV. This caused 404 errors because the endpoint didn't exist.

**Root Cause**: 
- Using `PUT` method instead of `MKCOL` for WebDAV folder creation
- Missing proper WebDAV headers and method support

**Solution Implemented**:
- Added `mkcol` method to `HttpClient` class for proper WebDAV support
- Updated `createGroupFolder` method to use `MKCOL` instead of `PUT`
- Added proper WebDAV headers (`Depth: 0`, `Content-Type: application/xml`)

**Code Changes**:
```typescript
// Before (incorrect)
await this.httpClient.put(data.path, null, {
  ...this.getAuthHeaders(),
  'Content-Type': 'application/xml',
  'Depth': '0'
});

// After (correct)
await this.httpClient.mkcol(data.path, {
  ...this.getAuthHeaders(),
  'Content-Type': 'application/xml',
  'Depth': '0'
});
```

### 2. Calendar Management 501 Error

**Problem**: The calendar creation was failing with 501 errors because the Calendar app wasn't installed or properly configured on the Nextcloud instance.

**Root Cause**: 
- No check for app availability before attempting operations
- Missing proper error handling for app-specific issues

**Solution Implemented**:
- Added app availability check before calendar operations
- Enhanced error handling with specific error messages
- Added proper OCS API headers for Nextcloud compatibility

**Code Changes**:
```typescript
// Before (no app check)
const response = await this.httpClient.post('/remote.php/dav/calendars', {
  name: data.name,
  color: data.color || '#000000'
}, {
  ...this.getAuthHeaders(),
  'Content-Type': 'application/xml'
});

// After (with app check)
// First check if Calendar app is available
try {
  await this.httpClient.get('/remote.php/dav/calendars', {
    ...this.getAuthHeaders(),
    'OCS-APIRequest': 'true'
  });
} catch (error: any) {
  if (error.response?.status === 404 || error.response?.status === 501) {
    throw new Error('Calendar app not installed or configured on this Nextcloud instance');
  }
  throw error;
}

// Then create calendar with proper headers
const response = await this.httpClient.post('/remote.php/dav/calendars', {
  name: data.name,
  color: data.color || '#000000'
}, {
  ...this.getAuthHeaders(),
  'Content-Type': 'application/xml',
  'OCS-APIRequest': 'true'
});
```

### 3. Deck Board Management 400 Error

**Problem**: Deck board creation was failing with 400 errors due to invalid color format validation.

**Root Cause**: 
- Missing color format validation
- No app availability check for Deck app
- Incorrect API endpoint structure

**Solution Implemented**:
- Added comprehensive color format validation (6-character hex)
- Added app availability check before deck operations
- Enhanced error handling with specific color validation messages
- Added proper content type headers

**Code Changes**:
```typescript
// Before (no validation)
const response = await this.httpClient.post('/index.php/apps/deck/api/v1.0/boards', {
  title: data.name,
  color: data.color || '#000000'
}, {
  ...this.getAuthHeaders(),
  'OCS-APIRequest': 'true'
});

// After (with validation and app check)
// Validate color format
const color = data.color || '#000000';
if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
  throw new Error('Invalid color format. Must be a valid 6-character hex color (e.g., #FF0000)');
}

// Check if Deck app is available
try {
  await this.httpClient.get('/index.php/apps/deck/api/v1.0/boards', {
    ...this.getAuthHeaders(),
    'OCS-APIRequest': 'true'
  });
} catch (error: any) {
  if (error.response?.status === 404 || error.response?.status === 501) {
    throw new Error('Deck app not installed or configured on this Nextcloud instance');
  }
  throw error;
}

// Create board with proper headers
const response = await this.httpClient.post('/index.php/apps/deck/api/v1.0/boards', {
  title: data.name,
  color: color
}, {
  ...this.getAuthHeaders(),
  'OCS-APIRequest': 'true',
  'Content-Type': 'application/json'
});
```

## Enhanced Error Handling

### Specific Error Messages

The service now provides specific, actionable error messages for common issues:

```typescript
// Calendar app not available
if (error.message.includes('Calendar app not installed')) {
  throw new Error('Calendar app not installed or configured on this Nextcloud instance. Please install the Calendar app from the Nextcloud app store.');
}

// Deck app not available
if (error.message.includes('Deck app not installed')) {
  throw new Error('Deck app not installed or configured on this Nextcloud instance. Please install the Deck app from the Nextcloud app store.');
}

// Invalid color format
if (error.message.includes('Invalid color format')) {
  throw new Error('Invalid color format provided. Color must be a valid 6-character hex color (e.g., #FF0000).');
}

// Authentication issues
if (error.message.includes('401') || error.message.includes('403')) {
  throw new Error('Authentication failed. Please check your Nextcloud credentials and ensure the user has admin privileges.');
}

// Path not found
if (error.message.includes('404')) {
  throw new Error('Folder path not found. Please check the base path configuration and ensure the parent directory exists.');
}
```

### Validation Improvements

Added comprehensive validation at multiple levels:

1. **Service Layer**: App availability checks and error message enhancement
2. **API Client Layer**: App availability checks and proper API calls
3. **Transformer Layer**: Input validation including color format validation

## Testing

### Test Script

A comprehensive test script has been created to verify all fixes:

```bash
cd backend
npm run tsx scripts/testNextcloudFixes.ts
```

### Test Coverage

The test script covers:
- ✅ Service creation and health checks
- ✅ Group management
- ✅ Folder management (fixed 404 issue)
- ✅ Calendar management (fixed 501 issue)
- ✅ Deck board management (fixed 400 issue)
- ✅ Color validation testing
- ✅ Cleanup and error handling

## Configuration Requirements

### Environment Variables

Ensure these environment variables are properly configured:

```bash
NEXTCLOUD_BASE_URL=https://your-nextcloud-instance.com
NEXTCLOUD_USERNAME=admin
NEXTCLOUD_PASSWORD=your-secure-password
NEXTCLOUD_BASE_PATH=/teams
```

### Nextcloud App Requirements

For full functionality, ensure these apps are installed:

1. **Calendar App**: Required for calendar management
2. **Deck App**: Required for deck board management
3. **Files App**: Required for folder management (usually included by default)

### User Permissions

The configured user must have:
- Admin privileges for group management
- Write access to the base path directory
- Access to create calendars and deck boards

## Troubleshooting

### Common Issues

1. **Calendar 501 Error**: Install Calendar app from Nextcloud app store
2. **Deck 501 Error**: Install Deck app from Nextcloud app store
3. **Folder 404 Error**: Check base path configuration and user permissions
4. **Color Validation Error**: Ensure colors are valid 6-character hex (e.g., #FF0000)

### Debug Mode

Enable debug logging by setting the log level:

```typescript
// In your environment or configuration
LOG_LEVEL=debug
```

### Health Check

Use the health check endpoint to diagnose issues:

```bash
GET /api/health/nextcloud
```

## Performance Impact

The implemented fixes have minimal performance impact:

- **App availability checks**: One additional HTTP request per operation
- **Color validation**: Simple regex validation (negligible overhead)
- **Enhanced error handling**: No additional network calls

## Security Considerations

1. **Input Validation**: All inputs are validated and sanitized
2. **Error Messages**: Error messages don't expose sensitive information
3. **Authentication**: Proper authentication headers are used for all requests
4. **Path Sanitization**: Folder paths are sanitized to prevent directory traversal

## Future Improvements

1. **Caching**: Cache app availability checks to reduce API calls
2. **Retry Logic**: Implement retry logic for transient failures
3. **Metrics**: Add metrics collection for monitoring
4. **Async Operations**: Consider async folder creation for large directory structures

## Conclusion

These fixes resolve the core integration issues and provide a robust foundation for Nextcloud operations. The enhanced error handling and validation ensure better user experience and easier troubleshooting.

For additional support or questions, refer to the main Nextcloud service documentation or create an issue in the project repository.
