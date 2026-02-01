# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HomeDepot Paisano is a worker-contractor connection platform (similar to TaskRabbit) for day laborers and contractors. Full-stack TypeScript application with React/Redux frontend and Express/PostgreSQL backend.

## Common Commands

```bash
# Development
npm run dev          # Start dev server with nodemon + ts-node
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled JavaScript

# Testing and Linting
npm test             # Run Jest test suite
npm run lint         # ESLint with TypeScript parser

# Database
npm run migrate      # Run Knex migrations
npm run seed         # Populate database with seed data
```

## Architecture

### Frontend (`/src`)
- **React 18 + TypeScript** with strict mode
- **Redux Toolkit + RTK Query** for state management and API caching
- **Tailwind CSS** with custom orange/sky theme
- **Socket.io** for real-time features

### Key Patterns
- **Entity Adapter**: Jobs use `createEntityAdapter` for normalized state (`src/features/jobs/jobsSlice.ts`)
- **RTK Query with Reauth**: Auto token refresh on 401 (`src/services/api/apiSlice.ts`)
- **Offline-First**: Redux Persist + offline queue middleware (`src/store/middleware/offlineMiddleware.ts`)
- **WebSocket Redux Integration**: Socket events dispatch Redux actions (`src/services/websocket/websocketService.ts`)

### State Structure
```
store = {
  auth,           // User, tokens, authentication state
  jobs,           // Jobs with filters, pagination, real-time updates
  messages,       // Messaging state
  notifications,  // Notification queue
  location,       // Geolocation data
  payment,        // Payment processing
  [apiSlice],     // RTK Query cache
}
```

### Backend (Configured, Partially Implemented)
- **Express.js** with Helmet, CORS, compression
- **PostgreSQL + PostGIS** for geospatial job matching
- **JWT + OAuth2** (Google, Facebook, LinkedIn)
- **Stripe** payments, **Twilio** SMS, **AWS S3** storage

### Database Schema
Full schema in `database-schema.sql` with:
- Users with roles (WORKER, CONTRACTOR, ADMIN, MODERATOR)
- Worker/contractor profiles with PostGIS location
- Jobs, applications, contracts, time tracking
- Messaging system and notifications
- Full-text search and spatial indexes

## Type System

Core types in `src/types/`:
- **User roles**: WORKER, CONTRACTOR, ADMIN, MODERATOR
- **Job lifecycle**: DRAFT → ACTIVE → IN_PROGRESS → COMPLETED
- **20 job categories**: GENERAL_LABOR, CONSTRUCTION, PLUMBING, ELECTRICAL, etc.
- **MFA types**: TOTP, SMS, EMAIL, BACKUP_CODE

## Multi-Agent Configuration

The project uses specialized agents defined in `.agents.yml`:
1. Frontend UI/UX Agent - React components, accessibility
2. Frontend State Agent - Redux, RTK Query, WebSocket
3. Backend API Agent - Express, PostgreSQL, REST APIs
4. Backend Security Agent - Auth, RBAC, MFA, compliance

## Environment Setup

Copy `.env.example` to `.env`. Key configuration groups:
- Database (PostgreSQL)
- Redis (caching/sessions)
- JWT secrets and expiry
- OAuth2 provider credentials
- SendGrid email, Twilio SMS
- AWS S3, Stripe payments

## Current Implementation Status

**Implemented:**
- Redux store with auth/jobs slices
- RTK Query API layer with reauth
- WebSocket service with reconnection
- Offline queue middleware
- UI components (auth, job, layout, messaging, profile, rating, search)
- Full database schema

**Not Yet Implemented:**
- Backend routes, controllers, models, middleware
- Knex migrations and seeds
- Custom React hooks
- Utility functions
- Test files
