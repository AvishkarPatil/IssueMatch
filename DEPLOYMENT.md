# IssueMatch Deployment Guide

This guide explains how to deploy the IssueMatch application on Render.

## Prerequisites

1. A [Render](https://render.com) account
2. Your code pushed to a GitHub repository
3. Firebase project with credentials
4. Google AI Studio API key

## Deployment Steps

### 1. Deploy Using Render Blueprint

The easiest way to deploy is using Render's Blueprint feature:

1. Push your code to GitHub (including the `render.yaml` file)
2. Log in to your Render dashboard
3. Go to "Blueprints" in the sidebar
4. Click "New Blueprint Instance"
5. Connect your GitHub repository
6. Click "Apply"

Render will automatically create both services defined in your `render.yaml` file.

### 2. Configure Environment Variables

After deployment, you need to set up the following environment variables in the Render dashboard:

#### For Backend Service:

1. Go to your backend service in the Render dashboard
2. Navigate to "Environment" tab
3. Add the following environment variables:
   - `GOOGLE_AI_STUDIO_API_KEY`: Your Gemini API key
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth app client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth app client secret

#### For Frontend Service:

1. Go to your frontend service in the Render dashboard
2. Navigate to "Environment" tab
3. Add the following environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Your Firebase service account key as a JSON string

### 3. Add Firebase Credentials as a Secret File

1. Go to your backend service in the Render dashboard
2. Navigate to "Environment" tab
3. Scroll down to "Secret Files"
4. Add a new secret file:
   - Path: `backend/app/services/keys.json`
   - Contents: Your Firebase service account JSON

### 4. Update GitHub OAuth Callback URL

1. Go to your GitHub OAuth app settings
2. Update the callback URL to point to your deployed backend:
   - `https://your-backend-url.onrender.com/api/v1/auth/callback`

### 5. Update CORS Settings (if needed)

If you encounter CORS issues, you may need to update the CORS settings in your backend code to allow requests from your deployed frontend URL.

## Troubleshooting

### Deployment Fails

- Check the build logs in the Render dashboard
- Ensure all dependencies are correctly specified in `requirements.txt` and `package.json`
- Verify that your `render.yaml` file is correctly formatted

### Authentication Issues

- Check that your GitHub OAuth callback URL is correctly set
- Verify that your Firebase credentials are correctly configured
- Ensure that the `SECRET_KEY` environment variable is set

### API Connection Issues

- Verify that `NEXT_PUBLIC_API_URL` is correctly set to your backend URL
- Check CORS settings in your backend code
- Ensure that your backend service is running correctly

## Monitoring

Render provides built-in logs and metrics for your services. You can access them from the Render dashboard to monitor your application's performance and troubleshoot issues.