# OptiCore PH — Elite AI-Powered Utility Bill Optimizer ⚡

> **Upload your electricity and water bills and let Google Gemini 2.5 Flash parse unbundled charges instantly. Precision Math, Weather Analytics & Hardware ROI.**

[![Built with Next.js 14](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Database By Turso](https://img.shields.io/badge/Turso-Edge_SQL-blue?logo=sqlite)](https://turso.tech)
[![Powered by Gemini](https://img.shields.io/badge/Google-Gemini_2.5_Flash-orange)](https://deepmind.google/technologies/gemini/)
[![PDPA Compliant](https://img.shields.io/badge/PDPA-2012%20Compliant-blue)](https://privacy.gov.ph)

---

## 1. Overview

OptiCore PH identifies anomalous utility consumption by deploying **Multimodal AI Analytics, Hardware ROI Projections, and Factual Real-Time Math computations**. 

The system operates natively entirely within the Next.js ecosystem utilizing Google's `gemini-2.5-flash` model for intelligent visual bill scanning and rapid `<2s` inference, eliminating heavy internal orchestration limits and manual data entry.

### Elite Feature Matrix
- **AI Bill Scanner** (PDF, PNG, JPG multimodal unbundled charge extraction)
- **High-End Engineering Dashboard** (Physics transitions, Tracking gradients, Monospace tabular data)
- **Financial ROI Simulator** (Hardware upgrade payback projections based on effective rate)
- **Appliance Phantom-Load Profiling**
- **Automated Gmail Digest Reports**

---

## 2. Tech Stack

| Layer             | Technology |
|-------------------|------------|
| Framework         | Next.js 14 (App Router, Edge Runtimes) |
| Styling           | Tailwind CSS — Premium Dark Amber Theme |
| Authentication    | `jose` JWT with Edge Middleware |
| Database          | **Turso (LibSQL via Prisma ORM)** |
| AI Engine         | **Google Gemini 2.5 Flash (@google/genai)** |
| Email Delivery    | Gmail REST API (OAuth2 secure delivery) |
| Payments          | PayMongo (cards, GCash, Maya) |

---

## 3. The Automation Pipeline 

We removed external dependencies (n8n, Tally) to boost raw speed and deployment economics. The OptiCore data pipeline operates instantaneously via Next.js Route Handlers:

1. **Submission:** User drops a PDF/Image of their VECO/Meralco bill into the native UI Drag-and-Drop Uploader.
2. **AI Layout Scanning:** A custom skeleton loader mimics the bill while Gemini 2.5 Flash extracts generation, transmission, and system loss charges.
3. **Native Math:** Edge API calculates exact factual effective rate (₱/kWh) dynamically.
4. **Appliance Context:** Prisma rapidly retrieves their logged appliances to cross-reference against phantom loads.
5. **Database Interlock:** Report generated concurrently while saving into Turso `AI Reports` table.
6. **Background Email:** Dispatches "Monthly Digest" via the Gmail REST API concurrently without blocking the client window.

---

## 4. Setup & Database

### Zero-Touch Schema (Prisma)
You do not need to manually configure Database tables anymore. 
The entire system schema pushes natively using:
```bash
npx prisma db push
```

### Environment Setup (`.env.local`)
```env
# TURSO DATABASE
TURSO_DATABASE_URL="libsql://...turso.io?authToken=..."
TURSO_AUTH_TOKEN="eyJ..."

# SECURITY
JWT_SECRET=super_secret_64
BCRYPT_ROUNDS=12

# API PLUGINS
GEMINI_API_KEY=AIza...
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_SENDER_EMAIL=opticoreph2026@gmail.com
```

### Running Locally
```bash
npm install
npm run dev
```

---

## 5. Pricing Tiers

1. **Starter (Free):** 1 Property, AI Basics, Phantom load detection, 5 Appliances.
2. **Pro (₱499/Mo):** Hardware ROI Simulator, Weather analytics, Unlimited Appliances, Monthly Digests.
3. **Business (₱2,499/Mo):** Predictive AI Forecasting, Max-Tiers Gemini 2.5 Analytics, Peer Benchmarking, Landlord Sub-metering.

*(UI features an interactive toggle calculating 20% annual discounts on the fly).*

---

## 6. Security & PDPA

OptiCore complies directly with the Philippine Data Privacy Act (RA 10173).
- Prisma ORM physically prevents SQL Injections natively.
- BCrypt Web-Crypto hashed authentications.
- Secure HttpOnly JWT mapping.
- Modal-based security protocols for password mutations.

**Contact:** opticoreph2026@gmail.com
