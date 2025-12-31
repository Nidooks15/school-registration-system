# Deployment Guide

This guide covers deploying the Online School Registration System to production.

## 🌐 Deployment Options

### Option 1: Vercel + Railway (Recommended)

**Frontend**: Vercel  
**Backend**: Railway  
**Database**: Railway PostgreSQL

### Option 2: Vercel + Render

**Frontend**: Vercel  
**Backend**: Render  
**Database**: Render PostgreSQL

### Option 3: All-in-One (Render)

**Frontend + Backend**: Render  
**Database**: Render PostgreSQL

## 📦 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Cloudinary account set up
- [ ] Stripe account configured (production keys)
- [ ] Gmail app password generated
- [ ] Database backup created
- [ ] Domain name ready (optional)

## 🚀 Frontend Deployment (Vercel)

### 1. Prepare Frontend

```bash
cd frontend

# Build to check for errors
npm run build
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Configure Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

### 4. Alternative: Deploy via GitHub

1. Push code to GitHub
2. Import repository in Vercel
3. Configure environment variables
4. Deploy

## 🖥️ Backend Deployment (Railway)

### 1. Prepare Backend

```bash
# Add start script to package.json
{
  "scripts": {
    "start": "node server.js",
    "build": "prisma generate"
  }
}
```

### 2. Deploy to Railway

1. Visit [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub or CLI

### 3. Configure Environment Variables

In Railway Dashboard, add all variables from `.env.example`:

```
DATABASE_URL=${RAILWAY_PROVIDED_URL}
JWT_SECRET=your-production-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=sk_live_your_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=School Registration <noreply@school.com>
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 4. Run Migrations

In Railway, run:

```bash
npx prisma migrate deploy
```

## 🖥️ Backend Deployment (Render)

### 1. Create Render Account

Visit [render.com](https://render.com) and sign up

### 2. Create PostgreSQL Database

1. New → PostgreSQL
2. Name: `school-registration-db`
3. Copy the Internal Database URL

### 3. Create Web Service

1. New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: school-registration-api
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

### 4. Add Environment Variables

Add all variables from `.env.example` using the Render dashboard

### 5. Deploy

Render will automatically deploy on push to main branch

## 🗄️ Database Setup

### Railway PostgreSQL

1. Database is automatically provisioned
2. Connection string available in environment variables
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Render PostgreSQL

1. Create database instance
2. Copy Internal Database URL
3. Add to backend environment variables
4. Run migrations via Render shell

### Supabase (Alternative)

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Format: `postgresql://postgres:[password]@[host]:5432/postgres`
4. Add to environment variables

## 🔐 Production Security

### 1. Update CORS Settings

In `server.js`:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

### 2. Secure JWT Secret

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Enable HTTPS

Both Vercel and Railway/Render provide automatic HTTPS

### 4. Rate Limiting (Optional)

Install and configure:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/", limiter);
```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
3. Use app password in `EMAIL_PASSWORD`

### SendGrid (Alternative)

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Get API key
3. Update email configuration in `utils/email.js`

## 💳 Stripe Production Setup

### 1. Activate Stripe Account

Complete business verification at [stripe.com](https://stripe.com)

### 2. Get Production Keys

Dashboard → Developers → API keys

### 3. Update Environment Variables

```
STRIPE_SECRET_KEY=sk_live_your_production_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
```

### 4. Configure Webhooks (Optional)

For payment confirmations:

1. Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`

## 🌍 Custom Domain Setup

### Vercel

1. Domain Settings → Add Domain
2. Configure DNS records
3. Automatic SSL certificate

### Railway/Render

1. Settings → Custom Domain
2. Add CNAME record pointing to provided URL
3. SSL automatically provisioned

## 📊 Monitoring & Logging

### Vercel Analytics

Enable in Vercel Dashboard → Analytics

### Railway Logs

View in Railway Dashboard → Deployments → Logs

### Error Tracking (Optional)

Integrate Sentry:

```bash
npm install @sentry/node @sentry/nextjs
```

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm run build
```

## 🧪 Testing Production

### 1. Test Registration Flow

1. Create test student account
2. Upload documents
3. Make test payment (use Stripe test cards)
4. Verify email notifications

### 2. Test Admin Functions

1. Login as admin
2. Review student registration
3. Approve/reject
4. Check payment reports

### 3. Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

## 📱 Mobile Optimization

The app is responsive by default. Test on:

- iOS Safari
- Android Chrome
- Various screen sizes

## 🔧 Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf node_modules .next
npm install
npm run build
```

### Database Connection Issues

- Verify DATABASE_URL format
- Check firewall settings
- Ensure database is running

### CORS Errors

- Verify FRONTEND_URL in backend
- Check CORS configuration
- Ensure HTTPS on both ends

## 📈 Performance Optimization

### Frontend

- Enable Next.js Image Optimization
- Implement lazy loading
- Use CDN for static assets

### Backend

- Add database indexes
- Implement caching (Redis)
- Optimize Prisma queries

## 🔄 Updates & Maintenance

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Deploy to production
npx prisma migrate deploy
```

### Rolling Updates

Both Vercel and Railway support zero-downtime deployments

## 📞 Support

For deployment issues:

- Vercel: [vercel.com/support](https://vercel.com/support)
- Railway: [railway.app/help](https://railway.app/help)
- Render: [render.com/docs](https://render.com/docs)

## ✅ Post-Deployment

- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Set up backups
- [ ] Configure monitoring alerts
- [ ] Update documentation
- [ ] Train admin users

---

**Congratulations!** Your School Registration System is now live! 🎉
