# Vercel Deployment Guide

## Prerequisites
- Vercel account
- Supabase project with Google OAuth enabled
- Google Cloud Console project with OAuth 2.0 credentials

---

## Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Make sure to add these for **Production**, **Preview**, and **Development** environments.

---

## Step 2: Configure Google Cloud Console

### 2.1 Get Your Vercel Domain
After deploying, note your production domain (e.g., `your-app.vercel.app`)

### 2.2 Add Authorized Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (the one used by Supabase)
5. Click **Edit**
6. Under **Authorized redirect URIs**, add:
   ```
   https://your-app.vercel.app/auth/v1/callback
   https://your-app.vercel.app/lawyer/dashboard
   ```
   Also add for preview deployments (optional):
   ```
   https://*.vercel.app/auth/v1/callback
   ```

7. Click **Save**

---

## Step 3: Enable Google OAuth in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to enable it
5. You'll need:
   - **Client ID** from Google Cloud Console
   - **Client Secret** from Google Cloud Console
6. Save the configuration

## Step 4: Configure Supabase Redirect URLs

1. In Supabase Dashboard, navigate to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   https://your-app.vercel.app/lawyer/dashboard
   https://your-app.vercel.app/**
   ```
3. Under **Site URL**, set:
   ```
   https://your-app.vercel.app
   ```

---

## Step 5: Update Code (if needed)

The code already uses `window.location.origin` which automatically adapts to your domain, so no code changes needed! ✅

However, if you want to be extra safe, you can verify the redirect URL in `src/pages/lawyer/LawyerLogin.jsx` line 48 uses:
```javascript
redirectTo: `${window.location.origin}/lawyer/dashboard`
```

This will automatically use your Vercel domain in production.

---

## Step 6: Install Dependencies

Before deploying, make sure all dependencies are installed:

```bash
npm install
```

This will install `@supabase/supabase-js` and other required packages.

## Step 7: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B: Using GitHub Integration
1. Push your code to GitHub
2. Import project in Vercel
3. Connect your GitHub repository
4. Vercel will auto-detect settings and deploy

---

## Step 8: Verify Deployment

After deployment:

1. ✅ Check that environment variables are set correctly
2. ✅ Visit your production URL
3. ✅ Test Google OAuth login at `/lawyer/login`
4. ✅ Verify redirect works after Google authentication

---

## Troubleshooting

### Google OAuth not working?
- Check that redirect URIs in Google Console match exactly (including `https://`)
- Verify Supabase redirect URLs include your production domain
- Check browser console for errors

### Environment variables not loading?
- Ensure variables are prefixed with `VITE_` (required for Vite)
- Redeploy after adding new environment variables
- Check Vercel build logs for errors

### Redirect loop?
- Verify `Site URL` in Supabase matches your Vercel domain
- Check that redirect URLs don't have trailing slashes

---

## Additional Notes

- **Preview Deployments**: Each preview branch gets its own URL. You may want to use wildcard redirects or add them individually.
- **Custom Domain**: If you add a custom domain, update all redirect URIs in both Google Console and Supabase.
- **Security**: Never commit `.env` files. Always use Vercel's environment variables.
