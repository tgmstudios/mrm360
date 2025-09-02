# Member Paid Status Integration with Authentik

This document describes the integration between member paid status and Authentik group management.

## Overview

When a member's paid status is updated (paid/unpaid), the system automatically manages their membership in the "member-paid" group in Authentik. This allows for seamless integration between the internal member management system and Authentik's identity and access management.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Authentik     │
│   (Vue.js)      │◄──►│   (Next.js)      │◄──►│   (IAM)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Database       │
                    │   (PostgreSQL)   │
                    └──────────────────┘
```

## Components

### 1. MemberPaidStatusService
Main service class that handles:
- Updating member paid status in the database
- Managing Authentik group membership
- Creating the "member-paid" group if it doesn't exist
- Syncing all paid statuses for consistency

### 2. Integration Points
- **UserManager.updateUser()**: Automatically triggers Authentik group management when paid status changes
- **AuthManager.updateUserPaidStatus()**: Uses the new service for paid status updates
- **API Endpoints**: Admin endpoints for manual sync and group management

## How It Works

### Automatic Group Management
1. When a user's paid status is updated via the API:
   - The database is updated with the new paid status
   - If the user has an Authentik ID, their group membership is managed:
     - **Paid = true**: User is added to the "member-paid" group
     - **Paid = false**: User is removed from the "member-paid" group

2. The "member-paid" group is created automatically if it doesn't exist

### Error Handling
- If Authentik operations fail, the database update still succeeds
- Errors are logged but don't prevent the user update from completing
- This ensures the system remains functional even if Authentik is temporarily unavailable

## API Endpoints

### Update User Paid Status
```
PUT /api/users/{id}
{
  "isPaid": true
}
```

### Admin Endpoints

#### Sync All Paid Statuses
```
POST /api/admin/sync-paid-status
```
Synchronizes all users' paid statuses with their Authentik group memberships.

#### Get Member-Paid Group Members
```
GET /api/admin/member-paid-group
```
Returns the current members of the "member-paid" group in Authentik.

## Configuration

### Environment Variables
Ensure these are set for Authentik integration:
```bash
AUTHENTIK_BASE_URL=http://localhost:9000
AUTHENTIK_TOKEN=your-api-token
AUTHENTIK_PARENT_GROUP_TEMPLATE={parent_team_type}-team
```

### Group Name
The "member-paid" group is created with:
- **Name**: `member-paid`
- **Description**: "Members who have paid their dues"

## Testing

### Manual Testing
Use the test script to verify functionality:
```bash
cd backend
npm run ts-node scripts/testMemberPaidStatus.ts
```

### API Testing
1. Update a user's paid status via the API
2. Check that they appear/disappear from the "member-paid" group in Authentik
3. Use the admin sync endpoint to verify consistency

## Monitoring

### Logs
The service logs all operations:
- Paid status updates
- Authentik group operations
- Errors and warnings
- Sync operations

### Key Metrics
- Number of users in the "member-paid" group
- Sync success/failure rates
- Error rates for Authentik operations

## Troubleshooting

### Common Issues

1. **User not added to group**
   - Check if user has an `authentikId`
   - Verify Authentik API connectivity
   - Check logs for specific error messages

2. **Group doesn't exist**
   - The service automatically creates the group
   - Check Authentik permissions for group creation
   - Verify API token has sufficient permissions

3. **Sync failures**
   - Check Authentik API status
   - Verify network connectivity
   - Review error logs for specific issues

### Debug Commands
```bash
# Test the service directly
npm run ts-node scripts/testMemberPaidStatus.ts

# Check Authentik configuration
npm run ts-node scripts/testAuthentikService.ts
```

## Security Considerations

1. **API Token Security**: Ensure the Authentik API token is securely stored
2. **Permission Checks**: Only admins can access sync endpoints
3. **Error Handling**: Sensitive information is not exposed in error messages
4. **Audit Logging**: All operations are logged for audit purposes

## Future Enhancements

1. **Batch Operations**: Support for bulk paid status updates
2. **Webhook Integration**: Real-time sync via Authentik webhooks
3. **Advanced Group Management**: Support for multiple paid status groups
4. **Metrics Dashboard**: Admin interface for monitoring sync status
