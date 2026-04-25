# Insight & Audit Engine

The **Audit Engine** ensures data integrity and provides deep historical context for all resource management activities within OptiCore.

## Key Capabilities
- **Complete Audit Trail**: Every data entry, scan, and system setting change is logged with a timestamp and user ID.
- **Trend Visualization**: Trailing 12-month analytics allow you to track the effectiveness of energy-saving interventions.
- **Reporting Hub**: Centralized location for generating summaries and viewing detailed historical logs.
- **Compliance Export**: (Planned) Generate professional PDF/PNG reports and certificates for energy efficiency compliance audits.

## Data Governance
- **Neural Verification**: AI checks ensure that all logged data is mathematically consistent.
- **Role-Based Visibility**: Ensures that sensitive billing data is only visible to authorized administrators.
- **Persistence**: Secure storage of all historical utility readings for long-term tracking.

## Deep Analysis & Debugging
### Backend (Intelligence)
- **Attribution Logic**: Implements a dual-stream engine that compares bill metrics against appliance theoreticals to isolate **Ghost Loads**.
- **AI Narrative**: Uses `gemini-1.5-flash` to generate personalized, actionable summaries based on calculated engineering deltas.

### Frontend (Implementation)
- **Visual Analytics**: Utilizes high-precision charts to reveal consumption spikes and leakage patterns over time.
- **Persistence**: Reports are cached in the database, allowing for rapid retrieval and comparison across different cycles.

### Web Design
- **Information Hierarchy**: Prioritizes "Severity" and "Estimated Savings" to drive immediate user action.
