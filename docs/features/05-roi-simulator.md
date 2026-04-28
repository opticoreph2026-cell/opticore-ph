# Feature 05: ROI Simulator (Hardware Savings Simulator)

## 1. Context & Purpose
OptiCore PH provides an **ROI Simulator** to help users determine the exact break-even point when upgrading legacy hardware (e.g., standard air conditioners) to modern, energy-efficient equivalents (e.g., Inverter models). This calculation bridges the gap between hardware cost and energy savings, natively factoring in current local electricity rates.

## 2. Trigger
- Initiated by the user interacting with the "Simulator" module in the OptiCore PH dashboard.
- Uses standard PHP/kWh rates for ROI approximation.

## 3. Data Processing & Logic
1. **Inputs:**
   - Legacy Appliance Wattage
   - New Appliance Wattage
   - Usage (Hours per day)
   - Cost of New Hardware (PHP)
2. **Current Utility Rate:**
   - Automatically pulls the user's effective electricity rate (`kwh / bill_amount`) or falls back to a Philippine benchmark (e.g., ~11.5 PHP/kWh).
3. **Savings Calculation:**
   - Computes daily kWh difference: `((Legacy Wattage - New Wattage) * Hours) / 1000`.
   - Computes monthly savings: `Daily kWh difference * 30 * Effective Rate`.
4. **ROI Determination:**
   - Divide hardware cost by monthly savings to yield "Months to Payback".
   - Outputs a multi-year projection curve for visualization.

## 4. Output / Side Effects
- Client sees a breakdown of monthly savings, yearly savings, and total payback timeline.
- Generates data points used by Recharts in the frontend for ROI trajectory plotting.

## 5. Security & Tiers
- Available to all user tiers, but the "Pro" and "Business" plans can map exact dynamic rates, whereas the "Starter" plan may be limited to standard baseline estimates.
