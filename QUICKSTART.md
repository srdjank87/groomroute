# GroomRoute - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (Already Done!)
```bash
npm install
```

### Step 2: Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/groomroute"
```

### Step 3: Set Up Database
```bash
# Create database and run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 4: Configure Maps Provider
Add to `.env`:

**Option A - Google Maps:**
```bash
MAPS_PROVIDER=google
GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Option B - Mapbox:**
```bash
MAPS_PROVIDER=mapbox
MAPBOX_ACCESS_TOKEN=your_token_here
```

### Step 5: Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 📋 What You Have

### Working Now:
- ✅ Landing page at `/`
- ✅ Database schema ready
- ✅ Routing provider system
- ✅ UI component library
- ✅ TypeScript setup

### To Build Next:
1. Authentication system
2. Customer management pages
3. Appointment scheduling
4. Route builder service
5. Map visualization

---

## 🛠 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run linter

# Database
npx prisma migrate dev   # Create and apply migration
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema without migration (dev only)

# Useful for development
npx prisma migrate reset # Reset database (deletes all data!)
```

---

## 📝 Quick Reference

### Database Models
- `Account` → Business/tenant
- `User` → Login credentials
- `Groomer` → Service provider
- `Customer` → Client with address
- `Pet` → Animal being groomed
- `Appointment` → Scheduled service
- `Route` → Optimized daily plan
- `RouteStop` → Individual stop in route

### Routing System Usage
```typescript
import { getRoutingProvider } from "@/lib/routing/provider";

const provider = getRoutingProvider();

// Geocode an address
const result = await provider.geocodeAddress("123 Main St");

// Optimize a route
const route = await provider.optimizeRoute({
  origin: { lat: 40.7, lng: -74.0 },
  waypoints: [/* ... */],
  returnToOrigin: true,
});
```

### UI Components
```tsx
import { Button, Input, Card } from "@/components/ui";

<Button variant="default">Click me</Button>
<Input placeholder="Enter text" />
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

---

## 🔗 Important Links

- **Landing Page**: http://localhost:3000
- **Prisma Studio**: Run `npx prisma studio`
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

## 🆘 Troubleshooting

**Build fails?**
- Check TypeScript errors: `npx tsc --noEmit`
- Clear Next.js cache: `rm -rf .next`

**Database connection fails?**
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Test connection: `npx prisma db pull`

**Geocoding not working?**
- Check `MAPS_PROVIDER` is set
- Verify API key/token is correct
- Check API key has proper permissions

---

For detailed documentation, see [README.md](./README.md) and [SETUP_COMPLETE.md](./SETUP_COMPLETE.md).
