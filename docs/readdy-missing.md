# Readdy Design — Missing Items

> Tracking parts of the Readdy reference site that still need real data/content.
> Update these once data becomes available.

## About Page (`/about`)

| Section | Status | Notes |
|---|---|---|
| Hero gradient heading | ✅ Done | Readdy-style badge + large heading + subtitle |
| Stats / counters row | ❌ Removed per request | Was: 5+ Years, 50+ Projects, 3 Provinces, 2 Partners |
| Founder card | 🟡 Placeholder | Image at `/julius-placeholder.png` — swap with real photo |
| Partners section | ✅ Done | Uses i18n messages — update in admin when partner data changes |
| Mission + Territories | ✅ Done | Side-by-side layout matching Readdy |
| CTA | ✅ Done | Book Free Site Visit button |

## Products Page (`/products`)

| Section | Status | Notes |
|---|---|---|
| Section icons | ✅ Done | Zap/Battery/Package icons per section |
| Inverter cards | ✅ Done | Data from `neovolt-products.ts` |
| Battery cards | ✅ Done | Data from `neovolt-products.ts` |
| Bundle presets | ✅ Done | Data from `neovolt-products.ts` |
| Product images | ❌ Missing | No product images available — use placeholder or add later |

## Contact Page (`/contact`)

| Section | Status | Notes |
|---|---|---|
| Hero badge + heading | ✅ Done | Readdy-style |
| Contact form | ✅ Done | Uses `ContactForm` component |
| Phone / Email / Hours cards | ✅ Done | |
| RME badge | ✅ Done | |

## Landing Page

| Section | Status | Notes |
|---|---|---|
| Featured Products | ✅ Done | 3-column grid with inverters, batteries, presets |
| Calculator dark mode text | ✅ Done | Added `dark:` variants for inputs, buttons, suggestions |
| FAQ accordion | ✅ Done | Fetches from `GET /api/faq?locale=...` — seed has 8 entries |
| Calculator → Get in Touch CTA | ✅ Done | Pre-fills bill/province/type via query params |

## Light/Dark Mode

| Item | Status | Notes |
|---|---|---|
| Theme toggle in Navbar | ✅ Done | Sun/moon icon right of Sign In |
| `.dark` class support | ✅ Done | Background/foreground invert, primary/accent stay same |
| OKLCH color system | ✅ Done | Full Readdy-compatible token set |
| Input contrast in dark mode | ✅ Done | `dark:bg-background-800/40` + `dark:text-foreground-300` |

## Footer

| Item | Status | Notes |
|---|---|---|
| Grid 5 columns | ✅ Fixed | Brand (2 cols) + Solutions + Company + Support |
| Portal links in Support | ✅ Done | Customer + Partner Portal with auth redirect |
| Separate Portals column | ❌ Removed | Merged into Support |
