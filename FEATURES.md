# IssueMatch - New Features

This document outlines the three new features added to the IssueMatch platform.

## 1. Leaderboard

A gamified page showing top users by contribution scores to encourage engagement and friendly competition.

### Frontend Components
- `LeaderboardTable.tsx`: Displays users ranked by score with sorting capabilities
- `ScoreCard.tsx`: Shows user's personal stats (rank, score, total users)
- `app/leaderboard/page.tsx`: Main leaderboard page with filtering and search

### Backend Components
- `app/routers/leaderboard.py`: FastAPI endpoints for fetching leaderboard data
- `app/services/leaderboard_service.py`: Service for calculating and updating user scores

### Firebase Integration
- New collection: `leaderboard_scores` with fields:
  - userId, username, avatarUrl, score, contributions, mentorships, skills, updatedAt

## 2. Referral System

Allows users to generate unique referral links and earn points when friends sign up.

### Frontend Components
- `ReferralLinkGenerator.tsx`: Generates and displays shareable referral links
- `ReferralStats.tsx`: Shows referral statistics (total, successful, points)
- `app/referral/page.tsx`: Main referral page with explanation of the program
- `app/api/generate-referral/route.ts`: Next.js API route for generating referral codes

### Backend Components
- `app/routers/referral.py`: FastAPI endpoints for validating and completing referrals

### Firebase Integration
- Updates to `users` collection: Added `referralCode` field
- New collection: `referrals` with fields:
  - referrerId, referredUserId, status, pointsAwarded, createdAt

## 3. Mentor Hub

Connects users with experienced mentors who can guide them through open source contributions.

### Frontend Components
- `MentorList.tsx`: Displays available mentors with filtering options
- `RequestModal.tsx`: Modal for sending mentorship requests
- `app/mentor-hub/page.tsx`: Main mentor hub page with search and filtering
- `app/api/request-mentor/route.ts`: Next.js API route for sending mentorship requests

### Backend Components
- `app/routers/mentor.py`: FastAPI endpoints for mentor suggestions using Gemini API

### Firebase Integration
- New collections:
  - `mentors`: Stores mentor profiles with skills and availability
  - `mentorship_requests`: Tracks mentorship requests and their status

### AI Integration
- Uses Gemini API (free tier) to suggest mentors based on issue content and user skills

## Navigation Updates

- Added links to new features in the main navigation
- Added referral link to the user profile menu

## Future Enhancements

1. **Leaderboard**:
   - Weekly/monthly rankings
   - Achievement badges for milestones
   - Social sharing of achievements

2. **Referral System**:
   - Tiered rewards for multiple referrals
   - Special badges for top referrers
   - Referral campaigns with limited-time bonuses

3. **Mentor Hub**:
   - In-app messaging system for mentors and mentees
   - Scheduling system for mentor sessions
   - Mentor ratings and reviews
   - Skill verification for mentors