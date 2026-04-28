# Feature 11: Predictive Forecast

## 1. Context & Purpose
The **Predictive Forecast** system performs timeseries analysis on historical utility data to predict the upcoming billing cycle's consumption and cost.

## 2. Trigger
- Accessed via the "Forecast" or "Analytics" tab on the dashboard.
- Explicitly triggered via `GET /api/dashboard/forecast`.

## 3. Data Processing & Logic
1. **Historical Indexing:**
   - Retrieves the past 6-12 months of readings.
   - Requires a minimum dataset (usually 3 months of consecutive data) to establish a baseline trend.
2. **AI Modeling:**
   - Injects the dataset into the `gemini-1.5-flash` model with instructions to act as a data scientist.
   - The model accounts for seasonal trends (e.g., increased AC usage in summer months).
3. **Forecasting Mechanics:**
   - Outputs a predicted range (low, expected, high) for the upcoming month's kWh and m3.
   - Computes expected bill amounts using the most recent effective rate.

## 4. Output / Side Effects
- Delivers a structured JSON forecast to the frontend to populate predictive charts.
- Identifies potential outliers (e.g., if predicted usage dramatically shifts from baseline).

## 5. Security & Tiers
- **Exclusively restricted to the "Business" plan.**
- Users on Starter or Pro tiers are gated and prompted to upgrade when attempting to access the predictive pipeline.
