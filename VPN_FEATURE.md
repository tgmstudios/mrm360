# VPN Profile Request Feature

## Overview

Added VPN profile request functionality to MRM360 member profiles. Members can request VPN access through their profile page, which automatically creates a VPN user in Pritunl and emails the configuration.

## Implementation

### Backend

**Pritunl Service** (`backend/src/services/pritunlService.ts`):
- HMAC-SHA256 authenticated API client
- Methods for creating users, sending profiles via email
- Singleton pattern for service management

**API Endpoint** (`backend/src/pages/api/user/vpn-request.ts`):
- Route: `POST /api/user/vpn-request`
- JWT authentication required
- Auto-generates username from user profile
- Creates user in CCSOMembers organization

### Frontend

**Profile Page** (`frontend/src/pages/Profile.vue`):
- Added "🔐 VPN Access" section
- Request button with loading states
- Toast notifications for success/error feedback

## Configuration

Create `backend/.env.local` with:

```env
PRITUNL_BASE_URL=https://pritunl.psuccso.org
PRITUNL_API_TOKEN=<your-api-token>
PRITUNL_API_SECRET=<your-api-secret>
```

**Security Note**: Never commit `.env.local` - it's gitignored for security.

## Testing

Run the test suite:

```bash
cd backend
npx tsx test-pritunl.ts
```

Expected output:
```
✅ Found organizations
✅ Found CCSOMembers organization
✅ Found users
✅ API connection verified
```

## Usage

1. **Backend**: `npm run dev` (port 3000)
2. **Frontend**: `cd frontend && npm run dev` (port 3010)
3. **User Flow**:
   - Log into MRM360
   - Navigate to Profile page
   - Click "Request VPN Profile"
   - VPN config sent to email

## API Documentation

**Endpoint**: `POST /api/user/vpn-request`

**Authentication**: Bearer JWT token required

**Response**:
```json
{
  "success": true,
  "message": "VPN profile has been created and sent to your email",
  "pritunlUserId": "user-id"
}
```

## Security

- JWT authentication required for all API requests
- HMAC-SHA256 signature-based Pritunl API auth
- Duplicate user prevention
- All credentials stored in gitignored `.env.local`
- Never commit API credentials to git

## Branch

- **Feature Branch**: `feature/vpn-profile-request`
- **Pull Request**: https://github.com/tgmstudios/mrm360/pull/new/feature/vpn-profile-request
