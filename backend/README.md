# MRM360 Backend

A comprehensive Next.js TypeScript backend for MRM360 management system with OIDC authentication, role-based permissions, and background task processing.

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 13+ with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Authentik OIDC integration
- **Permissions**: CASL-based authorization
- **Background Tasks**: BullMQ with Redis
- **API Documentation**: OpenAPI 3 (Swagger)
- **Validation**: Zod schema validation

### Core Principles
- **Separation of Concerns**: Business logic in manager classes, not API routes
- **Type Safety**: Full TypeScript coverage with strict typing
- **Security First**: All routes protected except auth endpoints
- **Scalable**: Background job processing with BullMQ
- **Documented**: Auto-generated Swagger documentation

## 📁 Project Structure

```
src/
├── pages/api/           # Next.js API routes
│   ├── auth/           # Authentication endpoints
│   ├── users/          # User management
│   ├── teams/          # Team management
│   ├── events/         # Event management
│   ├── groups/         # Group management
│   ├── tasks/          # Background task endpoints
│   └── docs.ts         # Swagger documentation
├── managers/            # Business logic layer
│   ├── authManager.ts
│   ├── userManager.ts
│   ├── teamManager.ts
│   ├── eventManager.ts
│   ├── groupManager.ts
│   └── taskManager.ts
├── middleware/          # Request processing
│   ├── authMiddleware.ts
│   └── errorHandler.ts
├── permissions/         # CASL ability definitions
│   └── abilities.ts
├── tasks/              # Background job processing
│   ├── queue.ts        # BullMQ setup
│   ├── worker.ts       # Main worker
│   └── workers/        # Job processors
├── models/             # Database models
│   └── prismaClient.ts
├── types/              # TypeScript definitions
│   └── index.d.ts
└── utils/              # Utility functions
    ├── logger.ts
    └── swagger.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- Authentik instance (for OIDC)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `AUTHENTIK_CLIENT_ID` | OIDC client ID | Yes |
| `AUTHENTIK_CLIENT_SECRET` | OIDC client secret | Yes |
| `AUTHENTIK_ISSUER` | OIDC issuer URL | Yes |

## 🔐 Authentication & Authorization

### OIDC Flow
1. User visits `/api/auth/login`
2. Redirected to Authentik for authentication
3. Authentik redirects back to `/api/auth/callback`
4. Session established with user identity and groups

### Roles & Permissions
- **Admin**: Full system access
- **Exec-Board**: User and team management
- **Member**: Basic access to events and teams

### CASL Abilities
Permissions are defined in `src/permissions/abilities.ts`:
```typescript
// Example ability
can('read', 'User', { id: user.id }) // Users can read their own profile
can('manage', 'User') // Admins can manage all users
```

## 📊 API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate OIDC login
- `GET /api/auth/callback` - OIDC callback handler
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - List users (with filtering)
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/[id]` - Get team by ID
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Get event by ID
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Groups
- `GET /api/groups` - List Authentik groups

### Background Tasks
- `POST /api/tasks/enqueue` - Enqueue background job

## 🔄 Background Job Processing

### Available Job Types
- `sendEmail` - Send email notifications
- `generateQRCode` - Generate QR codes for users
- `syncGroups` - Sync with Authentik groups

### Job Enqueuing
```typescript
// Example: Enqueue email job
const job = await taskManager.enqueueJob('sendEmail', {
  to: 'user@example.com',
  subject: 'Welcome to MRM360',
  template: 'welcome'
});
```

### Worker Processing
Jobs are processed by workers in `src/tasks/workers/`:
- `emailWorker.ts` - Handles email sending
- `qrCodeWorker.ts` - Generates QR codes
- `syncGroupsWorker.ts` - Syncs group data

## 📚 API Documentation

### Swagger UI
Visit `/docs` for interactive API documentation with:
- Full endpoint documentation
- Request/response schemas
- Authentication requirements
- Interactive testing

### OpenAPI Spec
Raw OpenAPI 3 specification available at `/api/docs`

## 🗄️ Database Schema

### Core Entities
- **User**: User accounts with roles and permissions
- **Team**: Competition and development teams
- **Event**: Scheduled events with attendance tracking
- **Group**: Authentik group mappings
- **TeamMember**: User-team relationships
- **EventAttendance**: Event RSVP and check-in records

### Relationships
- Users belong to multiple teams
- Teams can have subteams (parent-child)
- Events can be linked to teams
- Groups contain multiple users

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Database Migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### Code Quality
```bash
npm run lint
npm run type-check
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Support
```bash
docker build -t mrm360-backend .
docker run -p 3000:3000 mrm360-backend
```

### Environment Considerations
- Set `NODE_ENV=production`
- Use production database and Redis instances
- Configure proper CORS settings
- Set secure session secrets

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain separation of concerns
3. Add comprehensive error handling
4. Update Swagger documentation
5. Include proper logging

## 📄 License

This project is proprietary to MRM360.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs`
