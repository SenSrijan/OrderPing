# OrderPing MVP Implementation Plan

## Phase 1: Project Foundation & Setup

### 1.1 Initialize Next.js 16 Project
```bash
npx create-next-app@latest orderping-v1 --typescript --tailwind --eslint --app --src-dir=false
cd orderping-v1
```

### 1.2 Install Dependencies
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-* lucide-react framer-motion
npm install class-variance-authority clsx tailwind-merge
npm install zod react-hook-form @hookform/resolvers
npm install date-fns recharts

# Dev dependencies  
npm install -D @types/node prettier eslint-config-prettier
```

### 1.3 Configure shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select textarea badge
npx shadcn-ui@latest add form dialog sheet tabs separator
```

## Phase 2: Core Infrastructure

### 2.1 Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GUPSHUP_API_KEY=your_gupshup_key
GUPSHUP_SOURCE_NUMBER=91XXXXXXXXXX
GUPSHUP_BASE_URL=https://api.gupshup.io/sm/api/v1

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 2.2 Supabase Client Configuration
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client with cookies
- `lib/supabase/types.ts` - Generated types from schema

### 2.3 Authentication Guard
- `lib/auth/guard.ts` - Route protection middleware
- Redirect logic for unauthenticated users

## Phase 3: Authentication & Workspace Management

### 3.1 Auth Pages
- `app/(auth)/sign-in/page.tsx` - Email/password login
- `app/(auth)/sign-up/page.tsx` - Registration with workspace creation
- `app/(auth)/layout.tsx` - Auth layout with branding

### 3.2 Workspace Bootstrap
- Server action to create workspace + owner membership
- Handle `profiles.active_workspace_id` assignment
- Respect RLS policies for workspace creation

## Phase 4: Dashboard Layout & Navigation

### 4.1 Dashboard Layout
- `app/(dashboard)/layout.tsx` - Main dashboard shell
- Sidebar navigation with workspace switcher
- Mobile-responsive hamburger menu
- Install PWA button in header

### 4.2 Design System Implementation
- Tailwind config with custom gradient tokens
- Component variants for status pills, KPI chips
- Framer Motion animation presets

## Phase 5: Orders Management Core

### 5.1 Orders List Page
- `app/(dashboard)/orders/page.tsx`
- Tabs: All/Received/Packed/Shipped/Delivered/Overdue
- Search by customer name, phone, order number
- Date filters (Today/7d/Custom range)
- Pagination with infinite scroll

### 5.2 Add Order Form
- `app/(dashboard)/orders/new/page.tsx`
- Single-screen form with validation
- Customer auto-complete/create
- E.164 phone validation
- Default ETA (+5 days)

### 5.3 Order Detail View
- `app/(dashboard)/orders/[id]/page.tsx`
- Status stepper with one-tap updates
- Timeline from order_events
- Resend message action

### 5.4 Server Actions
- `actions/orders.ts`:
  - `createOrder()` - Insert order + customer if needed
  - `updateOrderStatus()` - Status transitions
  - `exportOrdersCSV()` - Filtered export
- Cache invalidation with `revalidateTag()`

## Phase 6: WhatsApp Integration

### 6.1 Gupshup Provider Client
- `lib/providers/whatsapp/gupshup.ts`
- `sendTemplate()` - Template messages with params
- `sendText()` - Plain text messages
- Error handling for rate limits, opt-outs

### 6.2 Outbox Sender Job
- `app/api/jobs/send-whatsapp/route.ts`
- Process `message_outbox` queue (status='QUEUED')
- Exponential backoff for failures
- Update message status after send

### 6.3 Webhook Handlers
- `app/api/webhooks/gupshup/route.ts`:
  - DLR (Delivery Receipt) processing
  - STOP message handling (opt-out)
- `app/api/webhooks/razorpay/route.ts`:
  - Subscription status updates
  - Soft-lock on past_due

## Phase 7: Dashboard Home & KPIs

### 7.1 Dashboard Home
- `app/(dashboard)/page.tsx`
- KPI chips with animated counters:
  - Open Orders count
  - Overdue orders (expected_delivery_date < today)
  - Today's deliveries
- Quick action buttons
- Recent orders preview

### 7.2 Analytics Queries
- Server components for KPI calculation
- Cached queries with workspace scoping
- Real-time updates via Supabase subscriptions

## Phase 8: Settings & Configuration

### 8.1 Settings Page
- `app/(dashboard)/settings/page.tsx`
- Tabbed interface:
  - WhatsApp (source number, templates)
  - Templates (manage message_templates)
  - Billing (Razorpay subscription)
  - Team (workspace members)

### 8.2 Template Management
- CRUD for `message_templates` table
- Template preview with sample data
- Language selection (en/hi)

## Phase 9: PWA & Performance

### 9.1 PWA Configuration
- `public/manifest.webmanifest`
- Service worker for offline caching
- Install prompt component
- App icons (192x192, 512x512)

### 9.2 Performance Optimization
- Partial Prerendering (PPR) for lists
- Cache tags for granular invalidation
- Image optimization
- Bundle analysis

## Phase 10: UI Components Library

### 10.1 Reusable Components
- `components/kpi-chip.tsx` - Gradient border KPI cards
- `components/status-pill.tsx` - Order status indicators
- `components/order-card.tsx` - List item component
- `components/timeline.tsx` - Order events timeline
- `components/empty-state.tsx` - No data states

### 10.2 Form Components
- `components/form/phone-input.tsx` - E.164 validation
- `components/form/customer-select.tsx` - Autocomplete
- `components/form/date-picker.tsx` - ETA selection

## Phase 11: Testing & Quality

### 11.1 Unit Tests
- `tests/gupshup-payload.test.ts` - Provider integration
- `tests/orders-actions.test.ts` - Server actions
- `tests/auth-guard.test.ts` - Route protection

### 11.2 Quality Assurance
- ESLint + Prettier configuration
- TypeScript strict mode
- Accessibility testing (AA compliance)
- Lighthouse performance audit

## Phase 12: Deployment & Monitoring

### 12.1 Production Setup
- Vercel deployment configuration
- Environment variables setup
- Domain configuration
- SSL certificates

### 12.2 Monitoring
- Error tracking (Sentry optional)
- Performance monitoring
- Webhook delivery monitoring
- Database query optimization

## Implementation Timeline

**Week 1-2**: Phases 1-4 (Foundation, Auth, Layout)
**Week 3-4**: Phases 5-6 (Orders, WhatsApp)  
**Week 5**: Phases 7-8 (Dashboard, Settings)
**Week 6**: Phases 9-12 (PWA, Testing, Deployment)

## Key Technical Decisions

1. **Database**: Use existing schema as-is, respect all RLS policies
2. **Authentication**: Supabase Auth with email/password only
3. **State Management**: Server state via Server Actions, client state via React hooks
4. **Styling**: Tailwind + shadcn/ui with custom gradient tokens
5. **Caching**: Next.js cache tags with workspace-scoped invalidation
6. **Real-time**: Supabase subscriptions for order updates
7. **Mobile**: Mobile-first responsive design with PWA capabilities

## Success Metrics

- **Performance**: Lighthouse score ≥95 on mobile
- **Accessibility**: WCAG AA compliance
- **Functionality**: Complete order lifecycle with WhatsApp automation
- **UX**: Sub-200ms interactions, smooth animations
- **Security**: All data access through RLS, no service key exposure

This plan delivers a production-ready MVP that handles the complete order management workflow with automated WhatsApp notifications, while maintaining security, performance, and user experience standards.