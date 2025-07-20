# IssueMatch - Setup Instructions

This document provides instructions for setting up and running the IssueMatch platform with the new features.

## Prerequisites

- Python 3.9+
- Node.js 18+
- Firebase project
- Google AI Studio API key (for Gemini API)

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with the following variables:
```
FIREBASE_CREDENTIALS_PATH=path/to/your/firebase-credentials.json
GOOGLE_AI_STUDIO_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key_for_session_middleware
```

5. Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory with the following variables:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start the frontend server:
```bash
npm run dev
```

## Firebase Setup

1. Create the following collections in your Firebase Firestore database:
   - `leaderboard_scores`
   - `referrals`
   - `mentors`
   - `mentorship_requests`

2. Add the following security rules to your Firestore database:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard_scores/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /referrals/{document} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.referrerId || request.auth.uid == resource.data.referredUserId);
      allow write: if request.auth != null;
    }
    match /mentors/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /mentorship_requests/{document} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.requesterId || request.auth.uid == resource.data.mentorId);
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

If you encounter any issues with the backend server, check the following:

1. Make sure your Firebase credentials are correctly set up
2. Ensure you have the correct Google AI Studio API key
3. Check that all required dependencies are installed

For frontend issues:

1. Make sure you have the latest version of Node.js
2. Clear your browser cache
3. Check the browser console for any errors

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)