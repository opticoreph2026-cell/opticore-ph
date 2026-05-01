# OptiCore PH — System Architecture & Requirements

## 1. Executive Summary
OptiCore PH is an enterprise-grade energy intelligence system designed to provide high-precision monitoring, predictive analytics, and AI-driven utility management for Philippine consumers. It allows users to upload utility bills and uses Google Gemini 2.5 Flash to parse unbundled charges instantly, perform math computations, and provide hardware ROI and phantom-load profiling.

## 2. Technology Stack & Requirements

### Core Framework & Runtime
- **Framework**: Next.js 14 (App Router)
- **Runtime**: Edge Runtimes for fast API execution
- **Language**: TypeScript/JavaScript (Node.js environment)
- **Package Manager**: npm

### Database & ORM
- **Database**: Turso (LibSQL via `@libsql/client`)
- **ORM**: Prisma ORM 6.2.1 (`@prisma/client`, `@prisma/adapter-libsql`)

### AI & Integrations
- **AI Engine**: Google Gemini 2.5 Flash (`@google/genai`)
- **Email Delivery**: Gmail REST API (`googleapis`, `nodemailer`)
- **Payments**: PayMongo (Cards, GCash, Maya)

### Security & Authentication
- **Token Management**: JWT via `jose` (Edge Middleware)
- **Password Hashing**: `bcryptjs`
- **Compliance**: Philippine Data Privacy Act (RA 10173) compliant

### Frontend & UI/UX
- **Styling**: Tailwind CSS (Premium Dark Amber Theme, "Obsidian Design System")
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Data Fetching**: SWR
- **PDF/Image Generation**: `html2canvas`, `jspdf`, `html-to-image`

---

## 3. Application Architecture (Directory Structure)

OptiCore operates natively entirely within the Next.js App Router paradigm.

### Frontend Layers
- `src/app/`
  - `admin/`: Administrative dashboard and control panel.
  - `dashboard/`: Unified Command Center (Bento-Grid layout).
  - `login/` & `signup/` & `onboarding/`: Auth flows.
  - `p/`: Publicly accessible pages or property-specific routing.
  - `pricing/`: Subscription tier selections.
  - `privacy/` & `terms/`: Legal pages.
- `src/components/`
  - `admin/`: Admin-specific components.
  - `dashboard/`: Charts, cards, bento-grid widgets.
  - `landing/`: Landing page sections.
  - `providers/`: Context providers (e.g., Auth, Theme).
  - `ui/`: Reusable primitive components (buttons, inputs, modals).

### Backend Layers
- `src/app/api/` (Next.js Route Handlers)
  - `admin/`: Admin management endpoints.
  - `ai/`: Integration with Gemini for neural bill scanning.
  - `auth/`: Login, registration, token refresh, and verification.
  - `checkout/`: PayMongo payment processing.
  - `dashboard/`: Aggregation endpoints for dashboard metrics.
  - `report/`: PDF/AI report generation.
  - `webhooks/`: Webhook receivers for external services (e.g., payments).

### Middleware
- `src/middleware.js`: Handles Edge routing security, intercepting requests to validate JWTs and authorize user roles.

---

## 4. Data Architecture (Prisma Schema)

The database schema is highly relational, centering around the `Client`.

### Core Entities:
- **Client**: Represents users, storing auth details, plan tiers (starter, pro, business), quotas, and relationships to data.
- **Property**: Real estate units linked to clients (e.g., Main Home, Condo).
- **UtilityProvider**: Meralco, VECO, Water districts, storing base rates and benchmark averages.

### Telemetry & Readings:
- **UtilityReading**: Monthly/periodic bills. Contains manual or AI-scanned unbundled charges (generation, transmission, system loss, distribution, subsidies, taxes).
- **DailyMeterReading**: High-frequency interval tracking.
- **LPGReading**: Tracks gas usage and tank replacement dates.
- **Appliance**: Represents hardware assets inside a property (Wattage, hours, ROI data).
- **ApplianceCatalog**: Baseline database for standard appliances, brands, eerRatings, and prices.

### Operations & Intelligence:
- **AIReport**: Stores the generated summaries, recommendations, and estimated savings from Gemini AI.
- **Alert**: Notification system for ghost loads, leaks, rate spikes, and grid alerts.
- **AdminNotification**: Internal system notifications for admins.
- **Transaction**: Payment ledger for subscriptions and upgrades.
- **VerificationToken** / **RefreshToken**: Auth security mechanisms.

---

## 5. System Workflows

### The Automation Pipeline
1. **Submission**: User uploads a PDF/Image of a utility bill via a Drag-and-Drop Uploader.
2. **AI Layout Scanning**: Gemini 2.5 Flash processes the bill multimodally, extracting generation, transmission, and system loss charges.
3. **Native Math**: Edge API accurately computes factual effective rates (₱/kWh) dynamically.
4. **Appliance Context**: Prisma fetches logged appliances to cross-reference against phantom loads and usage.
5. **Database Interlock**: Results are written concurrently to the Turso `UtilityReading` and `AIReport` tables.
6. **Background Email**: Dispatches a "Monthly Digest" via the Gmail REST API concurrently without blocking the client thread.

### NGCP Grid Monitoring Workflow
- Tracks national grid status ("Red" or "Yellow" alerts).
- Predicts dynamic surge penalties.
- Displays glassmorphic banners for load shedding alerts.

---

## 6. Infrastructure & Environment Requirements

To execute or deploy the OptiCore PH architecture, the following environment variables are required in `.env` / `.env.local`:

```env
# TURSO DATABASE
TURSO_DATABASE_URL="libsql://[your-database].turso.io?authToken=..."
TURSO_AUTH_TOKEN="eyJ..."

# SECURITY
JWT_SECRET="super_secret_64"
BCRYPT_ROUNDS=12

# API PLUGINS
GEMINI_API_KEY="AIza..."
GMAIL_CLIENT_ID="..."
GMAIL_CLIENT_SECRET="..."
GMAIL_REFRESH_TOKEN="..."
GMAIL_SENDER_EMAIL="opticoreph2026@gmail.com"

# NEXT.JS & PAYMENT CONFIG
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PAYMONGO_SECRET_KEY="..."
```

### Build & Deploy Instructions
1. Initialize the database schema via Turso and Prisma: `npx prisma db push`
2. Install dependencies: `npm install`
3. Run local dev server: `npm run dev`
4. Deploy: Standard Next.js Vercel deployment with Edge runtime compatibility (using `@libsql/client` for Turso).
