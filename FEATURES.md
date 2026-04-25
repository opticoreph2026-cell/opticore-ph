# OptiCore Intelligence Platform — Feature Catalog

OptiCore is an enterprise-grade energy intelligence system designed to provide high-precision monitoring, predictive analytics, and AI-driven utility management.

---

## 1. Unified Command Center
The central hub for all utility intelligence. 
- **Bento-Grid Architecture**: A 2025-standard responsive layout that prioritizes the most critical data points.
- **Consumption Protocol**: High-fidelity AreaCharts showing real-time and historical consumption trends.
- **Load Attribution**: Donut chart visualizations showing energy distribution across Cooling, Lighting, and Appliances.
- **Staggered Motion**: Physics-based animations that ensure a smooth, professional data reveal upon entry.

## 2. Neural Bill Scanning
Advanced OCR powered by **Gemini 2.5 Flash** for rapid data entry.
- **Autonomous Extraction**: Extracts kwh used, billing dates, and total amounts directly from PDF or Image uploads.
- **Anomaly Detection**: Compares scanned data against historical hardware meter logs to identify billing discrepancies.
- **Provider Intelligence**: Automatically detects the utility provider (e.g., Meralco) and adjusts the parsing logic accordingly.

## 3. Engineering Asset Inventory
A managed hardware registry for every appliance in your network.
- **Hardware Profile**: Track wattage, usage hours, and efficiency ratings for every device.
- **ROI Simulation**: Predict the payback period when upgrading to inverter-grade or high-efficiency hardware.
- **Maintenance Alerts**: Intelligent reminders based on device runtime and efficiency degradation.

## 4. NGCP Grid Monitoring
Real-time integration with national grid status.
- **Dynamic Surge Penalty**: Automatically calculates potential price surges during "Red" or "Yellow" grid alerts.
- **Incident Protocol**: High-visibility glassmorphic banners that notify administrators of grid instability.
- **Load Shedding Alerts**: Early warning system for potential power interruptions.

## 5. Insight & Audit Engine
Deep-dive reporting and audit trails for compliance and optimization.
- **Audit Trail**: A complete log of every reading, scan, and system adjustment made by administrators.
- **Exportable Intelligence**: (Planned) Support for PNG/PDF certificate generation for energy efficiency compliance.
- **Historical Analysis**: 12-month trailing averages to track the impact of energy-saving strategies.

## 6. Premium Obsidian Design System
A state-of-the-art visual language built for professionals.
- **Spotlight Interaction**: Cards that track mouse movement with a subtle, energy-focused glow.
- **Mesh Gradients**: Ambient animated backgrounds that provide depth and a premium feel.
- **Glassmorphism**: Ultra-refined backdrop blurs and subtle borders that mimic high-end hardware interfaces.
- **High-Contrast Typography**: Uses **Outfit** and **Inter** font families for maximum readability and a bold, authoritative look.

---

## Explore Detailed Feature Guides
- [**Unified Command Center**](./docs/features/command-center.md)
- [**Neural Bill Scanning**](./docs/features/neural-scan.md)
- [**Engineering Asset Inventory**](./docs/features/asset-inventory.md)
- [**NGCP Grid Monitoring**](./docs/features/grid-monitoring.md)
- [**Insight & Audit Engine**](./docs/features/audit-engine.md)
- [**Premium Obsidian Design System**](./docs/features/design-system.md)

---

### Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Intelligence**: Google Gemini AI (Vision/Flash)
- **Database**: Prisma ORM with PostgreSQL
- **Motion**: Framer Motion & Tailwind CSS
- **Visualization**: Recharts High-Fidelity API
