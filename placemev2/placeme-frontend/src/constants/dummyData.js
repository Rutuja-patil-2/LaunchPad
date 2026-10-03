// Dummy data for dashboard and pages

export const STUDENT_INFO = {
  name: 'Rahul Kumar',
  email: 'rahul.kumar@example.com',
  branch: 'Computer Science',
  cgpa: 8.5,
  resumeScore: 85,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
  joinDate: 'Jan 2024'
}

export const STATS = {
  appliedDrives: 12,
  upcomingDrives: 5,
  resumeScore: 85,
  testsCompleted: 8
}

export const UPCOMING_DRIVES = [
  {
    id: 1,
    company: 'TCS',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=tcs&shape=circle',
    position: 'Software Developer',
    package: '8.5 LPA',
    eligibility: '7.5+ CGPA',
    deadline: '2024-06-15',
    skills: ['Java', 'Python', 'SQL'],
    status: 'Apply Now'
  },
  {
    id: 2,
    company: 'Infosys',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=infosys&shape=circle',
    position: 'System Engineer',
    package: '7.5 LPA',
    eligibility: '7.0+ CGPA',
    deadline: '2024-06-20',
    skills: ['C/C++', 'Java', 'Problem Solving'],
    status: 'Apply Now'
  },
  {
    id: 3,
    company: 'Capgemini',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=capgemini&shape=circle',
    position: 'Technology Analyst',
    package: '7.2 LPA',
    eligibility: '6.5+ CGPA',
    deadline: '2024-06-25',
    skills: ['JavaScript', 'React', 'SQL'],
    status: 'Apply Now'
  }
]

export const APPLICATIONS = [
  {
    id: 1,
    company: 'Google',
    position: 'Software Engineer',
    appliedDate: '2024-05-10',
    status: 'Shortlisted',
    stages: [
      { name: 'Applied', completed: true },
      { name: 'Under Review', completed: true },
      { name: 'Shortlisted', completed: true },
      { name: 'Interview', completed: false },
      { name: 'Selected', completed: false }
    ]
  },
  {
    id: 2,
    company: 'Microsoft',
    position: 'Internship',
    appliedDate: '2024-05-08',
    status: 'Interview Scheduled',
    stages: [
      { name: 'Applied', completed: true },
      { name: 'Under Review', completed: true },
      { name: 'Shortlisted', completed: true },
      { name: 'Interview', completed: true },
      { name: 'Selected', completed: false }
    ]
  },
  {
    id: 3,
    company: 'Amazon',
    position: 'Junior Developer',
    appliedDate: '2024-05-01',
    status: 'Under Review',
    stages: [
      { name: 'Applied', completed: true },
      { name: 'Under Review', completed: true },
      { name: 'Shortlisted', completed: false },
      { name: 'Interview', completed: false },
      { name: 'Selected', completed: false }
    ]
  }
]

export const MOCK_TESTS = [
  {
    id: 1,
    name: 'Quantitative Aptitude',
    category: 'Aptitude',
    questions: 50,
    duration: 60,
    totalAttempts: 3,
    bestScore: 42,
    averageScore: 38,
    completed: true,
    nextTest: '2024-06-20'
  },
  {
    id: 2,
    name: 'Verbal Ability',
    category: 'Verbal',
    questions: 35,
    duration: 45,
    totalAttempts: 2,
    bestScore: 28,
    averageScore: 26,
    completed: true,
    nextTest: '2024-06-22'
  },
  {
    id: 3,
    name: 'Technical MCQ',
    category: 'Technical',
    questions: 40,
    duration: 50,
    totalAttempts: 1,
    bestScore: 35,
    averageScore: 35,
    completed: true,
    nextTest: '2024-06-25'
  },
  {
    id: 4,
    name: 'Logical Reasoning',
    category: 'Logical',
    questions: 45,
    duration: 55,
    totalAttempts: 0,
    bestScore: 0,
    averageScore: 0,
    completed: false,
    nextTest: 'Not Started'
  }
]

export const NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Drive: TCS Recruitment',
    message: 'TCS is hiring! Click to view details.',
    type: 'drive',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 2,
    title: 'Application Updated',
    message: 'Infosys - Your status changed to Shortlisted',
    type: 'application',
    timestamp: '5 hours ago',
    read: false
  },
  {
    id: 3,
    title: 'Test Reminder',
    message: 'Aptitude test is available now. Start test to improve score.',
    type: 'test',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: 4,
    title: 'Profile Complete',
    message: 'Your profile is 85% complete. Complete remaining sections.',
    type: 'profile',
    timestamp: '2 days ago',
    read: true
  }
]

export const INTERVIEW_EXPERIENCES = [
  {
    id: 1,
    company: 'Infosys',
    position: 'System Engineer',
    difficulty: 'Medium',
    rounds: '3 (Aptitude, Technical, HR)',
    questionsAsked: 'SQL joins, Java OOP, system design basics',
    tips: 'Practice SQL queries thoroughly. Stay calm during HR round.',
    result: 'Selected',
    author: 'Priya Singh',
    date: '2024-05-15'
  },
  {
    id: 2,
    company: 'TCS',
    position: 'Software Developer',
    difficulty: 'Easy',
    rounds: '2 (MCQ, Technical)',
    questionsAsked: 'Basic DSA, coding problem, SQL basics',
    tips: 'Focus on basic DSA. Interview was straightforward.',
    result: 'Selected',
    author: 'Akshay Sharma',
    date: '2024-05-10'
  },
  {
    id: 3,
    company: 'Capgemini',
    position: 'Technology Analyst',
    difficulty: 'Hard',
    rounds: '4 (Aptitude, Tech 1, Tech 2, HR)',
    questionsAsked: 'Advanced algorithms, system design, project discussion',
    tips: 'Prepare for detailed project discussion. System design is important.',
    result: 'Rejected',
    author: 'Ravi Patel',
    date: '2024-05-05'
  }
]

export const ACTIVITY_TIMELINE = [
  { id: 1, action: 'Applied to TCS', date: '2024-05-20', icon: 'briefcase' },
  { id: 2, action: 'Completed Aptitude Test', date: '2024-05-18', icon: 'award' },
  { id: 3, action: 'Updated Profile', date: '2024-05-15', icon: 'user' },
  { id: 4, action: 'Shortlisted by Infosys', date: '2024-05-12', icon: 'check' },
  { id: 5, action: 'Started Learning Python', date: '2024-05-10', icon: 'book' }
]

export const SIDEBAR_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'BarChart3',
    path: '/dashboard'
  },
  {
    id: 'profile',
    label: 'My Profile',
    icon: 'User',
    path: '/profile'
  },
  {
    id: 'drives',
    label: 'Placement Drives',
    icon: 'Briefcase',
    path: '/drives'
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: 'FileText',
    path: '/applications'
  },
  {
    id: 'tests',
    label: 'Mock Tests',
    icon: 'Zap',
    path: '/mock-tests'
  },
  {
    id: 'experience',
    label: 'Interview Experience',
    icon: 'MessageSquare',
    path: '/interviews'
  },
  {
    id: 'resume',
    label: 'ATS Resume',
    icon: 'FileDown',
    path: '/resume'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    path: '/notifications'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings'
  }
]

export const AI_SUGGESTIONS = [
  'You are weak in Quantitative Aptitude. Focus on permutation & combination problems.',
  'Your resume score is good! Add 2 more projects to reach 90+.',
  'Increase LinkedIn connections to attract more recruiter attention.',
  'Join our DSA crash course to improve problem-solving skills.',
  'Your interview experience sharing helps others! Keep sharing.'
]
