# Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Push to GitHub

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Meeting Note Taker - Fireflies.ai Clone"

# Create a new repository on GitHub and push
git remote add origin git@github.com:shahadulhaider/meeting-note-taker.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Railway

1. **Create Railway Account & Project**
   - Go to [railway.app](https://railway.app)
   - Create a new project
   - Choose "Deploy from GitHub repo"

2. **Add Redis Service**
   - Click "New Service"
   - Select "Redis"
   - Note the REDIS_URL

3. **Configure Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<your-supabase-pooler-url>
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_KEY=<your-service-key>
   REDIS_URL=<from-railway-redis>
   CORS_ORIGIN=https://your-app.vercel.app
   OPENAI_API_KEY=<your-key>
   GOOGLE_AI_KEY=<your-key>
   ```

4. **Deploy**
   - Railway will automatically detect the Dockerfile
   - Deploy will start automatically
   - Note your backend URL (e.g., `https://your-app.up.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the repository

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm --filter web build`
   - Output Directory: `dist`
   - Install Command: `cd ../.. && pnpm install`

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend.up.railway.app
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your frontend URL

### Step 4: Update CORS Origin

After deploying frontend:
1. Go back to Railway
2. Update `CORS_ORIGIN` environment variable with your Vercel URL
3. Redeploy backend

### Step 5: Configure Supabase

1. **Update Redirect URLs**
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Add your production URLs:
     - Site URL: `https://your-app.vercel.app`
     - Redirect URLs: `https://your-app.vercel.app/auth/callback`

2. **Update RLS Policies** (if needed)
   - Ensure your storage bucket policies allow authenticated access

## 🔍 Verification Steps

1. **Test Authentication**
   - Visit your Vercel URL
   - Click "Sign in with Google"
   - Verify redirect and login works

2. **Test Upload**
   - Create a new meeting
   - Upload an audio file
   - Verify processing starts

3. **Check Logs**
   - Railway: Check service logs for backend
   - Vercel: Check function logs
   - Supabase: Check logs tab

## 🐛 Common Issues & Solutions

### Backend Issues

**Issue**: "Cannot connect to database"
- Solution: Ensure you're using the Supabase pooler URL (not direct connection)

**Issue**: "CORS error"
- Solution: Update CORS_ORIGIN in Railway to match your Vercel URL

**Issue**: "Redis connection failed"
- Solution: Check REDIS_URL is correctly set from Railway Redis service

### Frontend Issues

**Issue**: "API calls failing"
- Solution: Verify VITE_API_URL points to your Railway backend

**Issue**: "Authentication not working"
- Solution: Check Supabase redirect URLs include your production domain

### Deployment Issues

**Issue**: "Build failing on Vercel"
- Solution: Ensure pnpm-lock.yaml is committed

**Issue**: "Docker build failing on Railway"
- Solution: Check Dockerfile paths and ensure all files are committed

## 📊 Monitoring

### Railway
- View logs: Dashboard > Service > Logs
- Monitor usage: Dashboard > Service > Metrics
- Set up alerts for failures

### Vercel
- View logs: Dashboard > Functions > Logs
- Monitor performance: Dashboard > Analytics
- Set up error tracking

### Supabase
- Monitor database: Dashboard > Database > Query Performance
- Check storage: Dashboard > Storage > Usage
- Review auth logs: Dashboard > Authentication > Logs

## 🔄 Updating Production

### Backend Updates
```bash
git add .
git commit -m "Update: description"
git push origin main
# Railway auto-deploys from main branch
```

### Frontend Updates
```bash
git add .
git commit -m "Update: description"
git push origin main
# Vercel auto-deploys from main branch
```

## 🎯 Production Checklist

- [ ] All environment variables set correctly
- [ ] Database migrations run successfully
- [ ] Storage bucket configured
- [ ] OAuth redirect URLs updated
- [ ] CORS origins configured
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Error tracking configured
- [ ] Logs accessible
- [ ] Backups configured

## 📝 Notes

- Railway provides automatic SSL certificates
- Vercel provides automatic SSL certificates
- Both platforms support automatic deployments from GitHub
- Consider setting up staging environments for testing
- Enable Vercel Analytics for frontend monitoring
- Set up database backups in Supabase