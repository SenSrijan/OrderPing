# OrderPing - WhatsApp Order Management

A production-ready MVP for small Indian business owners to manage orders with automated WhatsApp notifications.

## Features

- **Order Management**: Create, track, and update order status (Received → Packed → Shipped → Delivered)
- **WhatsApp Automation**: Automatic message sending via Gupshup on order creation and status changes
- **Multi-tenancy**: Workspace-based isolation with Row Level Security (RLS)
- **PWA Support**: Installable mobile-first progressive web app
- **Real-time Updates**: Live order status updates and notifications
- **Secure**: Authentication via Supabase with proper access controls

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, RLS)
- **WhatsApp**: Gupshup API integration
- **Payments**: Razorpay Subscriptions
- **UI**: shadcn/ui components, Framer Motion animations
- **PWA**: Service worker, offline support, installable

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account and project
- Gupshup WhatsApp Business API account
- Razorpay account (for payments)

### Environment Setup

1. Copy `.env.local` and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gupshup WhatsApp
GUPSHUP_API_KEY=your_gupshup_key
GUPSHUP_SOURCE_NUMBER=91XXXXXXXXXX
GUPSHUP_BASE_URL=https://api.gupshup.io/sm/api/v1

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Database Setup

1. Run the SQL files in your Supabase SQL editor:
   - `schema.sql` - Creates tables, triggers, and functions
   - `rls.sql` - Sets up Row Level Security policies
   - `seeds.sql` - Optional demo data (update OWNER_UUID first)

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/
├── (auth)/                 # Authentication pages
│   ├── sign-in/
│   └── sign-up/
├── (dashboard)/            # Main dashboard
│   ├── orders/            # Order management
│   │   ├── new/          # Add order form
│   │   └── [id]/         # Order details
│   └── settings/         # Workspace settings
├── api/
│   ├── webhooks/         # Gupshup & Razorpay webhooks
│   └── jobs/             # Background jobs
actions/                  # Server Actions
├── orders.ts            # Order CRUD operations
components/              # Reusable UI components
├── kpi-chip.tsx        # Animated KPI cards
├── status-pill.tsx     # Order status indicators
├── empty-state.tsx     # No data states
lib/
├── supabase/           # Database clients
├── providers/          # External API clients
│   └── whatsapp/      # Gupshup integration
├── auth/              # Authentication guards
└── utils/             # Utility functions
```

## Key Features Implementation

### Order Workflow
1. **Create Order**: Form validation, customer creation, order insertion
2. **Auto-messaging**: Database triggers queue WhatsApp messages
3. **Status Updates**: One-click status progression with notifications
4. **Timeline**: Complete audit trail of order events

### WhatsApp Integration
- **Template Messages**: Structured messages for order updates
- **Delivery Receipts**: Webhook handling for message status
- **Opt-out Handling**: STOP message processing
- **Rate Limiting**: Exponential backoff for API limits

### Security & Multi-tenancy
- **RLS Policies**: All data scoped to workspace membership
- **Authentication**: Supabase Auth with email/password
- **API Security**: Webhook signature verification
- **Data Isolation**: Complete workspace separation

### Performance
- **Partial Prerendering**: Fast page loads with PPR
- **Cache Tags**: Granular cache invalidation
- **Optimistic Updates**: Immediate UI feedback
- **Mobile-first**: Responsive design with PWA capabilities

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## Webhooks Setup

### Gupshup Webhook
- URL: `https://yourdomain.com/api/webhooks/gupshup`
- Events: Message delivery, incoming messages

### Razorpay Webhook  
- URL: `https://yourdomain.com/api/webhooks/razorpay`
- Events: Subscription updates, invoice events

## Background Jobs

The WhatsApp sender processes queued messages via Supabase Edge Function:
- **Edge Function**: `supabase/functions/send-whatsapp/index.ts`
- **API Route**: `/api/jobs/send-whatsapp` (fallback for local development)
- **Schedule**: Every minute via pg_cron
- **Handles**: Rate limiting, retries, error logging

### Deploying Edge Function
```bash
# Install Supabase CLI
npm install -g supabase

# Run deployment script
bash deploy-edge-function.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@orderping.com or create an issue on GitHub.