# Feature 12: Admin Telemetry & Command Center

## 1. Context & Purpose
The **Admin Telemetry** layer provides platform operators with a high-level command center to monitor system health, revenue streams, and AI invocation limits.

## 2. Trigger
- Accessed via the `/admin` route.
- Fetches aggregated data through the `getAdminKPIs()` and `getSystemTelemetry()` database procedures.

## 3. Data Processing & Logic
1. **User Metrics:**
   - Aggregates total client counts, active subscriptions, and differentiates between Starter, Pro, and Business tiers.
2. **Financial Telemetry (MRR):**
   - Calculates Monthly Recurring Revenue (MRR) based on active active subscriptions minus administrative overrides.
3. **System Telemetry:**
   - Tracks total Gemini tokens consumed across all clients.
   - Monitors global AI scan counts against the infrastructure's absolute hard limits (e.g., 1M free tier tokens).
4. **Notifications / Webhooks:**
   - Captures PayMongo webhook events and translates them into real-time admin notifications (e.g., "Pro plan activated").

## 4. Output / Side Effects
- Renders KPI cards and growth charts on the admin dashboard.
- Serves as the central interface for identifying abuse (rate limiting anomalies) or system-wide database connection issues.

## 5. Security & Tiers
- **Strictly Role-Gated.** Only users with `role === 'admin'` can access the `/admin` routes.
- Unauthorized access is blocked by Next.js middleware and route-level authorization guards, forcing a redirect to the main dashboard or 404 gap.
