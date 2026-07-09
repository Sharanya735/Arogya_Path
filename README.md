# Arogya Path 🚑

Arogya Path is a modern, real-time ambulance tracking and dispatcher management system. Built to streamline emergency medical response, it provides live tracking for families, comprehensive dashboards for dispatchers, and seamless coordination with hospitals.

## Features

- **Live GPS Tracking**: Real-time map tracking for assigned ambulances.
- **Dispatcher Dashboard**: Complete oversight of all ambulances, emergencies, and hospital statuses.
- **Family Mobile View**: A clean, accessible view for families to track their assigned ambulance and ETA.
- **Hospital Integration**: Direct coordination and capacity management with receiving hospitals.
- **Responsive Design**: Beautiful, vibrant glassmorphism UI that works flawlessly on desktop and mobile.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **Map & Routing**: Leaflet, React Leaflet
- **Backend & Database**: Supabase

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run `npm run dev` to start the local development server
5. Visit `http://localhost:3000`

## Deployment

Arogya Path is optimized for 1-click deployment on Vercel. Simply import the repository to Vercel and add the required environment variables.
