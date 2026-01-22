# Email Notification Setup Guide

## Prerequisites
- Gmail account with App Password enabled
- Vercel deployment (for serverless functions)

## Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
EMAIL_USER=manasparwani397@gmail.com
EMAIL_PASSWORD=cfun kbct fclz ujsa
```

**Important:** Make sure to add these for **Production**, **Preview**, and **Development** environments.

## Step 2: Install Dependencies

Run this command in your project root:

```bash
npm install nodemailer
```

## Step 3: Deploy to Vercel

After adding the environment variables and installing dependencies, deploy your project:

```bash
git add .
git commit -m "Add email notification functionality"
git push
```

Vercel will automatically detect the changes and deploy.

## How It Works

1. When a notification is created in `/lawyer/dashboard`, the system:
   - Fetches all emails from the `email_database` table for the current user
   - Sends an email to each recipient using nodemailer
   - Uses Gmail SMTP with the provided credentials

2. The email includes:
   - Notification title
   - Notification details
   - Recipient type (if selected)
   - Number of applicants (if provided)

## Testing

1. Add some emails to your database via `/lawyer/dashboard/settings`
2. Create a notification via the "Create Notification" button
3. Check the email inboxes of the recipients

## Troubleshooting

### Emails not sending
- Verify environment variables are set correctly in Vercel
- Check Vercel function logs for errors
- Ensure Gmail App Password is correct and enabled

### "No Emails Found" error
- Make sure you've added emails to the database first
- Verify you're logged in as the correct user

### API endpoint not found
- Ensure the `api/send-notification.js` file exists
- Check that Vercel has deployed the latest version
- Verify the API route is accessible at `/api/send-notification`
