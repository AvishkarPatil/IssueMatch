// Sample data for development purposes

export const leaderboardUsers = [
  {
    id: 'user1',
    rank: 1,
    username: 'devAlice',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345678',
    score: 980,
    contributions: 120,
    mentorships: 15,
    skillBadges: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    badges: ['Top Contributor', 'Top Mentor']
  },
  {
    id: 'user2',
    rank: 2,
    username: 'codeBob',
    avatarUrl: 'https://avatars.githubusercontent.com/u/23456789',
    score: 940,
    contributions: 110,
    mentorships: 12,
    skillBadges: ['Python', 'Django', 'FastAPI', 'PostgreSQL'],
    badges: ['Top Contributor']
  },
  {
    id: 'user3',
    rank: 3,
    username: 'openCharlie',
    avatarUrl: 'https://avatars.githubusercontent.com/u/34567890',
    score: 900,
    contributions: 95,
    mentorships: 20,
    skillBadges: ['Java', 'Spring', 'Kubernetes', 'Docker'],
    badges: ['Top Mentor']
  },
  {
    id: 'user4',
    rank: 4,
    username: 'devDiana',
    avatarUrl: 'https://avatars.githubusercontent.com/u/45678901',
    score: 860,
    contributions: 85,
    mentorships: 5,
    skillBadges: ['C++', 'Rust', 'WebAssembly'],
    badges: []
  },
  {
    id: 'user5',
    rank: 5,
    username: 'scriptEve',
    avatarUrl: 'https://avatars.githubusercontent.com/u/56789012',
    score: 820,
    contributions: 80,
    mentorships: 10,
    skillBadges: ['Go', 'Microservices', 'gRPC'],
    badges: []
  },
  {
    id: 'user6',
    rank: 6,
    username: 'codeFrank',
    avatarUrl: 'https://avatars.githubusercontent.com/u/67890123',
    score: 800,
    contributions: 70,
    mentorships: 7,
    skillBadges: ['Ruby', 'Rails', 'GraphQL'],
    badges: []
  },
  {
    id: 'user7',
    rank: 7,
    username: 'hackGrace',
    avatarUrl: 'https://avatars.githubusercontent.com/u/78901234',
    score: 780,
    contributions: 65,
    mentorships: 14,
    skillBadges: ['PHP', 'Laravel', 'MySQL'],
    badges: ['Top Mentor']
  },
  {
    id: 'user8',
    rank: 8,
    username: 'devHeidi',
    avatarUrl: 'https://avatars.githubusercontent.com/u/89012345',
    score: 750,
    contributions: 60,
    mentorships: 2,
    skillBadges: ['Swift', 'iOS', 'SwiftUI'],
    badges: []
  },
  {
    id: 'user9',
    rank: 9,
    username: 'codeIvan',
    avatarUrl: 'https://avatars.githubusercontent.com/u/90123456',
    score: 700,
    contributions: 55,
    mentorships: 1,
    skillBadges: ['Kotlin', 'Android', 'Jetpack Compose'],
    badges: []
  },
  {
    id: 'user10',
    rank: 10,
    username: 'openJudy',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345987',
    score: 680,
    contributions: 50,
    mentorships: 0,
    skillBadges: ['Dart', 'Flutter', 'Firebase'],
    badges: []
  },
  {
    id: 'user11',
    rank: 11,
    username: 'devKevin',
    avatarUrl: 'https://avatars.githubusercontent.com/u/23456098',
    score: 650,
    contributions: 48,
    mentorships: 3,
    skillBadges: ['C#', '.NET', 'Azure'],
    badges: []
  },
  {
    id: 'user12',
    rank: 12,
    username: 'codeLisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/34567809',
    score: 620,
    contributions: 45,
    mentorships: 5,
    skillBadges: ['Vue.js', 'Nuxt.js', 'Tailwind CSS'],
    badges: []
  },
  {
    id: 'user13',
    rank: 13,
    username: 'openMike',
    avatarUrl: 'https://avatars.githubusercontent.com/u/45678910',
    score: 600,
    contributions: 40,
    mentorships: 8,
    skillBadges: ['Scala', 'Akka', 'Play Framework'],
    badges: []
  },
  {
    id: 'user14',
    rank: 14,
    username: 'devNancy',
    avatarUrl: 'https://avatars.githubusercontent.com/u/56789021',
    score: 580,
    contributions: 38,
    mentorships: 6,
    skillBadges: ['Elixir', 'Phoenix', 'Erlang'],
    badges: []
  },
  {
    id: 'user15',
    rank: 15,
    username: 'scriptOscar',
    avatarUrl: 'https://avatars.githubusercontent.com/u/67890132',
    score: 550,
    contributions: 35,
    mentorships: 4,
    skillBadges: ['Haskell', 'Elm', 'PureScript'],
    badges: []
  }
];

export const currentUserStats = {
  rank: 15,
  score: 550,
  contributions: 35,
  mentorships: 4
};

export const mentorsList = [
  {
    id: 'mentor1',
    name: 'Alice Johnson',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345678',
    githubUrl: 'https://github.com/alicejohnson',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    rating: 4.9,
    bio: 'Senior Frontend Developer with 8 years of experience. Passionate about mentoring and open source.',
    availability: 'available',
    experience: 8,
    timezone: 'UTC-8',
    languages: ['JavaScript', 'TypeScript', 'Python'],
    achievements: ['Google Developer Expert']
  },
  {
    id: 'mentor2',
    name: 'Bob Smith',
    avatarUrl: 'https://avatars.githubusercontent.com/u/23456789',
    githubUrl: 'https://github.com/bobsmith',
    skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL'],
    rating: 4.8,
    bio: 'Backend Engineer specializing in Python. Contributor to Django and FastAPI.',
    availability: 'busy',
    experience: 6,
    timezone: 'UTC-5',
    languages: ['Python', 'Go', 'SQL'],
    achievements: ['Django Core Contributor']
  },
  {
    id: 'mentor3',
    name: 'Charlie Davis',
    avatarUrl: 'https://avatars.githubusercontent.com/u/34567890',
    githubUrl: 'https://github.com/charliedavis',
    skills: ['Java', 'Spring', 'Kubernetes', 'Docker'],
    rating: 4.7,
    bio: 'DevOps Engineer with a background in Java development. Kubernetes enthusiast.',
    availability: 'available',
    experience: 10,
    timezone: 'UTC+0',
    languages: ['Java', 'Kotlin', 'Bash'],
    achievements: ['CNCF Ambassador']
  },
  {
    id: 'mentor4',
    name: 'Diana Lee',
    avatarUrl: 'https://avatars.githubusercontent.com/u/45678901',
    githubUrl: 'https://github.com/dianalee',
    skills: ['C++', 'Rust', 'WebAssembly'],
    rating: 4.9,
    bio: 'Systems programmer focused on performance and low-level optimization. Rust advocate.',
    availability: 'unavailable',
    experience: 12,
    timezone: 'UTC+1',
    languages: ['C++', 'Rust', 'C'],
    achievements: ['Rust Core Contributor']
  },
  {
    id: 'mentor5',
    name: 'Eve Wilson',
    avatarUrl: 'https://avatars.githubusercontent.com/u/56789012',
    githubUrl: 'https://github.com/evewilson',
    skills: ['Go', 'Microservices', 'gRPC'],
    rating: 4.6,
    bio: 'Go developer building scalable microservices. Previously at Google and Uber.',
    availability: 'busy',
    experience: 7,
    timezone: 'UTC+5',
    languages: ['Go', 'Python', 'JavaScript'],
    achievements: ['Go GDE']
  },
  {
    id: 'mentor6',
    name: 'Frank Miller',
    avatarUrl: 'https://avatars.githubusercontent.com/u/67890123',
    githubUrl: 'https://github.com/frankmiller',
    skills: ['Ruby', 'Rails', 'GraphQL'],
    rating: 4.5,
    bio: 'Full-stack developer with a focus on Ruby on Rails and GraphQL APIs.',
    availability: 'available',
    experience: 9,
    timezone: 'UTC+8',
    languages: ['Ruby', 'JavaScript', 'TypeScript'],
    achievements: ['Rails Core Team']
  }
];

export const referralStats = {
  totalReferrals: 12,
  successfulReferrals: 8,
  pointsEarned: 400,
  referralCode: 'ABC123XYZ'
};