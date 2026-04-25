# NGCP Grid Monitoring

OptiCore integrates with national energy grid data to provide real-time situational awareness and financial protection against spot-market price surges.

## Key Capabilities
- **Status Banners**: High-visibility alerts notify users when the grid is in "Yellow" or "Red" alert status.
- **Surge Penalty Calculator**: Automatically estimates the percentage increase in unbundled charges during grid instability.
- **Incident Protocol**: Provides actionable guidance (e.g., "Reduce non-essential loads") during power shortage warnings.
- **Visual Feedback**: Pulsing energy indicators and color-coded alerts (Amber for Warning, Rose for Critical).

## Alert Levels
- **Normal**: System operates within standard parameters.
- **Yellow**: Tight power supply; potential for spot-market price volatility.
- **Red**: Critical power deficiency; risk of rotating power outages and high surge penalties.

## Deep Analysis & Debugging
### Backend (Intelligence)
- **Simulation Engine**: Implemented a time-aware simulation that mimics real-world Philippine grid peak behaviors for predictable testing.
- **Data Model**: Returns structured `surgePenaltyPercent` to allow the frontend to calculate real-time cost impacts.

### Frontend (Implementation)
- **Visual Feedback**: Uses `AnimatePresence` and pulsing `lucide-react` icons to ensure alerts are impossible to miss.
- **Persistence**: Fetches status on every dashboard mount to ensure the administrator is never viewing stale grid data.

### Web Design
- **Color Semantics**: Strict adherence to grid alert colors (Amber/Rose) ensure consistency with industry standards.
