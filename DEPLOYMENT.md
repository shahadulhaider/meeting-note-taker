# Deployment Guide - Meeting Note Taker

## Prerequisites

- GitHub account
- Supabase project with Google OAuth configured
- Railway account (for backend)
- Vercel account (for frontend)
- AI API keys (OpenAI or Google AI)

## 🔧 Environment Setup

### Required Environment Variables

#### Backend (Railway)
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379 # Local in Docker
OPENAI_API_KEY=your-key # Optional
GOOGLE_AI_API_KEY=your-key # Optional
FRONTEND_URL=https://your-app.vercel.app
SESSION_SECRET=your-secret-key
```

#### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.railway.app
VITE_WS_URL=wss://your-backend.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📦 Supabase Setup

### 1. Enable Google OAuth

1. Go to Authentication → Providers in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Set redirect URL: `https://your-app.vercel.app`

### 2. Run Database Migrations

Execute in SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS "meetings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "audio_url" text,
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "job_id" varchar(255),
  "duration" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "transcripts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "meeting_id" uuid NOT NULL,
  "content" text NOT NULL,
  "summary" text,
  "action_items" jsonb,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_meeting_id_meetings_id_fk" 
FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE cascade;
```

### 3. Create Storage Bucket

1. Go to Storage in Supabase
2. Create bucket: `meeting-records`
3. Set to private (for signed URLs)

## 🚂 Backend Deployment (Railway)

### Method 1: GitHub Integration

1. Push code to GitHub
2. Go to [Railway](https://railway.app)
3. Create new project → Deploy from GitHub repo
4. Select your repository
5. Railway will auto-detect Dockerfile
6. Add environment variables in Settings
7. Deploy

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project (optional)
railway link

# Deploy
railway up
```

### Post-Deployment

- Note your backend URL: `https://your-app.railway.app`
- Check health: `https://your-app.railway.app/health`

## 🎨 Frontend Deployment (Vercel)

### Method 1: Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Import Git Repository
3. Select your repository
4. Configure:
   - Framework Preset: `Vite`
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
5. Add environment variables
6. Deploy

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd apps/web

# Deploy
vercel

# Follow prompts
# Set root directory to apps/web
```

## 🚀 Quick Deploy Commands

### Local Testing
```bash
# Start all services
docker-compose up -d  # Redis
pnpm dev             # Frontend + Backend

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### Production Build
```bash
# Build all packages
pnpm build

# Build Docker image
docker build -t meeting-note-taker .

# Run Docker container
docker run -p 3001:3001 --env-file .env meeting-note-taker
```

## 🔍 Verification Checklist

### Backend
- [ ] Health endpoint returns OK
- [ ] WebSocket connection works
- [ ] File upload to Supabase Storage works
- [ ] Database queries execute properly
- [ ] BullMQ processes jobs
- [ ] AI APIs respond (check logs)

### Frontend
- [ ] Google OAuth login works
- [ ] Dashboard loads meetings
- [ ] File upload works
- [ ] Real-time updates display
- [ ] Meeting details show transcript/summary

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Errors
- Verify Supabase URL and keys
- Check CORS settings
- Ensure redirect URLs are correct

#### 2. WebSocket Connection Failed
- Use `wss://` for production (not `ws://`)
- Check Railway supports WebSocket
- Verify CORS allows WebSocket origin

#### 3. File Upload Fails
- Check Supabase Storage bucket exists
- Verify service key has storage permissions
- Check file size limits (100MB)

#### 4. AI Processing Fails
- Verify API keys are valid
- Check API rate limits
- Review error logs in Railway

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check Redis connection
redis-cli ping

# Test API health
curl https://your-backend.railway.app/health

# Check Vercel build logs
vercel logs
```

## 📱 Mobile Considerations

The app is responsive but for optimal mobile experience:
- Test on actual devices
- Consider PWA features
- Add viewport meta tags
- Test file upload on mobile browsers

## 🔒 Security Notes

- Never commit `.env` files
- Use strong session secrets
- Enable Supabase RLS policies
- Implement rate limiting
- Use HTTPS everywhere
- Sanitize file uploads

## 📈 Monitoring

### Recommended Services
- Railway Metrics (built-in)
- Vercel Analytics (built-in)
- Supabase Dashboard
- External: Sentry, LogRocket

## 🎯 Performance Optimization

1. Enable caching headers
2. Use CDN for static assets
3. Optimize images
4. Enable gzip compression
5. Use database indexes
6. Implement request batching

## 💰 Cost Estimates (Free Tier)

- **Supabase**: Free tier includes 500MB database, 1GB storage
- **Railway**: $5 free credit/month
- **Vercel**: Free for personal projects
- **Redis**: Included in Railway container
- **AI APIs**: Pay as you go

Total: **$0-5/month** for small-scale usage

## 📝 Next Steps

1. Set up custom domain
2. Add monitoring/analytics
3. Implement backup strategy
4. Add more AI providers
5. Enhance security policies
6. Create staging environment

---

For support, check the [README](./README.md) or open an issue on GitHub.