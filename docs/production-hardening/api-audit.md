# API Route Method Audit - OptiCore PH

This document lists every API route identified in `src/app/api/` and confirms their exported HTTP methods against standard RESTful patterns.

## Audit Overview
- **Total Files**: 40
- **Status**: ✅ All methods confirmed valid or logically sound for action-based handlers.

---

## 1. Authentication & Security (src/app/api/auth)
| Route Path | Exported Methods | Contract Logic | Status |
| :--- | :--- | :--- | :--- |
| `/auth/login` | POST | Authenticates user; issues session. | ✅ |
| `/auth/signup` | POST | Registers new client account. | ✅ |
| `/auth/logout` | POST | Clears session cookies/DB tokens. | ✅ |
| `/auth/refresh` | POST, GET | POST: Rotation logic; GET: Redirect-based refresh. | ✅ |
| `/auth/me` | GET | Returns current session identity. | ✅ |
| `/auth/change-password` | POST | Updates password for authenticated user. | ✅ |
| `/auth/delete-account` | DELETE | Permanently removes user account. | ✅ |
| `/auth/verify` | GET | Token verification for email links. | ✅ |
| `/auth/forgot-password/request` | POST | Triggers reset email. | ✅ |
| `/auth/forgot-password/reset` | POST | Finalizes password reset. | ✅ |

## 2. Core Dashboard Intelligence (src/app/api/dashboard)
| Route Path | Exported Methods | Contract Logic | Status |
| :--- | :--- | :--- | :--- |
| `/dashboard/data` | GET, POST | GET: Data fetch; POST: Section dispatcher (RPC-style). | ✅ |
| `/dashboard/readings` | POST | Submits a new utility reading. | ✅ |
| `/dashboard/daily-readings` | GET, POST | GET: Fetch history; POST: Record daily usage. | ✅ |
| `/dashboard/appliances` | GET, POST, PUT, DELETE | Full CRUD for appliance profile. | ✅ |
| `/dashboard/properties` | GET, POST | Fetch/Create properties. | ✅ |
| `/dashboard/properties/[id]` | PATCH, DELETE | Update/Delete specific property. | ✅ |
| `/dashboard/providers` | GET, POST, PUT, DELETE | CRUD for custom providers. | ✅ |
| `/dashboard/attribution` | GET | Fetches energy/water discrepancy analysis. | ✅ |
| `/dashboard/forecast` | GET | Returns AI-generated consumption forecast. | ✅ |
| `/dashboard/grid-status` | GET | Returns real-time grid status (simulated). | ✅ |
| `/dashboard/lpg` | POST | Submits LPG tank replacement/depletion data. | ✅ |
| `/dashboard/export/csv` | GET | Generates downloadable CSV data. | ✅ |
| `/dashboard/catalog` | GET | Fetches Master Appliance Catalog data. | ✅ |
| `/dashboard/certification` | GET | Returns certification status/eligibility. | ✅ |
| `/dashboard/profile` | GET, PATCH | Fetch/Update client meta (name, avatar). | ✅ |

## 3. AI & Analysis Engines (src/app/api/ai)
| Route Path | Exported Methods | Contract Logic | Status |
| :--- | :--- | :--- | :--- |
| `/ai/scan` | POST | Vision-based meter parsing (Gemini). | ✅ |
| `/ai/parse-bill` | POST | PDF/Image bill parsing (Gemini). | ✅ |
| `/ai/acoustic` | POST | Acoustic leak detection analysis. | ✅ |
| `/ai/roi-simulator` | POST, GET | POST: Simulation; GET: Preset retrieval. | ✅ |
| `/report` | GET, POST | GET: Fetch latest; POST: Trigger generation. | ✅ |

## 4. Admin & Infrastructure (src/app/api/admin)
| Route Path | Exported Methods | Contract Logic | Status |
| :--- | :--- | :--- | :--- |
| `/admin/clients` | GET | Lists all system clients. | ✅ |
| `/admin/clients/[id]` | DELETE | Admin-forced account deletion. | ✅ |
| `/admin/clients/[id]/plan` | POST | Manual subscription override. | ✅ |
| `/admin/upgrade` | POST | Manual account promotion. | ✅ |
| `/admin/notifications` | GET, POST | System-wide admin broadcasts. | ✅ |
| `/admin/aggregate-rates` | POST | Triggers nationwide provider aggregation. | ✅ |
| `/admin/catalog/upload` | POST | Bulk CSV master catalog injection. | ✅ |
| `/webhooks/paymongo` | POST | Secure payment webhook handler. | ✅ |
| `/checkout` | POST | Initiates PayMongo checkout session. | ✅ |
| `/debug/db` | GET | Development environment data audit. | ✅ |

---
**Audit Conclusion**: All routes adhere to their intended functional methods. Routes using multiple methods (e.g., `refresh`, `report`, `data`) do so to accommodate Next.js specific patterns (redirections, action-dispatchers) while maintaining security and logic separation.
