# MRM360 Backend Setup Guide

This guide will walk you through setting up the MRM360 backend development environment.

## 🚀 Quick Start

### Option 1: Using the startup script (Recommended)

**Linux/macOS:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Windows:**
```cmd
start-dev.bat
```

### Option 2: Manual setup

Follow the steps below if you prefer to set up manually.

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 13+** - [Download here](https://www.postgresql.org/download/)
- **Redis 6+** - [Download here](https://redis.io/download)
- **Git** - [Download here](https://git-scm.com/)

## 🐳 Using Docker (Recommended for development)

### 1. Start infrastructure services
```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Redis Commander on port 8081 (optional)

### 2. Verify services are running
```bash
docker-compose -f docker-compose.dev.yml ps
```

## 🗄️ Database Setup

### 1. Create database (if not using Docker)
```sql
CREATE DATABASE mrm360;
CREATE USER mrm360 WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mrm360 TO mrm360;
```

### 2. Environment configuration
```bash
cp env.example .env.local
```

Edit `.env.local` with your database credentials:
```env
DATABASE_URL="postgresql://mrm360:your_password@localhost:5432/mrm360?schema=public"
REDIS_URL="redis://localhost:6379"
```

## 📦 Application Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Generate Prisma client
```bash
npx prisma generate
```

### 3. Push database schema
```bash
npx prisma db push
```

### 4. Start development server
```bash
npm run dev
```

## 🔍 Verification

### 1. Health Check
Visit: http://localhost:3000/api/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. API Documentation
- **Interactive Docs**: http://localhost:3000/docs
- **OpenAPI Spec**: http://localhost:3000/api/docs

### 3. Database Management
```bash
npx prisma studio
```
Opens Prisma Studio at http://localhost:5555

## 🔧 Development Workflow

### 1. Start infrastructure
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Start backend
```bash
npm run dev
```

### 3. Start background worker (in new terminal)
```bash
npm run worker
```

### 4. View logs
```bash
# Backend logs
npm run dev

# Worker logs
npm run worker

# Database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Redis logs
docker-compose -f docker-compose.dev.yml logs redis
```

## 🧪 Testing the API

### 1. Authentication (Mock for now)
```bash
# The auth endpoints are currently mocked
curl http://localhost:3000/api/auth/login
```

### 2. Users API
```bash
# Get users (will require authentication)
curl http://localhost:3000/api/users

# Create user (will require authentication)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User","role":"member"}'
```

### 3. Background Tasks
```bash
# Enqueue a test job (will require authentication)
curl -X POST http://localhost:3000/api/tasks/enqueue \
  -H "Content-Type: application/json" \
  -d '{"taskType":"sendEmail","data":{"to":"test@example.com","subject":"Test"}}'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres

# Verify connection string in .env.local
```

#### 2. Redis Connection Failed
```bash
# Check if Redis is running
docker-compose -f docker-compose.dev.yml ps redis

# Check logs
docker-compose -f docker-compose.dev.yml logs redis

# Test Redis connection
docker exec -it mrm360-redis redis-cli ping
```

#### 3. Prisma Issues
```bash
# Reset Prisma
npx prisma generate
npx prisma db push

# If still having issues, reset database
npx prisma migrate reset
```

#### 4. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in package.json
```

### Reset Everything
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down -v

# Remove node_modules
rm -rf node_modules

# Start fresh
docker-compose -f docker-compose.dev.yml up -d
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## 📚 Next Steps

1. **Configure Authentik OIDC** - Update `.env.local` with your Authentik instance details
2. **Set up production environment** - Configure production database and Redis
3. **Add authentication middleware** - Implement proper session management
4. **Create frontend application** - Build the user interface
5. **Add tests** - Implement unit and integration tests

## 🆘 Getting Help

- Check the [README.md](./README.md) for detailed documentation
- Review the API documentation at http://localhost:3000/docs
- Check the logs for error messages
- Create an issue in the repository

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for database and Redis
- Configure proper CORS settings for production
- Set secure session secrets
- Regularly update dependencies
