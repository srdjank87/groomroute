# GroomRoute

**Smart Routing for Mobile Pet Groomers**

GroomRoute is a SaaS application that helps mobile pet groomers optimize their daily routes, reduce drive time, and serve more clients efficiently.

## Features

- **Route Optimization**: One-click optimization of daily appointments
- **Customer Management**: Store customer addresses, pet details, and preferences
- **Appointment Scheduling**: Easy booking with service times and time windows
- **Route Visualization**: Map view of optimized routes with ETAs
- **Geocoding**: Automatic address validation and coordinate storage
- **Multi-Provider Support**: Works with Google Maps or Mapbox

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Maps**: Google Maps Platform or Mapbox (configurable)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud-based like Neon)
- Google Maps API key OR Mapbox access token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd groomroute
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `MAPS_PROVIDER`: Either "google" or "mapbox"
- `GOOGLE_MAPS_API_KEY`: If using Google Maps
- `MAPBOX_ACCESS_TOKEN`: If using Mapbox

4. Set up the database:
```bash
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
groomroute/
├── app/                    # Next.js app directory
│   ├── app/               # Authenticated app pages
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── appointments/
│   │   ├── routes/
│   │   └── settings/
│   ├── auth/              # Authentication pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── lib/                   # Utility libraries
│   ├── prisma/           # Prisma client
│   ├── routing/          # Routing provider abstraction
│   └── utils/            # Helper functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma
└── public/               # Static assets
```

## Database Schema

### Core Models

- **Account**: Tenant/business entity
- **User**: Authentication and account access
- **Groomer**: Person/vehicle performing grooming services
- **Customer**: Client with address and contact info
- **Pet**: Animal being groomed (linked to customer)
- **Appointment**: Scheduled grooming appointment
- **Route**: Daily optimized driving plan
- **RouteStop**: Individual stop in a route

## Routing Architecture

The routing system is abstracted to support multiple providers:

### Providers
- **Google Maps**: Uses Directions API with waypoint optimization
- **Mapbox**: Uses Optimization API for route planning

### Key Components
- `lib/routing/types.ts`: Type definitions
- `lib/routing/google-provider.ts`: Google Maps implementation
- `lib/routing/mapbox-provider.ts`: Mapbox implementation
- `lib/routing/provider.ts`: Provider factory

### Usage Example

```typescript
import { getRoutingProvider } from "@/lib/routing/provider";

const provider = getRoutingProvider();

// Geocode an address
const result = await provider.geocodeAddress("123 Main St, City, State");

// Optimize a route
const route = await provider.optimizeRoute({
  origin: { lat: 40.7128, lng: -74.0060 },
  waypoints: [
    { location: { lat: 40.7580, lng: -73.9855 } },
    { location: { lat: 40.7489, lng: -73.9680 } },
  ],
  returnToOrigin: true,
});
```

## Development Workflow

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
npm start
```

### Database Management

Create a migration:
```bash
npx prisma migrate dev --name description_of_change
```

Open Prisma Studio (database GUI):
```bash
npx prisma studio
```

Reset database (WARNING: deletes all data):
```bash
npx prisma migrate reset
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `MAPS_PROVIDER` | Maps provider: "google" or "mapbox" | Yes |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | If using Google |
| `MAPBOX_ACCESS_TOKEN` | Mapbox access token | If using Mapbox |
| `NEXTAUTH_URL` | App URL for authentication | Yes (for auth) |
| `NEXTAUTH_SECRET` | Secret for session encryption | Yes (for auth) |

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

This is a standard Next.js app and can be deployed to any platform supporting Node.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS (Amplify, ECS, etc.)

## MVP Roadmap

### Phase 1: Core Functionality (Current)
- [x] Project setup and configuration
- [x] Database schema
- [x] Routing provider abstraction
- [ ] Authentication system
- [ ] Customer management (CRUD)
- [ ] Appointment scheduling
- [ ] Route optimization
- [ ] Route visualization

### Phase 2: Polish
- [ ] Customer notifications
- [ ] Time window constraints
- [ ] Route rebuilding on changes
- [ ] Mobile-responsive design
- [ ] Performance optimization

### Phase 3: Advanced Features
- [ ] Multi-groomer/team support
- [ ] Cancellation fill suggestions
- [ ] Client portal
- [ ] Analytics and reporting

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.
