# Bangladesh Restaurant Full-Stack System

A production-oriented restaurant ordering and management platform.

## Architecture

Customer / Staff Browser
        ↓
Next.js Frontend
        ↓
NestJS REST API
        ↓
PostgreSQL
        ↓
Business Modules

Additional services:
- Redis
- Object Storage
- Payment Gateway
- Email
- WhatsApp
- AI
- WebSocket / Realtime

## Project Structure

.
├── frontend/       # Next.js + React + TypeScript
├── backend/        # NestJS + TypeScript
├── database/       # SQL/database supporting files
├── docs/           # Project documentation
├── scripts/        # Development/deployment scripts
├── uploads/        # Local development upload location
├── docker-compose.yml
└── .gitignore

## Development URLs

Frontend:
http://localhost:3000

Backend:
http://localhost:4000

Backend health:
http://localhost:4000/api

Swagger:
http://localhost:4000/docs

## Important

Secrets must stay in environment variables and must never be committed to Git.
