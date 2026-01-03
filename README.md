<div align="center">

# 🤝 IssueMatch
### AI-Powered Open Source Contribution Matchmaker

[![SWoC 2026](https://img.shields.io/badge/SWoC-2026-blue?style=for-the-badge)](https://swoc.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

**IssueMatch** connects developers with open-source issues that perfectly match their skills using Gemini AI and FAISS vector search.

[View Live Website](https://your-link-here.com) • [Report Bug](https://github.com/AvishkarPatil/IssueMatch/issues) • [Request Feature](https://github.com/AvishkarPatil/IssueMatch/issues)

</div>

---

## 🚀 Quick Overview (TL;DR)
- **Problem:** Finding the right first issue takes hours of manual searching.
- **Solution:** IssueMatch analyzes your GitHub profile and uses AI to recommend issues you can actually solve.
- **Key Tech:** Next.js 15, FastAPI, Gemini 2.0 Flash, and FAISS.

---

## 🔄 How It Works

1. **GitHub Auth:** Secure one-click login.
2. **AI Analysis:** Google Natural Language API extracts skills from your repositories.
3. **Vector Matching:** FAISS performs similarity searches on 384-dimensional embeddings.
4. **Smart Results:** Ranked issues appear based on your specific expertise.

---

## ✨ Key Features

<details>
<summary>🤖 <b>AI & Matching Engine (Click to expand)</b></summary>

- **Vector Similarity Search**: FAISS-powered matching for high accuracy.
- **Intelligent Queries**: Gemini 2.0 Flash creates optimized GitHub search filters.
- **Real-time Learning**: ML system improves recommendations based on your feedback.
</details>

<details>
<summary>👤 <b>User Experience & Growth</b></summary>

- **AI Chatbot**: Get help understanding complex issue descriptions.
- **Progress Analytics**: Visualize your open-source journey with charts.
- **Gamification**: Compete on the leaderboard and earn referrals.
</details>

---

## 🛠️ Technology Stack

| Layer | Tech Stack |
| :--- | :--- |
| **Frontend** | Next.js 15 (React 19), TypeScript, TailwindCSS, Shadcn/ui |
| **Backend** | FastAPI (Python 3.9+), Uvicorn |
| **AI/ML** | Gemini 2.0 Flash, FAISS, Sentence Transformers |
| **Database/Auth** | Firebase Firestore, GitHub OAuth 2.0 |

---

## 🏁 Getting Started (SWoC 2026)

We are excited to have **SWoC 2026** contributors! Follow these steps to set up locally:

### 1. Prerequisites
- Python 3.9+, Node.js 18+, Git.

### 2. Installation
```bash
# Clone the repo
git clone [https://github.com/AvishkarPatil/IssueMatch.git](https://github.com/AvishkarPatil/IssueMatch.git)
cd IssueMatch
```

# Setup Backend
```
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

# Setup Frontend
```
cd ../frontend
npm install
npm run dev
```
---

## 📋 Roadmap (SWoC '26 Tasks)

Looking for something to contribute? Check these prioritized tasks:

- **High:** Real-time leaderboard implementation 
- **Medium:** Advanced analytics dashboard for user profiles 
- **Medium:** Mobile responsiveness audit and fixes 
- **Easy:** UI/UX design refinements for Dark Mode 

---

## 🤝 Contributing

We welcome contributions from everyone! Follow these simple steps:
1. **Explore Issues:** Look for issues with labels: `SWoC26`, `Good First Issue`.
2. **Assignment:** Request assignment by commenting on the specific issue.
3. **Guidelines:** Follow our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for PR rules and coding standards.

### Our Contributors
<a href="https://github.com/AvishkarPatil/IssueMatch/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AvishkarPatil/IssueMatch" />
</a>

---

<div align="center">
  <p>Built with ❤️ for the Open Source Community.</p>
  <p>© 2026 IssueMatch. Licensed under <b>MIT License</b>.</p>
</div>
