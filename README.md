# Meeting Note Taker - Fireflies.ai Clone

A simplified replica of Fireflies.ai that provides meeting transcription, summarization, and action item extraction from audio recordings.

## 🚀 Features

- **Google OAuth Authentication** - Secure login with Google accounts
- **Audio Upload & Processing** - Upload meeting recordings for automatic processing
- **AI-Powered Transcription** - Convert audio to text using OpenAI Whisper or Google Gemini
- **Smart Summarization** - Generate concise meeting summaries using AI
- **Action Items Extraction** - Automatically identify and extract action items from meetings
- **Real-time Updates** - WebSocket-based progress tracking during processing
- **Export Functionality** - Download transcripts as text files

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Shadcn UI components
- React Query for data fetching
- Socket.io client for real-time updates
- React Router for navigation

### Backend
- Express.js with TypeScript
- BullMQ for job queue management
- Socket.io for WebSocket connections
- Drizzle ORM for database operations
- OpenAI API for transcription
- Google Gemini API as fallback

### Infrastructure
- Supabase for authentication, database (PostgreSQL), and file storage
- Redis for job queue (via Docker locally)
- Turborepo for monorepo management
- pnpm for package management

## 📋 Prerequisites

- Node.js 18+ 
- pnpm 8+
- Docker and Docker Compose
- Supabase account
- OpenAI API key
- Google AI API key

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd meeting-note-taker
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

#### Backend (.env file in apps/api/)
```env
# Server
PORT=3001
NODE_ENV=development

# Database (Supabase)
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/postgres"

# Supabase
SUPABASE_URL="https://[project-id].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"

# Redis
REDIS_URL="redis://localhost:6379"

# CORS
CORS_ORIGIN="http://localhost:5173"

# AI Services
OPENAI_API_KEY="your-openai-key"
GOOGLE_AI_KEY="your-gemini-key"
```

#### Frontend (.env file in apps/web/)
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL="https://[project-id].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Database Setup

#### Run Migrations
```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
```

### 5. Supabase Configuration

1. Create a new Supabase project
2. Enable Google OAuth in Authentication settings
3. Create a storage bucket named `meeting-records`
4. Set the bucket to private (authenticated access only)

### 6. Start Services

#### Start Redis (using Docker)
```bash
docker-compose up -d
```

#### Start Development Servers
```bash
# From root directory
pnpm dev

# Or start individually:
# Backend
pnpm --filter api dev

# Frontend  
pnpm --filter web dev
```

## 🌐 Accessing the Application

- Frontend: http://localhost:5173 (or http://localhost:5174)
- Backend API: http://localhost:3001
- Redis: localhost:6379

## 📦 Deployment

### Backend Deployment (Railway)

1. Create a Railway project
2. Add Redis service
3. Deploy using Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build
CMD ["pnpm", "--filter", "api", "start"]
```
4. Set environment variables in Railway dashboard

### Frontend Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `pnpm --filter web build`
   - Output Directory: `apps/web/dist`
3. Add environment variables in Vercel dashboard

## 🏗 Architecture Overview

```
meeting-note-taker/
├── apps/
│   ├── api/          # Express backend
│   │   ├── src/
│   │   │   ├── routes/     # API endpoints
│   │   │   ├── services/   # Business logic
│   │   │   ├── workers/    # Background jobs
│   │   │   └── db/         # Database schema
│   │   └── package.json
│   │
│   └── web/          # React frontend
│       ├── src/
│       │   ├── pages/      # Route pages
│       │   ├── components/ # UI components
│       │   ├── services/   # API client
│       │   └── hooks/      # Custom hooks
│       └── package.json
│
├── packages/
│   └── shared/       # Shared types
│
└── docker-compose.yml
```

## 🔄 Processing Flow

1. User uploads audio file via web interface
2. File is stored in Supabase Storage
3. Backend creates a BullMQ job for processing
4. Worker processes the audio:
   - Downloads from Supabase
   - Transcribes using OpenAI Whisper
   - Falls back to Gemini if Whisper fails
   - Generates summary using AI
   - Extracts action items
5. Real-time updates sent via WebSocket
6. Results stored in PostgreSQL database
7. UI updates to show completed transcription

## 🧪 Testing the Application

1. Sign in with Google OAuth
2. Click "New Meeting" 
3. Enter meeting details
4. Upload an audio file (MP3, WAV, M4A)
5. Watch real-time processing progress
6. View transcript, summary, and action items
7. Export transcript as text file

## 📝 API Endpoints

- `POST /api/auth/login` - Google OAuth login
- `GET /api/meetings` - List user meetings  
- `POST /api/meetings` - Create new meeting
- `POST /api/meetings/:id/upload` - Upload audio file
- `GET /api/meetings/:id` - Get meeting details
- `DELETE /api/meetings/:id` - Delete meeting

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure frontend URL is in CORS whitelist
2. **Database Connection**: Check DATABASE_URL format (use pooler URL)
3. **Audio Upload Fails**: Verify Supabase storage bucket permissions
4. **No Action Items**: Check AI API keys are correctly set
5. **Port Already in Use**: Kill existing processes or change ports

### Logs

- Backend logs: Check terminal running `pnpm --filter api dev`
- Worker logs: Look for BullMQ job processing messages
- Frontend console: Browser developer tools

## 📄 License

MIT

## 👥 Author

Created as a technical assessment project demonstrating full-stack development capabilities with modern web technologies.