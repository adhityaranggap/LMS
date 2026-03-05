# Information Security Testing Course Platform

An interactive learning platform for **Pengujian Keamanan Informasi** (Information Security Testing) course at Universitas Bina Insani. This platform provides comprehensive modules on cybersecurity concepts, hands-on lab exercises, real-world case studies, and quizzes with integrated fraud detection.

## Features

- **Interactive Modules**: Structured course content covering theory, lab exercises, and case studies
- **Student Authentication**: Secure login with student ID and webcam photo verification
- **Quiz System**: Multiple-choice and essay-based assessments with auto-grading
- **Audit Logging**: Track all user actions and login history
- **Fraud Detection**: Identify suspicious activities and anomalies
- **Admin Dashboard**: Comprehensive oversight and monitoring tools
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Animations**: Motion (Framer Motion alternative)
- **Icons**: Lucide Icons
- **AI Integration**: Gemini API for intelligent features

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BIULMS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` — Start development server (port 3000)
- `npm run build` — Create production build via Vite
- `npm run lint` — Type-check with TypeScript
- `npm run clean` — Remove dist directory

## Project Structure

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Route definitions
├── index.css               # Global styles with Tailwind
├── pages/
│   ├── Login.tsx          # Student authentication
│   ├── Home.tsx           # Course overview
│   ├── ModuleDetail.tsx   # Module content viewer
│   ├── LecturerDashboard.tsx
│   └── SuperAdminDashboard.tsx
├── components/
│   ├── Layout.tsx         # Sidebar & navigation
│   ├── Quiz.tsx           # Quiz functionality
│   ├── AuditLogViewer.tsx
│   └── FraudDashboard.tsx
├── context/
│   └── AuthContext.tsx    # Authentication & session state
└── data/
    └── syllabus-data.ts   # Course content
```

## Authentication

The platform uses a custom authentication system:

- **Login**: Student ID + webcam photo capture
- **Session Storage**: Student sessions stored in localStorage with key `student_session`
- **Login History**: Tracked in `login_history` localStorage key
- **Protected Routes**: All pages except login require authentication

## Security Features

### Audit Logging
Track all user actions including login attempts, quiz submissions, and module access.

### Fraud Detection
Detect suspicious activities such as unusual login patterns and rapid quiz submissions.

### Admin Dashboard
Comprehensive administrative tools for viewing audit logs and analyzing user activity.

## Building for Production

Create an optimized production build:
```bash
npm run build
```

Output is in the `dist/` directory.

## Contributing

When contributing to this project:

1. Follow the established code structure
2. Use TypeScript for type safety
3. Test functionality across different browsers
4. Update documentation as needed
5. Ensure authentication and security features remain intact

## Acknowledgments

Built with React, TypeScript, Tailwind CSS, and powered by Google's Gemini API.
