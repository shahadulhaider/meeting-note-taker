# Meeting Note Taker

A modern meeting transcription and analysis application that provides automatic transcription, AI-powered summarization, and action item extraction from audio recordings.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/meeting-note-taker.git
cd meeting-note-taker

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase and AI API credentials

# Start Docker services (Redis for local development)
docker-compose up -d

# Run development servers
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
# Bull Dashboard: http://localhost:3001/admin/queues
```

## 🎯 Features

- **Google OAuth Authentication** - Secure login via Supabase
- **Audio Upload** - Support for MP3, WAV, and WebM formats
- **Automatic Transcription** - Using OpenAI Whisper or Google Gemini
- **AI-Powered Summary** - Intelligent meeting summaries
- **Action Items Extraction** - Automatic identification of tasks
- **Real-time Processing Updates** - WebSocket-based progress tracking
- **Meeting Management** - Create, view, and manage all your meetings

## 🏗️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for blazing fast builds
- TailwindCSS + Shadcn UI for beautiful components
- Zustand for state management
- React Query for data fetching
- Socket.io client for real-time updates

### Backend
- Express.js with TypeScript
- BullMQ for job queue management
- Redis for queue storage
- Socket.io for WebSocket connections
- Drizzle ORM for database operations
- Zod for validation

### Infrastructure
- Supabase for Authentication, Database, and Storage
- Docker for containerization
- Railway for backend deployment
- Vercel for frontend deployment

## 📁 Project Structure

```
meeting-note-taker/
├── apps/
│   ├── web/          # Frontend application
│   └── api/          # Backend API server
├── packages/
│   └── shared/       # Shared types and utilities
├── docker-compose.yml
└── turbo.json
```

## 🔧 Environment Variables

Create `.env` files in both `apps/web` and `apps/api`:

### Backend (apps/api/.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=xxx
FRONTEND_URL=http://localhost:5173
```

### Frontend (apps/web/.env)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - Login with Google
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Meetings
- `GET /api/meetings` - List all meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/:id` - Get meeting details
- `POST /api/meetings/:id/upload` - Upload audio file
- `DELETE /api/meetings/:id` - Delete meeting

### WebSocket Events
- `connection` - Initial connection
- `subscribe-meeting` - Subscribe to meeting updates
- `job-update` - Processing status updates

## 🚢 Deployment

### Backend (Railway)
1. Push to GitHub
2. Connect Railway to your repository
3. Add Redis database
4. Configure environment variables
5. Deploy using Dockerfile

### Frontend (Vercel)
1. Import GitHub repository
2. Configure build settings for Vite
3. Add environment variables
4. Deploy

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 📊 Performance

- Maximum file size: 100MB
- Concurrent processing: 2 jobs
- Supported formats: MP3, WAV, WebM
- Processing time: ~2-5 minutes per 30-minute audio

## 🔒 Security

- Google OAuth for authentication
- Supabase Row Level Security
- File type validation
- Rate limiting on API endpoints
- Secure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- UI components from [Shadcn UI](https://ui.shadcn.com)
- Deployed on [Railway](https://railway.app) and [Vercel](https://vercel.com)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.