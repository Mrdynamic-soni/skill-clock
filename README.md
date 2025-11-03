# SkillClock

A full-stack productivity app built with Vite + React + TypeScript and Supabase to track daily dedicated hours by skill/work category. Features cloud authentication and data synchronization across devices.

## Features

- **Authentication**: Email/password and Google OAuth sign-in with Supabase
- **Skill Management**: Create and manage skills/work categories with priority levels
- **Timer System**: Real-time timer with pause/resume functionality and session tracking
- **Time Logging**: Manual entry and automatic timer-based logging with notes
- **Sessions**: Detailed session history with start/end times, duration, and pause tracking
- **Goals**: Set and track skill-based goals with deadlines and progress monitoring
- **Daily Tasks**: Task management with completion tracking
- **Analytics**: Interactive charts showing hours by skill, distribution, and daily trends
- **Profile Management**: User profile with validation
- **Admin Dashboard**: Feedback management system (admin-only)
- **Mobile Optimized**: Responsive design with mobile-first approach
- **Cloud Sync**: All data synchronized across devices via Supabase

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: Zustand with optimistic updates
- **Routing**: React Router v6
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI (dropdowns)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **UUID**: uuid library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   - Run the SQL schema in `setup-database.sql` in your Supabase SQL editor
   - Configure Google OAuth in Supabase Auth settings

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Authentication
- Sign up with email/password or Google OAuth
- Email verification required for new accounts
- Secure session management with Supabase Auth

### Skills Dashboard
- Add skills with priority levels (low, medium, high)
- Prevents duplicate skills (case-insensitive)
- View and manage all skills with edit/delete functionality

### Timer System
- Start/pause/resume timers for any skill
- Real-time elapsed time display
- Automatic session and entry creation on timer end
- Guard rails prevent logout during active sessions

### Time Logging
- Manual entry with date, skill, hours (0-24), and notes
- Automatic entries from timer sessions
- View recent entries with delete functionality

### Sessions
- Detailed session history with precise timing (including seconds)
- Start/end times, duration, pause tracking
- Add/edit session notes
- Filter by skill and date
- Manual session entry capability

### Goals
- Set skill-based goals with target hours and deadlines
- Daily target tracking
- Progress monitoring and completion status
- Goal management (create, edit, delete, complete)

### Daily Tasks
- Create and manage daily tasks
- Mark tasks as complete/incomplete
- Task completion tracking

### Analytics
- **Bar Chart**: Total hours per skill (sorted descending)
- **Pie Chart**: Hours distribution by skill with legend
- **Line Chart**: Daily hours trend (last 30 days)
- Real-time data updates

### Profile
- Manage user profile information
- Form validation with error messages

### Help & About
- Comprehensive app information
- User feedback system
- Contact information and support

### Admin Dashboard
- View all user feedback and suggestions (admin-only)
- Filter feedback by type (questions/suggestions)
- Real-time feedback statistics

## Data Structure

```typescript
interface Skill {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high';
}

interface Entry {
  id: string;
  date: string;       // YYYY-MM-DD
  skillId: string;
  hours: number;      // 0-24
  notes?: string;
}

interface Session {
  id: string;
  skillId: string;
  date: string;
  startTime: number;  // timestamp
  endTime: number;    // timestamp
  totalHours: number;
  notes?: string;
  intervals: Array<{ start: number; end?: number }>;
}

interface Goal {
  id: string;
  skillId: string;
  title: string;
  description: string;
  targetHours: number;
  dailyTarget: number;
  deadline: string;
  completed: boolean;
  completionNote?: string;
  createdAt: string;
}

interface DailyTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

interface Profile {
  name: string;
  email: string;
  profession?: string;
  company?: string;
  location?: string;
  bio?: string;
}
```

## State Management

The app uses Zustand with Supabase integration:
- **Client State**: Zustand store with optimistic updates
- **Server State**: Supabase PostgreSQL with real-time sync
- **Authentication**: Supabase Auth state management
- **Persistence**: Cloud-based with local caching
- **Selectors**: Optimized selectors for computed values
- **Offline Support**: Optimistic updates with server reconciliation

## Key Features

### Data Validation
- Hours clamped to 0-24 range
- Email format validation
- Required field validation
- Duplicate skill prevention

### User Experience
- Confirmation dialogs for destructive actions
- Toast notifications for user feedback
- Collapsible sidebar with state persistence
- Responsive design for all screen sizes
- Keyboard navigation support

### Data Safety
- Cloud-based data storage with Supabase
- Row Level Security (RLS) for data isolation
- Real-time synchronization across devices
- Optimistic updates with error handling
- Secure authentication with JWT tokens

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires localStorage support and modern JavaScript features.

## Development Notes

### Architecture Decisions
- **Single Store**: One Zustand store for simplicity
- **Component Structure**: Logical separation of concerns
- **Styling**: Utility-first with Tailwind CSS
- **Type Safety**: Full TypeScript coverage

### Extending the App
- Add new chart types in `src/pages/Analytics.tsx`
- Extend profile fields in `src/store/appStore.ts`
- Add new pages by creating components and updating routes
- Customize styling in `tailwind.config.js`

### Performance Considerations
- Zustand selectors prevent unnecessary re-renders
- Optimistic updates for immediate UI feedback
- Charts use ResponsiveContainer for optimal sizing
- Efficient database queries with proper indexing
- Real-time subscriptions for live data updates

## Troubleshooting

### Authentication Issues
- Verify Supabase credentials in environment variables
- Check Google OAuth configuration in Supabase dashboard
- Ensure email verification for new accounts

### Data Not Syncing
- Check internet connection
- Verify Supabase service status
- Check browser console for API errors

### Charts Not Displaying
- Ensure data exists (add skills and entries first)
- Check browser console for errors
- Verify Recharts compatibility

### Google OAuth Setup
- Configure authorized JavaScript origins in Google Console
- Set correct redirect URIs in Google Console
- Verify Google OAuth credentials in Supabase

## Database Schema

The app uses PostgreSQL with the following main tables:
- `skills` - User skills with priorities
- `entries` - Time logging entries
- `sessions` - Detailed timer sessions
- `goals` - Skill-based goals and targets
- `daily_tasks` - Daily task management
- `feedback` - User feedback system

All tables include Row Level Security (RLS) policies for data isolation.

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)
1. Create new Supabase project
2. Run database schema from `setup-database.sql`
3. Configure authentication providers
4. Set up RLS policies

## License

This project is open source and available under the MIT License.