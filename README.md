# Skill Hours Tracker

A frontend-only productivity app built with Vite + React + TypeScript to track daily dedicated hours by skill/work category. All data is stored locally in the browser with no backend required.

## Features

- **Skill Management**: Create and manage skills/work categories with duplicate prevention
- **Time Logging**: Log daily hours (0-24, step 0.25) with optional notes
- **Analytics**: Interactive charts showing hours by skill, distribution, and daily trends
- **Profile Management**: Maintain professional profile with validation
- **Data Management**: Export/import JSON backups, clear all data
- **Responsive Design**: Works on desktop and mobile
- **Local Storage**: All data persisted locally with Zustand + localStorage

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand with persist middleware
- **Routing**: React Router v6
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UUID**: uuid library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Dashboard
- Add skills (prevents duplicates, case-insensitive)
- Log daily hours with date, skill selection, hours (0-24), and optional notes
- View recent entries table with delete functionality
- See total hours summary

### Analytics
- **Bar Chart**: Total hours per skill (sorted descending)
- **Pie Chart**: Hours distribution by skill with legend
- **Line Chart**: Daily hours trend (last 30 days)
- Graceful empty state handling

### Profile
- Manage personal information (name*, email*, profession, company, location, bio)
- Form validation with error messages
- Live preview card showing saved profile

### Settings
- **Export Data**: Download complete backup as JSON
- **Import Data**: Restore from JSON backup file
- **Clear All Data**: Remove all stored data (with confirmation)
- Data summary statistics
- Privacy information

### About
- App information and feature overview
- Privacy and security details
- Technical specifications

## Data Structure

```typescript
interface Skill {
  id: string;
  name: string;
}

interface Entry {
  id: string;
  date: string;       // YYYY-MM-DD
  skillId: string;
  hours: number;      // 0-24
  notes?: string;
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

The app uses Zustand with localStorage persistence:
- **Store Key**: `sht.store.v1`
- **Version**: 1 (for future migrations)
- **Persistence**: Automatic via zustand/middleware persist
- **Selectors**: Optimized selectors for computed values

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
- All data stored locally (no external servers)
- Export/import functionality for backups
- Clear confirmation for data deletion
- Graceful handling of corrupted data

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
- Charts use ResponsiveContainer for optimal sizing
- Lazy loading could be added for larger datasets
- LocalStorage has ~5-10MB limit per domain

## Troubleshooting

### Data Not Persisting
- Check if localStorage is enabled in browser
- Verify not using incognito/private mode
- Check browser storage quota

### Charts Not Displaying
- Ensure data exists (add skills and entries first)
- Check browser console for errors
- Verify Recharts compatibility

### Import/Export Issues
- Ensure JSON file format matches expected structure
- Check file permissions and browser security settings
- Verify file size limits

## License

This project is open source and available under the MIT License.