<div align="center">
  <h2>IssueMatch</h2>
  <p><em>Connecting developers with open source issues that match their skills and interests</em></p>
  <p>A smart platform that uses AI to analyze your GitHub profile and find the perfect open source issues for you to contribute to.</p>
  
  <img src="https://img.shields.io/github/contributors/AvishkarPatil/IssueMatch" alt="Contributors">
  <img src="https://img.shields.io/github/issues/AvishkarPatil/IssueMatch" alt="Issues">
  <img src="https://img.shields.io/github/forks/AvishkarPatil/IssueMatch" alt="Forks">
  <img src="https://img.shields.io/github/stars/AvishkarPatil/IssueMatch" alt="Stars">
</div>

---

<div align="center">
IssueMatch is an intelligent platform that bridges the gap between developers and open source projects. By analyzing your GitHub profile and skills using advanced AI techniques, IssueMatch recommends issues that perfectly match your expertise and interests, making it easier to find meaningful contributions in the vast open source ecosystem.
</div>

### ✨ Features

- **GitHub Profile Analysis**: Automatically extracts your technical skills, languages, and interests from your GitHub profile
- **AI-Powered Matching**: Uses natural language processing and vector similarity to find issues that match your skills
- **Skill Assessment**: Interactive skill test to better understand your technical expertise
- **Mentorship System**: Connect with mentors who can guide you through your open source journey
- **Real-time Analytics**: Track your open source contributions and growth
- **AI Assistant**: Get help with understanding issues and planning your contributions

### 🛠️ Technology Stack

### Backend
- **Python** with **FastAPI** framework
- **AI & ML Services**:
  - **Google Natural Language API** (`language_v1`): For entity extraction and technical skill identification
  - **Google Vertex AI** with **Gemini 2.0 Flash** (`gemini-2.0-flash-001`): For generating optimized GitHub search queries
  - **Google AI Studio** with **Gemini 2.0 Flash Lite** (`gemini-2.0-flash-lite`): For AI chatbot assistance
  - **FAISS** (`v1.7.x`): Using `IndexFlatL2` for vector similarity search
  - **Sentence Transformers** (`all-MiniLM-L6-v2`): For generating 384-dimensional text embeddings
- **GitHub API** (`2022-11-28`): For fetching repository and issue data

### Frontend
- **Next.js** with **React** and **TypeScript**
- **TailwindCSS** for styling
- **Firebase Firestore**: For user data storage and authentication state management

### Authentication
- **GitHub OAuth**: For secure user authentication
  - The login page now allows selecting which GitHub OAuth scopes to grant. See [docs/oauth-scopes.md](docs/oauth-scopes.md) for details on each scope and recommendations.

### 🔄 How It Works

1. **Login with GitHub**: Authenticate using your GitHub account
2. **Skill Assessment**: Complete a brief skill assessment (or skip if returning user)
3. **Profile Analysis**:
   - Your GitHub profile, repositories, languages, and READMEs are analyzed
   - Google Natural Language API extracts technical entities and keywords
   - Your skills are converted to vector embeddings
4. **Issue Matching**:
   - Open issues are fetched based on your skills and interests
   - Issues are converted to vector embeddings using Sentence Transformers
   - FAISS performs similarity search to find the best matches
   - Issues are ranked by relevance to your profile
5. **Contribution**: Select an issue to contribute to, with optional mentorship support


### 🚀 Deployment

Refer to [Deployment](/DEPLOYMENT.md)

### 🤝 Contributors

Refer to [Contribution](/.github/CONTRIBUTING.md)


### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>© 2025 Avishkar Patil All rights reserved.</p>
</div>
