# Quick Deployment Guide - School Registration System

Follow these steps to deploy your system to the cloud.

## ✅ Prerequisites Checklist

- [x] GitHub account (you have this)
- [ ] Git installed on your computer
- [ ] Node.js installed (check: `node --version`)

## 🚀 Step 1: Push Code to GitHub

### 1.1 Initialize Git Repository

Open Terminal and run:

```bash
cd /Users/angelmerpioquinto/Desktop/School/school-registration-system

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - School Registration System"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `school-registration-system`
3. Keep it **Private** (recommended)
4. **DO NOT** initialize with README (we already have code)
5. Click "Create repository"

### 1.3 Push to GitHub

Copy the commands from GitHub (will look like this):

```bash
git remote add origin https://github.com/YOUR-USERNAME/school-registration-system.git
git branch -M main
git push -u origin main
```

✅ **Checkpoint**: Your code is now on GitHub!

---

## 🗄️ Step 2: Deploy Database (Railway)

### 2.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway

### 2.2 Create New Project

1. Click "New Project"
2. Select "Deploy PostgreSQL"
3. Wait for database to provision (~30 seconds)

### 2.3 Get Database URL

1. Click on the PostgreSQL service
2. Go to "Variables" tab
3. Copy the `DATABASE_URL` value
4. **Save this** - you'll need it later!

✅ **Checkpoint**: Database is ready!

---

## 🖥️ Step 3: Deploy Backend (Railway)

### 3.1 Add Backend Service

1. In same Railway project, click "New"
2. Select "GitHub Repo"
3. Choose `school-registration-system`
4. Railway will detect it's a Node.js app

### 3.2 Configure Backend

1. Go to "Settings" tab
2. **Root Directory**: Leave empty (root)
3. **Build Command**: `npm install && npx prisma generate`
4. **Start Command**: `npm start`

### 3.3 Add Environment Variables

1. Click the **Variables** tab in your backend service.
2. Click **Add Variable** for each of these:

```
DATABASE_URL=${DATABASE_URL from PostgreSQL service}
JWT_SECRET=your-super-secret-key-change-this-123456789
STRIPE_SECRET_KEY=sk_test_your_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
PORT=5000
```

### 3.3.1 How to get Cloudinary Keys:

1. Sign up for a free account at [Cloudinary.com](https://cloudinary.com).
2. Log in to your Dashboard.
3. You will see your **Cloud Name**, **API Key**, and **API Secret** right on the home dashboard.
4. Copy and paste those into your Railway variables.

**For now, use placeholder values for these** (we'll set them up later):

```
CLOUDINARY_API_SECRET=placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=placeholder@gmail.com
EMAIL_PASSWORD=placeholder
EMAIL_FROM=School <noreply@school.com>
FRONTEND_URL=https://your-app.vercel.app
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment (~2-3 minutes)
3. Once done, click "Settings" → "Generate Domain"
4. **Copy your backend URL** (e.g., `https://school-registration-production.up.railway.app`)

### 3.5 Run Database Migration

1. In Railway, click on your backend service
2. Click "Settings" → "Deploy" → "Custom Start Command"
3. Temporarily change to: `npx prisma migrate deploy && npm start`
4. Redeploy
5. After successful deployment, change back to: `npm start`

✅ **Checkpoint**: Backend is live!

---

## 🌐 Step 4: Deploy Frontend (Vercel)

### 4.1 Create Vercel Account

1. Go to [vercel.com/signup](https://vercel.com/signup)
2. Click "Continue with GitHub"
3. Authorize Vercel

### 4.2 Import Project

1. Click "Add New" → "Project"
2. Import `school-registration-system` repository
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `frontend`
5. Click "Edit" next to "Root Directory" and select `frontend`

### 4.3 Add Environment Variables

Before deploying, add these:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
```

Replace `your-backend-url.railway.app` with your actual Railway backend URL!

### 4.4 Deploy

1. Click "Deploy"
2. Wait for build (~2-3 minutes)
3. Once done, you'll get a URL like: `https://school-registration-system.vercel.app`

✅ **Checkpoint**: Frontend is live!

---

## 🔗 Step 5: Connect Frontend & Backend

### 5.1 Update Backend CORS

1. Go back to Railway
2. Click on backend service
3. Update `FRONTEND_URL` variable to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Redeploy backend

### 5.2 Test Connection

1. Visit your Vercel URL
2. Try to register a new student
3. If it works, you're connected! 🎉

---

## 🔧 Step 6: Set Up Cloud Services (Optional but Recommended)

### 6.1 Cloudinary (File Uploads)

1. Go to [cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up
3. From Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
4. Update in Railway backend variables:
   ```
   CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
   CLOUDINARY_API_KEY=your-actual-key
   CLOUDINARY_API_SECRET=your-actual-secret
   ```

### 6.2 Stripe (Payments)

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get test keys from Dashboard → Developers → API keys
4. Update in Railway backend:
   ```
   STRIPE_SECRET_KEY=sk_test_your_actual_key
   ```
5. Update in Vercel frontend:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
   ```

### 6.3 Gmail (Email Notifications)

1. Enable 2FA on your Gmail account
2. Generate App Password: Google Account → Security → App passwords
3. Update in Railway backend:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

---

## 🎯 Step 7: Create Admin Account

### 7.1 Access Railway Database

1. In Railway, click PostgreSQL service
2. Click "Data" tab
3. Run this SQL:

```sql
INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@school.com',
  '$2b$10$YourHashedPasswordHere',
  'ADMIN',
  NOW(),
  NOW()
);
```

**Note**: You need to hash the password first. Use an online bcrypt generator or run locally.

### 7.2 Alternative: Use Prisma Studio Locally

```bash
# On your computer
cd /Users/angelmerpioquinto/Desktop/School/school-registration-system
npm install
npx prisma studio
```

Then create admin user through the UI.

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Database deployed on Railway
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] Cloudinary set up (for file uploads)
- [ ] Stripe set up (for payments)
- [ ] Gmail set up (for emails)
- [ ] Admin account created
- [ ] Tested registration flow

---

## 🎉 Your System is Live!

**Frontend URL**: `https://your-app.vercel.app`  
**Backend URL**: `https://your-api.railway.app`

Students can now:

- Register online
- Upload documents
- Make payments
- Track their status

Admins can:

- Review registrations
- Approve/reject students
- View payment reports

---

## 🆘 Troubleshooting

### "Cannot connect to backend"

- Check CORS settings in backend
- Verify `FRONTEND_URL` in Railway matches Vercel URL

### "Database connection failed"

- Verify `DATABASE_URL` in Railway backend
- Check if PostgreSQL service is running

### "File upload not working"

- Verify Cloudinary credentials
- Check file size limits

### "Payment failing"

- Use Stripe test card: 4242 4242 4242 4242
- Verify Stripe keys are correct

---

## 📞 Need Help?

If you get stuck on any step, let me know which step and what error you're seeing!
