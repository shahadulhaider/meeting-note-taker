# Deployment Guide - Render (Free Tier)

## 🚀 Deploy Backend to Render

### Step 1: Push to GitHub First

```bash
git init
git add .
git commit -m "Initial commit: Meeting Note Taker"
git remote add origin git@github.com:shahadulhaider/meeting-note-taker.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub for easy integration

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `shahadulhaider/meeting-note-taker`

3. **Configure Service**
   ```
   Name: meeting-note-taker-api
   Region: Choose nearest to you
   Branch: main
   Runtime: Docker
   Instance Type: Free
   ```

4. **Add Environment Variables**
   Click "Advanced" and add:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[Your Supabase Pooler URL]
   SUPABASE_URL=[Your Supabase URL]
   SUPABASE_ANON_KEY=[Your Anon Key]
   SUPABASE_SERVICE_KEY=[Your Service Key]
   CORS_ORIGIN=https://your-app.vercel.app
   OPENAI_API_KEY=[Your OpenAI Key]
   GOOGLE_AI_KEY=[Your Google AI Key]
   ```

5. **Add Redis** (Separate Service)
   - Go to Dashboard → "New +" → "Redis"
   - Name: `meeting-redis`
   - Choose Free plan (25 MB)
   - Copy the Internal Redis URL

6. **Update Backend Service**
   - Add Redis URL to environment variables:
   ```
   REDIS_URL=[Internal Redis URL from step 5]
   ```

7. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your URL: `https://meeting-note-taker-api.onrender.com`

### Step 3: Deploy Frontend to Vercel

Same as before:

1. Go to [vercel.com](https://vercel.com)
2. Import repository
3. Configure:
   ```
   Root Directory: apps/web
   Build Command: cd ../.. && pnpm --filter web build
   Output Directory: dist
   ```
4. Add environment variables:
   ```
   VITE_API_URL=https://meeting-note-taker-api.onrender.com
   VITE_SUPABASE_URL=[Your Supabase URL]
   VITE_SUPABASE_ANON_KEY=[Your Anon Key]
   ```

### Step 4: Update CORS

1. Go back to Render Dashboard
2. Update `CORS_ORIGIN` with your Vercel URL
3. Redeploy by clicking "Manual Deploy" → "Deploy latest commit"

## ⚠️ Important Notes for Render Free Tier

1. **Spin Down**: Free services spin down after 15 minutes of inactivity
   - First request after inactivity takes 30-60 seconds
   - Consider using a keep-alive service

2. **Limits**:
   - 750 hours/month (enough for one service running 24/7)
   - 512 MB RAM
   - Shared CPU

3. **Redis**: 25 MB free tier is enough for development

## 🔍 Alternative: Deploy Everything to Vercel

If Render doesn't work, you can deploy the backend as Vercel Functions:

### Quick Vercel API Setup

1. Create `/api` folder in frontend
2. Move backend routes to Vercel functions
3. Use Upstash Redis (free 10,000 commands/day)
4. Single deployment, no CORS issues

Would you like me to help set up the Vercel Functions approach instead?

## 🎯 Quick Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Status Page: https://status.render.com

## Troubleshooting

**Service won't start**: Check logs in Render dashboard
**Redis connection failed**: Use Internal URL, not External
**CORS errors**: Ensure CORS_ORIGIN matches exactly (no trailing slash)