# Meeting Note Taker - Fireflies.ai Clone

## 🎯 Project Overview

A modern meeting transcription and analysis application inspired by Fireflies.ai. This application provides meeting recording, transcription, summarization, and action item extraction capabilities using AI-powered services.

**Tech Stack**: Docker + Supabase Hybrid Architecture

## 📋 Core Features (MVP)

### 1. Authentication
- Google OAuth via Supabase
- Protected routes
- User session management

### 2. Meeting Management
- Create/List meetings
- Upload audio files (MP3, WAV, WebM)
- Meeting metadata (title, date, participants)

### 3. Audio Processing Pipeline
- Async processing with BullMQ
- Real-time status updates via WebSocket
- Three-stage processing:
  1. Transcription (Whisper API or Gemini)
  2. Summary generation
  3. Action items extraction

### 4. User Interface
- Dashboard with meetings list
- Meeting detail view
- Upload interface with drag-and-drop
- Real-time processing status
- View/Export results

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Frontend       │◄────────┤  Backend API     │◄────────┤  Supabase      │
│  (Vercel)       │         │  (Railway)       │         │  - PostgreSQL  │
│                 │         │                  │         │  - Storage     │
│  - React        │         │  - Express       │         │  - Auth        │
│  - TypeScript   │  WSS    │  - BullMQ        │         │                │
│  - Tailwind     │◄────────┤  - Redis         │         └─────────────────┘
│  - Shadcn UI    │         │  - WebSocket     │                 
│  - Zustand      │         │  - Worker        │         ┌─────────────────┐
│  - React Query  │         │                  │────────►│                 │
│                 │         │                  │         │  AI APIs        │
└─────────────────┘         └──────────────────┘         │  - OpenAI      │
                                                          │  - Gemini      │
                                                          └─────────────────┘
```

## 🗂️ Project Structure

```
meeting-note-taker/
├── apps/
│   ├── web/                    # Frontend (Vite + React)
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities
│   │   │   ├── pages/          # Route pages
│   │   │   ├── services/       # API services
│   │   │   └── stores/         # Zustand stores
│   │   └── package.json
│   │
│   └── api/                    # Backend (Express)
│       ├── src/
│       │   ├── routes/         # API routes
│       │   ├── services/       # Business logic
│       │   ├── queues/         # BullMQ queues
│       │   ├── workers/        # Job processors
│       │   ├── websocket/      # WebSocket server
│       │   ├── db/            # Database (Drizzle)
│       │   └── index.ts       # Entry point
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared types/utils
│       ├── src/
│       │   ├── types/         # TypeScript types
│       │   └── schemas/       # Zod schemas
│       └── package.json
│
├── docker-compose.yml         # Local development
├── Dockerfile                 # Production build
├── railway.toml              # Railway deployment
├── turbo.json                # Turborepo config
├── package.json              # Root package
└── README.md                 # Documentation
```

## 🚀 Implementation Plan

### Phase 1: Setup & Infrastructure
- [x] Initialize monorepo with Turborepo
- [ ] Setup Supabase project
- [ ] Configure Docker for local development
- [ ] Setup TypeScript, ESLint, Prettier
- [ ] Create shared types package

### Phase 2: Authentication & Database
- [ ] Implement Supabase auth with Google OAuth
- [ ] Setup Drizzle ORM with schema
- [ ] Create database migrations
- [ ] Protected route middleware

### Phase 3: Core Backend
- [ ] Express API structure
- [ ] File upload endpoint
- [ ] BullMQ queue setup
- [ ] WebSocket server
- [ ] Audio processing worker

### Phase 4: AI Integration
- [ ] Integrate Whisper/Gemini for transcription
- [ ] Implement summary generation
- [ ] Extract action items
- [ ] Error handling and retries

### Phase 5: Frontend UI
- [ ] Setup Vite + React + TypeScript
- [ ] Install and configure Shadcn UI
- [ ] Create authentication flow
- [ ] Build dashboard layout
- [ ] Meeting upload interface
- [ ] Real-time status updates
- [ ] Results display

### Phase 6: Polish & Deploy
- [ ] Error boundaries
- [ ] Loading states
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Environment variables setup
- [ ] Final testing

## 💾 Database Schema

```sql
-- Users (managed by Supabase Auth)

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  audio_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  job_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transcripts
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  content TEXT,
  summary TEXT,
  action_items JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Processing Jobs (tracked in Redis via BullMQ)
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Local development (all services)
npm run dev

# Run specific app
npm run dev:web
npm run dev:api

# Build for production
npm run build

# Run tests
npm run test

# Lint and format
npm run lint
npm run format

# Database migrations
npm run db:generate
npm run db:migrate
npm run db:push

# Docker commands
docker-compose up -d     # Start services
docker-compose down       # Stop services
docker-compose logs -f    # View logs
```

## 🌐 Environment Variables

### Backend (.env.api)
```env
# Server
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Redis (local in Docker, localhost:6379 in dev)
REDIS_URL=redis://localhost:6379

# AI Services (choose one)
OPENAI_API_KEY=xxx
GOOGLE_AI_API_KEY=xxx

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Database (Supabase)
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
```

### Frontend (.env.web)
```env
# API
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## 📦 Key Dependencies

### Backend
- express: Web framework
- socket.io: WebSocket server
- bullmq: Job queue
- drizzle-orm: Database ORM
- @supabase/supabase-js: Supabase client
- openai / @google/generative-ai: AI services
- zod: Schema validation
- multer: File uploads

### Frontend
- react: UI framework
- vite: Build tool
- @tanstack/react-query: Data fetching
- zustand: State management
- socket.io-client: WebSocket client
- @radix-ui/*: UI primitives
- tailwindcss: Styling
- react-dropzone: File uploads

## 🚢 Deployment

### Railway (Backend + Redis)
1. Connect GitHub repo
2. Add Redis service
3. Set environment variables
4. Deploy from Dockerfile

### Vercel (Frontend)
1. Import GitHub repo
2. Set framework preset to Vite
3. Configure environment variables
4. Deploy

### Supabase (Database + Storage + Auth)
1. Create new project
2. Enable Google OAuth
3. Create storage bucket for audio files
4. Apply database migrations

## 🎨 UI/UX Flow

1. **Landing/Login Page**
   - Google OAuth button
   - App description

2. **Dashboard**
   - List of meetings (cards/table)
   - Upload button
   - Filter/search

3. **Upload Modal**
   - Drag-and-drop zone
   - Meeting title input
   - Description (optional)
   - Submit button

4. **Processing View**
   - Real-time progress bar
   - Status messages
   - Cancel option

5. **Meeting Detail**
   - Audio player
   - Transcript tab
   - Summary tab
   - Action items tab
   - Export options

## 📝 API Endpoints

```typescript
// Authentication
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

// Meetings
GET    /api/meetings          // List user's meetings
POST   /api/meetings          // Create meeting
GET    /api/meetings/:id      // Get meeting details
DELETE /api/meetings/:id      // Delete meeting
POST   /api/meetings/:id/upload  // Upload audio file

// Transcripts
GET    /api/meetings/:id/transcript
GET    /api/meetings/:id/summary
GET    /api/meetings/:id/action-items

// WebSocket Events
connect                       // Initial connection
subscribe-meeting            // Subscribe to meeting updates
job-update                   // Processing status updates
```

## 🧪 Testing Strategy

- Unit tests for core functions
- Integration tests for API endpoints
- E2E test for critical user flow (upload -> process -> view)
- Manual testing checklist

## 📊 Performance Considerations

- Limit file size to 100MB
- Process max 2 jobs concurrently
- Cache AI responses
- Implement request rate limiting
- Use CDN for static assets

## 🔒 Security

- Supabase RLS policies
- File type validation
- Rate limiting
- CORS configuration
- Environment variables
- Input sanitization

## 🎯 Success Metrics

- [ ] User can sign in with Google
- [ ] User can upload audio file
- [ ] System processes audio asynchronously
- [ ] Real-time updates show progress
- [ ] Transcript is generated and displayed
- [ ] Summary and action items are extracted
- [ ] User can view all past meetings
- [ ] Application is deployed and accessible

## 🐛 Known Limitations (MVP)

- No real-time recording (upload only)
- Single language support (English)
- No collaboration features
- No email notifications
- Basic error handling
- No speaker diarization

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [BullMQ Guide](https://docs.bullmq.io/)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Railway Deployment](https://docs.railway.app/)
- [Drizzle ORM](https://orm.drizzle.team/)

## 🤝 Development Workflow

1. Create feature branch
2. Implement feature
3. Test locally with Docker
4. Push to GitHub
5. Auto-deploy to staging
6. Test in staging
7. Merge to main
8. Auto-deploy to production

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/meeting-note-taker.git
cd meeting-note-taker

# Install dependencies
npm install

# Start Docker services (Redis)
docker-compose up -d

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development servers
npm run dev

# Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Bull Dashboard: http://localhost:3001/admin/queues
```

## AI Assistant Notes

When implementing this project:

1. **Start with core functionality** - Get the upload->process->display flow working first
2. **Use mock data initially** - Don't wait for AI API keys to start building
3. **Focus on UX** - Real-time updates are key to good user experience
4. **Keep it simple** - Start with MVP features, then add enhancements
5. **Document as you go** - Keep track of decisions and trade-offs
6. **Test the critical path** - Ensure upload->process->view works reliably

Remember: The goal is to build a production-quality application with modern best practices and scalable architecture.