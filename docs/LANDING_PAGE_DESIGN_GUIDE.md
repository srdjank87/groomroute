# Landing Page Design Guide

Use this document as a reference when building landing pages in new projects. This captures the design patterns from GroomRoute.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + DaisyUI
- **Icons:** Lucide React
- **Images:** Next.js Image component

---

## Color System

### Brand Colors (Tailwind Config)
```javascript
// tailwind.config.ts - DaisyUI theme
daisyui: {
  themes: [{
    light: {
      primary: "#A5744A",        // Warm brown - primary actions
      "primary-focus": "#8B6239", // Darker brown - hover states
      "primary-content": "#ffffff",
      secondary: "#f6d860",       // Yellow accent
      accent: "#37cdbe",          // Teal accent
      neutral: "#3d4451",         // Dark gray
      "base-100": "#ffffff",      // White background
      info: "#3abff8",
      success: "#36d399",         // Green for positive
      warning: "#fbbd23",
      error: "#f87272",           // Red for negative
    },
  }],
}
```

### Section Background Gradients
```css
/* Hero - warm, inviting */
bg-gradient-to-br from-amber-50 via-orange-50 to-white

/* How it works - fresh, calm */
bg-gradient-to-br from-emerald-50 to-teal-50

/* Feature highlight - premium feel */
bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50

/* Final CTA - branded */
bg-gradient-to-br from-[#A5744A]/10 to-amber-50

/* Guarantee section */
bg-gradient-to-br from-emerald-50 to-green-50

/* Problem cards - negative */
bg-red-50 border border-red-100

/* Solution cards - positive */
bg-emerald-50 border border-emerald-200
```

---

## Typography

### Headlines
```css
/* Hero H1 */
text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight

/* Section H2 */
text-3xl lg:text-4xl font-bold text-gray-900

/* Card H3 */
text-xl font-bold text-gray-900
```

### Body Text
```css
/* Hero subhead */
text-base sm:text-lg lg:text-2xl text-gray-700 leading-relaxed

/* Section description */
text-xl text-gray-600

/* Card body */
text-sm text-gray-600
```

---

## Section Structure

### Standard Section Padding
```css
py-12 lg:py-16 px-6 bg-white
```

### Content Container
```css
max-w-6xl mx-auto    /* Full width sections */
max-w-4xl mx-auto    /* Narrower content */
max-w-3xl mx-auto    /* Testimonials, narrow text */
```

---

## Component Patterns

### Header
```jsx
<header className="border-b border-base-300 bg-base-100">
  <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
    {/* Logo left, nav center (hidden mobile), CTAs right */}
  </div>
</header>
```

### Hero Section
```jsx
<section className="hero bg-gradient-to-br from-amber-50 via-orange-50 to-white py-6 sm:py-8 lg:py-12">
  <div className="hero-content max-w-6xl w-full px-4">
    <div className="text-center w-full">
      {/* H1 -> Subhead -> Image -> Value props -> CTAs -> Fine print */}
    </div>
  </div>
</section>
```

### Value Props Row
```jsx
<div className="flex gap-2 sm:gap-4 lg:gap-6 justify-center text-xs sm:text-sm lg:text-base text-gray-600">
  <span className="flex items-center gap-1 sm:gap-1.5">
    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
    Benefit one
  </span>
  {/* Repeat for each benefit */}
</div>
```

### CTA Buttons
```jsx
{/* Primary CTA - gradient */}
<Link className="btn btn-gradient btn-md sm:btn-lg text-base sm:text-lg px-6 sm:px-8">
  Primary Action
  <ChevronRight className="h-5 w-5" />
</Link>

{/* Secondary CTA - outline */}
<Link className="btn btn-outline btn-md sm:btn-lg text-base sm:text-lg px-6 sm:px-8 border-2 border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:text-white">
  Secondary Action
</Link>
```

### Feature Cards (Grid)
```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
    <div className="card-body">
      <div className="w-12 h-12 bg-[#A5744A]/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-[#A5744A]" />
      </div>
      <h3 className="card-title text-lg">Feature Name</h3>
      <p className="text-gray-600 text-sm">Description text.</p>
    </div>
  </div>
</div>
```

### Problem/Solution Cards
```jsx
{/* Problem card - red theme */}
<div className="bg-red-50 border border-red-100 rounded-xl p-5">
  <div className="flex items-start gap-3">
    <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-semibold text-gray-900">Problem headline</p>
      <p className="text-sm text-gray-600">Supporting detail</p>
    </div>
  </div>
</div>

{/* Solution card - green theme */}
<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
  <div className="flex items-start gap-3">
    <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-semibold text-gray-900">Solution headline</p>
      <p className="text-sm text-gray-600">Supporting detail</p>
    </div>
  </div>
</div>
```

### Testimonial Cards
```jsx
<div className="card bg-white shadow-xl">
  <div className="card-body">
    <p className="text-lg mb-4 italic text-gray-700">
      "Quote text with <span className="font-semibold text-gray-900">key phrase highlighted</span>."
    </p>
    <div className="flex items-center gap-3">
      <div className="avatar placeholder">
        <div className="bg-amber-100 text-amber-800 rounded-full w-12">
          <span className="text-lg">JD</span>
        </div>
      </div>
      <div>
        <div className="font-bold text-gray-900">Name</div>
        <div className="text-sm text-gray-500">Role/Location</div>
      </div>
    </div>
  </div>
</div>
```

### Pricing Cards
```jsx
{/* Standard pricing card */}
<div className="card bg-base-100 shadow-xl border-2 border-base-200 h-full">
  <div className="card-body">
    <div className="badge badge-ghost mb-2">TIER NAME</div>
    <div className="mb-4">
      <span className="text-4xl font-bold">$XX</span>
      <span className="text-sm opacity-70">/month</span>
    </div>
    <p className="text-sm text-gray-600 mb-6">Short description</p>
    <ul className="space-y-3 mb-6 flex-grow">
      {features.map(f => (
        <li className="flex gap-2 items-start">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{f}</span>
        </li>
      ))}
    </ul>
    <Link className="btn btn-outline btn-block border-2">Start Free Trial</Link>
  </div>
</div>

{/* Popular/highlighted pricing card */}
<div className="card shadow-2xl border-4 border-[#A5744A] bg-gradient-to-br from-amber-50 to-orange-50 transform md:scale-105 h-full">
  <div className="card-body">
    <div className="badge badge-primary mb-2 bg-[#A5744A] border-[#A5744A]">MOST POPULAR</div>
    {/* Same structure, primary button */}
    <Link className="btn btn-block bg-[#A5744A] hover:bg-[#8B6239] text-white border-0">
      Start Free Trial
    </Link>
  </div>
</div>
```

### Before/After Comparison
```jsx
<div className="grid md:grid-cols-2 gap-8">
  {/* Before - red */}
  <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-8">
    <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Before [Product]</h3>
    <div className="space-y-3">
      {problems.map(p => (
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-gray-700">{p}</span>
        </div>
      ))}
    </div>
    <div className="mt-6 pt-6 border-t border-red-200 text-center">
      <p className="text-red-700 font-semibold">Result: Negative outcome</p>
    </div>
  </div>

  {/* After - green */}
  <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
    <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">With [Product]</h3>
    <div className="space-y-3">
      {solutions.map(s => (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="text-gray-700">{s}</span>
        </div>
      ))}
    </div>
    <div className="mt-6 pt-6 border-t border-emerald-200 text-center">
      <p className="text-emerald-700 font-semibold">Result: Positive outcome</p>
    </div>
  </div>
</div>
```

### Guarantee Box
```jsx
<div className="bg-white border-4 border-emerald-400 rounded-2xl shadow-2xl p-8 text-center">
  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
  </div>
  <h2 className="text-3xl font-bold mb-4 text-gray-900">Guarantee Title</h2>
  <p className="text-xl mb-4 text-gray-700">Main promise text.</p>
  <p className="text-gray-600">Supporting text.</p>
</div>
```

### Footer
```jsx
<footer className="footer footer-center p-10 bg-base-300 text-base-content">
  <aside>
    <div className="flex items-center gap-2 font-bold text-xl mb-2">
      {/* Logo */}
    </div>
    <p className="max-w-md">Tagline</p>
    <div className="flex gap-4 mt-4">
      <Link href="/help" className="link link-hover text-sm">Help Center</Link>
      <Link href="/privacy" className="link link-hover text-sm">Privacy Policy</Link>
      <Link href="/terms" className="link link-hover text-sm">Terms of Service</Link>
    </div>
    <p className="text-sm opacity-70 mt-4">© 2025 Company. All rights reserved.</p>
  </aside>
</footer>
```

---

## Custom CSS (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  scroll-behavior: smooth !important;
}

@layer utilities {
  .btn-gradient {
    background-image: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
    background-size: 300% 300%;
    color: white;
  }

  .btn-gradient:hover {
    filter: saturate(1.2);
    animation: shimmer 3s ease-out infinite alternate;
  }
}

@keyframes shimmer {
  0% { background-position: 0 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@layer base {
  .btn {
    text-transform: capitalize;
  }
}
```

---

## Section Flow (Recommended Order)

1. **Header** - Logo, nav links, Sign In + Primary CTA
2. **Hero** - Headline, subhead, image, value props, CTAs, fine print
3. **Problem** - Emotional pain points with red cards
4. **How It Works** - 3-step solution with green/calm colors
5. **Differentiation** - What's included vs. not included
6. **Features** - Grid of feature cards with icons
7. **Before/After** - Side-by-side transformation
8. **Testimonials** - Social proof with quotes
9. **Feature Highlight** - Premium feature callout (optional)
10. **Pricing** - 3-tier pricing with popular highlighted
11. **Guarantee** - Risk reversal
12. **Final CTA** - Repeat hero CTA
13. **Footer** - Links, copyright

---

## Mobile Responsiveness

- Use `sm:`, `md:`, `lg:` prefixes for responsive sizing
- Hide navigation on mobile: `hidden md:flex`
- Stack buttons on mobile: `flex-col sm:flex-row`
- Adjust padding: `py-6 sm:py-8 lg:py-12`
- Scale text: `text-3xl sm:text-4xl lg:text-6xl`

---

## Icons Used (Lucide)

```javascript
import {
  MapPin,      // Location/routing features
  Shield,      // Protection/security
  Clock,       // Time-related
  Heart,       // Care/wellness
  CheckCircle2, // Positive/included
  XCircle,     // Negative/excluded
  X,           // Close/remove
  ChevronRight, // CTA arrows
  Zap,         // Speed/efficiency
  MessageSquare // Communication
} from "lucide-react";
```

---

## How to Use This Guide

When starting a new project, tell the AI:

> "Build the landing page following the design patterns in `/home/srdjank/code/groomroute/docs/LANDING_PAGE_DESIGN_GUIDE.md`. Use the same tech stack (Next.js, Tailwind, DaisyUI), color system, component patterns, and section structure. Adapt the content for [your product/niche]."

Or simply provide this file as context to the new project.
