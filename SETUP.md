# Setup Guide

Complete setup instructions for running IssueMatch locally.

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- Git
- MongoDB Atlas account (free tier)
- Google AI Studio API key
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
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

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

### 5. Start Backend Server
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
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_AI_API_KEY=your_gemini_api_key
GOOGLE_AI_MODEL=gemini-2.0-flash-lite
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

## MongoDB Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (M0 free tier)

### 2. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database password
5. Add to `backend/.env` as `MONGODB_URI`

### 3. Configure Network Access
1. Network Access → Add IP Address
2. Allow access from anywhere (0.0.0.0/0) for development

### 4. Collections (Auto-created)
These collections are created automatically:
- `users` - User profiles and skills
- `leaderboard` - Contribution rankings
- `mentorship_requests` - Mentor requests
- `referrals` - Referral tracking
- `contributions` - User contributions

---

## Google AI Studio Setup

### 1. Get API Key
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create API key
3. Add to `backend/.env` as `GOOGLE_AI_STUDIO_API_KEY`
4. Add to `frontend/.env.local` as `GOOGLE_AI_API_KEY`

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

**MongoDB connection failed**
- Check connection string format
- Verify IP whitelist in Atlas
- Check username/password

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
- Ensure chatbot variables are set

---

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

---

## Need Help?

- Check [GitHub Issues](https://github.com/AvishkarPatil/IssueMatch/issues)
- Join [Discussions](https://github.com/AvishkarPatil/IssueMatch/discussions)
- Read [Contributing Guide](CONTRIBUTING.md)
