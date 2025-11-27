# MRM360 - Cybersecurity Club Management System

A comprehensive full-stack management platform for the Penn State Cybersecurity Club (MRM360), built to streamline member onboarding, event management, team coordination, and community engagement.

## 🎯 Overview

MRM360 is a modern club management system designed specifically for cybersecurity organizations. It provides a complete solution for managing members, teams, events, attendance tracking, and integrations with external services like Discord and newsletter platforms.

## ✨ Features

### 👥 Member Management
- **OIDC Authentication**: Secure login via Authentik integration
- **User Profiles**: Comprehensive member profiles with interests, class rank, and preferences
- **Role-Based Access Control**: Admin, Executive Board, and Member roles with granular permissions
- **QR Code Generation**: Unique QR codes for each member for event check-in
- **Interest Tracking**: Members can select interests (Offense/CPTC, Defense/CCDC, CTF, Gaming) for team assignment

### 🎪 Event Management
- **Event Creation & Management**: Full CRUD operations for events
- **RSVP System**: Members can RSVP to events with confirmation/decline options
- **Attendance Tracking**: QR code-based check-in system for events
- **Waitlist Support**: Automatic waitlist management for capacity-limited events
- **Event Categories**: Support for workshops, competitions, social events, and more

### 👨‍👩‍👧‍👦 Team Management
- **Team Organization**: Manage competition teams (CPTC, CCDC) and interest-based teams
- **Team Membership**: Track members across multiple teams
- **Team Provisioning**: Automated provisioning across Nextcloud, Wiki.js, and Discord
- **Subteam Support**: Hierarchical team structures with parent-child relationships

### 🔗 Integrations
- **Discord Bot**: Automatic role assignment and channel access based on interests and teams
- **ListMonk Newsletter**: Newsletter subscription management
- **Authentik**: OIDC authentication and group synchronization
- **Nextcloud**: File sharing and collaboration
- **Wiki.js**: Documentation and knowledge base

### 📊 Dashboard & Analytics
- **Admin Dashboard**: Comprehensive overview of members, events, and teams
- **Task Management**: Background job monitoring and management
- **User Dashboard**: Personalized view for members

### 🔄 Background Processing
- **BullMQ Integration**: Asynchronous job processing with Redis
- **Team Provisioning**: Automated setup across multiple services
- **Discord Role Management**: Automatic role assignment and updates
- **Newsletter Sync**: ListMonk subscription synchronization
- **QR Code Generation**: Background generation of member QR codes

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Framework**: Vue 3 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **Form Validation**: Vee-Validate with Yup
- **QR Code**: qrcode-vue3
- **HTTP Client**: Axios
- **Notifications**: Vue Toastification

#### Backend
- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Authentik OIDC
- **Authorization**: CASL (permissions)
- **Background Jobs**: BullMQ with Redis
- **API Documentation**: Swagger/OpenAPI 3
- **Validation**: Zod schemas
- **Discord Integration**: discord.js

### Project Structure

```
.
├── frontend/          # Vue 3 frontend application
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   ├── stores/   # Pinia stores
│   │   ├── router/   # Vue Router configuration
│   │   ├── services/ # API services
│   │   └── types/    # TypeScript types
│   └── package.json
│
└── backend/          # Next.js backend API
    ├── src/
    │   ├── pages/api/ # API routes
    │   ├── managers/  # Business logic layer
    │   ├── middleware/ # Request middleware
    │   ├── permissions/ # CASL abilities
    │   ├── tasks/    # Background job processors
    │   └── utils/    # Utility functions
    ├── prisma/       # Database schema
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 13+
- **Redis** 6+
- **Authentik** instance (for OIDC authentication)
- **Discord Bot** (optional, for Discord integration)
- **ListMonk** (optional, for newsletter)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mrm360
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Backend (`backend/.env.local`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mrm360"
   REDIS_URL="redis://localhost:6379"
   NEXTAUTH_SECRET="your-secret-key"
   AUTHENTIK_CLIENT_ID="your-client-id"
   AUTHENTIK_CLIENT_SECRET="your-client-secret"
   AUTHENTIK_ISSUER="https://auth.psuccso.org"
   DISCORD_BOT_TOKEN="your-discord-bot-token"
   DISCORD_GUILD_ID="your-guild-id"
   LISTMONK_API_URL="http://localhost:9000"
   LISTMONK_API_KEY="your-listmonk-api-key"
   ```

   Frontend (`frontend/.env.local`):
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_AUTHENTIK_BASE_URL=https://auth.psuccso.org
   VITE_AUTHENTIK_CLIENT_ID=your-client-id
   VITE_AUTHENTIK_REDIRECT_URI=http://localhost:3010/auth/callback
   VITE_DISCORD_CLIENT_ID=your-discord-oauth2-client-id
   VITE_DISCORD_REDIRECT_URI=http://localhost:3010/join/dd-verify
   ```

5. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

7. **Start background workers** (optional)
   ```bash
   cd backend
   npm run worker:team-provisioning
   npm run worker:discord
   ```

### Creating an Admin User

```bash
cd backend
npm run create-admin
```

## 📖 Usage

### For Members

1. **Join the Club**: Visit `/join` to create an account
2. **Link Discord**: Connect your Discord account for role assignment
3. **Set Interests**: Select your cybersecurity interests for team assignment
4. **RSVP to Events**: Browse and RSVP to upcoming events
5. **Check In**: Use your QR code to check in at events

### For Administrators

1. **User Management**: Create, edit, and manage member accounts
2. **Event Management**: Create events, manage RSVPs, and track attendance
3. **Team Management**: Organize teams and assign members
4. **Task Monitoring**: Monitor background job processing
5. **System Configuration**: Manage integrations and settings

## 🔐 Authentication & Authorization

### Authentication Flow

1. User initiates login via OIDC
2. Redirected to Authentik for authentication
3. Authentik redirects back with authorization code
4. Backend exchanges code for tokens
5. Session established with user identity and groups

### Roles & Permissions

- **Admin**: Full system access, user management, system configuration
- **Executive Board**: User and team management, event creation
- **Member**: Basic access to events, teams, and profile management

Permissions are enforced using CASL abilities defined in `backend/src/permissions/abilities.ts`.

## 📡 API Documentation

### Swagger UI

Visit `/docs` when running the backend for interactive API documentation.

### Key Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`, `/api/user/*`
- **Teams**: `/api/teams/*`
- **Events**: `/api/events/*`
- **Tasks**: `/api/tasks/*`
- **Discord**: `/api/discord/*`
- **Join/Onboarding**: `/api/join/*`

## 🔄 Background Jobs

The system uses BullMQ for asynchronous job processing:

- **Team Provisioning**: Automatically provisions teams across Nextcloud, Wiki.js, and Discord
- **Discord Role Management**: Assigns and updates Discord roles based on user interests
- **Newsletter Sync**: Synchronizes newsletter subscriptions with ListMonk
- **QR Code Generation**: Generates QR codes for member check-in

Start workers with:
```bash
npm run worker:team-provisioning
npm run worker:discord
```

## 🧪 Development

### Code Quality

```bash
# Backend
cd backend
npm run lint
npm run type-check

# Frontend
cd frontend
npm run lint
npm run type-check
```

### Database Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist/ directory with your web server
```

### Environment Considerations

- Set `NODE_ENV=production`
- Use production database and Redis instances
- Configure proper CORS settings
- Set secure session secrets
- Enable HTTPS
- Configure reverse proxy (nginx, etc.)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain separation of concerns (managers for business logic)
3. Add comprehensive error handling
4. Update API documentation (Swagger)
5. Include proper logging
6. Write tests for new features
7. Follow the existing code style

## 📄 License

This project is proprietary to MRM360 / Penn State Cybersecurity Club.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs`
- Review the backend README at `backend/README.md`

## 🙏 Acknowledgments

Built for the Penn State Cybersecurity Club (MRM360) to streamline club operations and enhance member engagement.

