# Setup Guide

Complete setup instructions for running IssueMatch locally.

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- Git
- Firebase account
- Google Cloud account (for AI APIs)
- GitHub OAuth app

---

## Backend Setup

### 1. Navigate to Backend
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
# Firebase
FIREBASE_CREDENTIALS_PATH=app/services/keys.json

# Google AI
GOOGLE_AI_STUDIO_API_KEY=your_gemini_api_key

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Security
SECRET_KEY=your_secret_key_for_sessions

# API Configuration
PROJECT_NAME="IssueMatch"
API_V1_STR="/api/v1"
```

### 5. Add Firebase Credentials

Place your Firebase service account JSON file at:
```
backend/app/services/keys.json
```

### 6. Start Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000

---

## Frontend Setup

### 1. Navigate to Frontend
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Start Development Server
```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## GitHub OAuth Setup

### 1. Create OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - **Application name**: IssueMatch Local
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:8000/api/v1/auth/callback
4. Click "Register application"

### 2. Get Credentials
- Copy **Client ID** and **Client Secret**
- Add them to `backend/.env`

---

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Firestore Database

### 2. Get Configuration
1. Project Settings → General → Your apps
2. Add web app
3. Copy configuration values to `frontend/.env.local`

### 3. Get Service Account
1. Project Settings → Service accounts
2. Generate new private key
3. Save as `backend/app/services/keys.json`

### 4. Create Collections
Create these Firestore collections:
- `users`
- `leaderboard_scores`
- `mentors`
- `referrals`

---

## Google Cloud AI Setup

### 1. Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable these APIs:
   - Cloud Natural Language API
   - Vertex AI API

### 2. Get API Key
1. APIs & Services → Credentials
2. Create API key
3. Add to `backend/.env` as `GOOGLE_AI_STUDIO_API_KEY`

---

## Verification

### Backend Health Check
```bash
curl http://localhost:8000/
```

Expected response:
```json
{"message": "Welcome to IssueMatch API"}
```

### Frontend Check
Open http://localhost:3000 in browser

---

## Troubleshooting

### Backend Issues

**Import errors**
```bash
pip install -r requirements.txt --upgrade
```

**Firebase connection failed**
- Check `keys.json` path
- Verify Firebase credentials

**GitHub OAuth not working**
- Verify callback URL matches exactly
- Check client ID and secret

### Frontend Issues

**Module not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Environment variables not loading**
- Restart dev server after changing `.env.local`
- Ensure variables start with `NEXT_PUBLIC_`

**Build errors**
```bash
npm run build
```

---

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

---

## Need Help?

- Check [GitHub Issues](https://github.com/AvishkarPatil/IssueMatch/issues)
- Join [Discussions](https://github.com/AvishkarPatil/IssueMatch/discussions)
- Read [Contributing Guide](CONTRIBUTING.md)
