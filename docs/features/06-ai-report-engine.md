# Feature 06: AI Report Engine

## 1. Context & Purpose
The **AI Report Engine** synthesizes all utility readings, detected anomalies, and appliance logs into a cohesive, natural-language executive summary. It translates raw meter data into actionable advice (e.g., identifying high standby consumption or predicting future bills).

## 2. Trigger
- **Automatic:** Triggered when a new bill is scanned via the `readings` API endpoint.
- **Manual:** Initiated via the "Generate Report" button on the reports view.

## 3. Data Processing & Logic
1. **Context Aggregation:**
   - Gathers the last 3-6 months of utility consumption for the active property.
   - Cross-references ghost load alerts, leak flags, and LPG depletion predictions.
2. **Gemini Invocation:**
   - Sends a robust prompt to the Google Gemini (`gemini-1.5-flash`) model containing the JSON structure of recent readings and known appliances.
3. **Synthesis Structure:**
   - Demands strict JSON output with fields: `summary` (short overview), `recommendations` (bullet points on how to save energy/water), and `estimated_savings` (numeric PHP value).
4. **Persistence:**
   - The generated intelligence is saved to the `AIReport` table linked to the `propertyId` and `clientId`.

## 4. Output / Side Effects
- Stores an AIReport record in the database.
- Broadcasts a dashboard notification indicating a new intelligence report is ready for viewing.
- For "Pro" users, generates a link to download the report as a PDF format (if applicable).

## 5. Security & Tiers
- Generation frequency is capped by the plan tier.
- Starter plan users have a strict quota limit, whereas Pro and Business users enjoy higher or unlimited monthly executions.
