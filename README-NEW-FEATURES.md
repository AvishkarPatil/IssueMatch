# IssueMatch - New Features Setup

This document provides instructions for setting up and running the new features added to the IssueMatch platform.

## Credential Setup

### 1. Firebase Credentials

Replace the placeholder values in `backend/app/services/keys.json` with your actual Firebase service account credentials:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account-email@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email%40your-project-id.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

### 2. Backend Environment Variables

Update the values in `backend/.env`:

```
FIREBASE_CREDENTIALS_PATH=app/services/keys.json
GOOGLE_AI_STUDIO_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_for_session_middleware
```

To get a Gemini API key:
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Create an account or sign in
3. Navigate to "API Keys" and create a new key
4. Copy the key and paste it in the `.env` file

### 3. Frontend Environment Variables

Update the values in `frontend/.env.local`:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
```

The `FIREBASE_SERVICE_ACCOUNT_KEY` should be the same as your `keys.json` file, but as a single line JSON string.

## Running the Application

### Backend

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the frontend server:
```bash
npm run dev
```

## Troubleshooting

### "Not Found" Error for Pages

If you see a "Not Found" error for pages like `/skills`, `/leaderboard`, etc., make sure:

1. The page file exists in the correct location (e.g., `frontend/app/skills/page.tsx`)
2. The navigation links in the navbar are pointing to the correct routes
3. The Next.js server is running properly

### Firebase Authentication Issues

If you're having issues with Firebase authentication:

1. Make sure your Firebase project has Authentication enabled with GitHub as a provider
2. Check that your service account has the necessary permissions
3. Verify that your Firebase configuration in the frontend matches your Firebase project

### Gemini API Issues

If the Mentor Hub feature is not working properly:

1. Make sure your Gemini API key is valid and has not expired
2. Check that you're using the correct model name in the code (`gemini-2.0-flash-lite`)
3. Verify that you have sufficient quota for the Gemini API

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)