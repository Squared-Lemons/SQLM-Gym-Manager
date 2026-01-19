# Project Brief: Gym Management System

## The Idea

A complete SaaS platform for gym owners to manage their business, members, classes, and personal training services. Two separate web applications (owner-facing and member-facing) share a single API and database, enabling gym owners to run multiple locations while members interact with their specific gym.

## Target Users

### Gym Owners / Club Owners
- Small to medium gym owners managing 1-5 locations
- Need to reduce admin time and streamline operations
- Want a single dashboard for all their locations
- Need member management, class scheduling, PT tracking

### Gym Members
- People with gym memberships
- Want to book classes, view schedules, check membership status
- Need QR code for quick check-in at the gym
- May book personal training sessions

## Core Features (Version 1)

### Owner App

1. **Business Onboarding** - Create business profile, add first gym location
2. **Gym Management** - Add/edit locations, hours, facilities, activate/deactivate
3. **Member Management** - Add members, assign plans, track membership dates
4. **QR Check-in System** - Generate unique QR codes, scan for entry, track attendance
5. **Class Management** - Create class types, schedule classes, assign instructors
6. **Class Bookings** - Members book via member app, owners see bookings/attendance
7. **PT Management** - Add trainers, set availability, create packages
8. **PT Sessions** - Schedule sessions, track completions
9. **Subscription Plans** - Create membership tiers, set pricing
10. **Payment Tracking** - Record payments, view history (Stripe scaffolded)

### Member App

1. **Member Onboarding** - Sign up, link to gym
2. **Dashboard** - View membership status, upcoming classes, QR code
3. **Class Booking** - Browse schedule, book classes, cancel bookings
4. **PT Booking** - View trainer availability, book sessions
5. **Profile** - Update contact info, view payment history
6. **QR Code** - Display for gym check-in

## Future Features (Later Versions)

- **Waitlist Management** - Auto-promote when spots open
- **Payment Plans** - Full Stripe subscription management
- **Analytics Dashboard** - Attendance trends, revenue reports
- **Mobile Apps** - Native iOS/Android
- **Notifications** - Email/push for bookings, reminders
- **Multi-currency** - Support for international gyms

## Technical Decisions

### Architecture: Monorepo with Shared Backend
**Rationale:** Two apps (owner, member) need different UIs but share data. Monorepo allows code sharing (UI components, types, database) while keeping apps deployable independently.

### Platform: Next.js 14+ (App Router)
**Rationale:** Server components for performance, API routes for backend, excellent TypeScript support, easy deployment to Vercel.

### Authentication: Better Auth with Organizations
**Rationale:** Built-in multi-tenancy support via organizations plugin. Handles owner vs member roles. Supports social login (Google) and email/password.

### Database: SQLite with Drizzle ORM
**Rationale:** Simple to start, fast, single-file database. Easy to migrate to PostgreSQL later if needed. Drizzle provides type-safe queries.

### Styling: shadcn/ui + Tailwind CSS
**Rationale:** Theme support built-in (dark/light mode), accessible components, consistent design system across both apps.

### Payments: Stripe (Scaffolded)
**Rationale:** Industry standard for SaaS payments. Scaffold webhooks and basic integration now, wire up subscription plans in v2.

## Data Requirements

### Core Entities

```
Business (tenant)
├── Gyms (locations)
│   ├── Members
│   │   ├── Subscriptions
│   │   ├── CheckIns
│   │   └── ClassBookings
│   ├── Classes
│   │   └── ClassSchedules
│   ├── Trainers
│   │   ├── Availability
│   │   └── PTPackages
│   └── PTSessions
└── SubscriptionPlans
```

### Key Relationships
- Business has many Gyms (multi-location)
- Gym has many Members (scoped to location)
- Member belongs to one Gym
- Owner (user) belongs to one Business
- All queries scoped by tenant (businessId or gymId)

## Security Model

### Authentication
- Single auth system (Better Auth)
- Roles: `owner`, `member`, `trainer`
- Organizations plugin for business/gym scoping

### API Security
```
Request → Auth Middleware → Role Check → Tenant Scope → Handler
```

1. **Auth Middleware** - Validates session
2. **Role Check** - Route requires owner/member/trainer
3. **Tenant Scope** - Auto-inject businessId/gymId into queries

### Route Protection
| Route Pattern | Access |
|---------------|--------|
| `/api/owner/*` | Owners only, scoped to their business |
| `/api/member/*` | Members only, scoped to their gym |
| `/api/shared/*` | Both, role-based filtering |

### Data Isolation
- No raw IDs in client requests - derive from session
- Foreign keys enforce relationships
- Middleware rejects cross-tenant access

## UI/UX Notes

### Owner App
- Dashboard-style layout with sidebar navigation
- Quick stats: active members, today's classes, revenue
- Theme support (light/dark)
- Responsive but desktop-primary

### Member App
- Mobile-first responsive design
- Bottom navigation on mobile
- QR code prominently displayed
- Class schedule as primary feature
- Theme support matching owner app

### Shared Design System
- Common UI components in `packages/ui`
- Consistent color palette and typography
- shadcn/ui as base component library

## Integrations

### Stripe (v1 - Scaffolded)
- Webhook endpoint for payment events
- Basic customer creation
- Payment recording

### Stripe (v2 - Full)
- Subscription management
- Plan creation via API
- Billing portal

### Future
- Email (Resend/SendGrid) for notifications
- QR code scanner integration
- Calendar sync (Google Calendar)

## Out of Scope (v1)

- Native mobile apps
- Real-time notifications/push
- Advanced analytics/reporting
- Multi-currency support
- Inventory management
- Equipment tracking
- Staff scheduling beyond trainers
- Marketing tools

## Open Questions

1. **QR Code Scanning** - Use device camera in member app, or dedicated scanner hardware?
2. **Trainer Auth** - Do trainers get owner app access or separate app?
3. **Multi-gym Members** - Can a member belong to multiple gyms under same business?
4. **Booking Limits** - How many classes can a member book in advance?
