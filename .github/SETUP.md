### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Cloud account with Natural Language API and Vertex AI enabled
- GitHub OAuth application credentials
- Firebase project

### Backend Setup

#### Clone the repository
```bash
git clone https://github.com/yourusername/issuematch.git
cd issuematch
```

#### Navigate to backend directory
```bash
cd backend
```

#### Create virtual environment
```bash
python -m venv venv
```

#### Activate virtual environment
On Windows:
```bash
venv\Scripts\activate
```

On macOS/Linux:
```bash
source venv/bin/activate
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### Environment variables
Copy the example env file from `backend` and update values before running the backend:
```bash
cp backend/.env.example backend/.env
# then edit backend/.env with your values and run the backend
```
- Refer to [Github env vars](/faqs/github-env.md)
 
#### Configure credentials
Create a keys.json file with your Google Cloud credentials and place it in the app/services directory.

#### Set environment variables
Create a .env file with the following variables:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_APPLICATION_CREDENTIALS=path/to/keys.json
```

#### Start the backend server
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

#### Navigate to frontend directory
```bash
cd frontend
```

#### Install dependencies
```bash
npm install
```

#### Configure Firebase
Update the firebase.ts file with your Firebase project credentials.

#### Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:3000
