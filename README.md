# Pathfinder Session Scheduler

A full-featured web application for scheduling and managing Pathfinder gaming sessions. This app allows Game Masters and players to coordinate schedules and track availability.

## Features

- **User Authentication**: Secure login and registration using NextAuth.js
- **Role-Based Access Control**: Different capabilities for players, GMs, and admins
- **Availability Management**: Players can submit their availability for sessions
- **Session Scheduling**: GMs can create and manage game sessions
- **Interactive Calendar**: View upcoming sessions in a calendar interface
- **Dark Mode Support**: Choose between light, dark, or system preference themes
- **Responsive Design**: Works well on desktop and mobile devices

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [React Hot Toast](https://react-hot-toast.com/) - Notifications
- [React Big Calendar](https://github.com/jquense/react-big-calendar) - Calendar component

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- Supabase account and project

### Environment Setup

1. Clone this repository
2. Copy `.env.example` to `.env.local` and fill in the required values:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup

1. Create a Supabase project
2. Run the migrations in the `supabase/migrations` folder
3. Set up the following tables in your Supabase project:
   - users (id, email, password_hash, role, created_at)
   - availabilities (id, user_id, name, selected_days, time_option, start_time, end_time, repeat_option, repeat_weeks, created_at)
   - sessions (id, title, session_date, user_id, created_by, created_at)

### Running the Application

```bash
# Install dependencies
npm install
# or
yarn install

# Run the development server
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## API Endpoints

### Authentication

- **POST /api/auth/[...nextauth]** - NextAuth.js authentication endpoint
- **POST /api/register** - User registration endpoint

### Sessions

- **GET /api/sessions** - Get all sessions (supports pagination and filtering)
- **POST /api/sessions** - Create a new session
- **PATCH /api/sessions/:id** - Update a session
- **DELETE /api/sessions/:id** - Delete a session
- **GET /api/next-session** - Get the next upcoming session

### Availabilities

- **GET /api/availabilities** - Get all availabilities
- **GET /api/availabilities?user=true** - Get current user's availabilities
- **POST /api/availabilities** - Submit new availability
- **PATCH /api/availabilities/:id** - Update an availability
- **DELETE /api/availabilities/:id** - Delete an availability

### User Management (Admin Only)

- **GET /api/users** - Get all users
- **PATCH /api/users/:id** - Update user role
- **DELETE /api/users/:id** - Delete a user

## Deployment

This application can be deployed on Vercel or any platform that supports Next.js applications.

```bash
# Build for production
npm run build
# or
yarn build

# Start production server
npm start
# or
yarn start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
