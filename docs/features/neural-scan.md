# Neural Bill Scanning

OptiCore leverages **Gemini 1.5 Flash** (Vision AI) to automate the digitization of physical utility bills, eliminating manual entry errors and saving administrative time.

## Key Capabilities
- **OCR Extraction**: Automatically reads kWh used, Gross Bill amount, and Billing Period dates from images or PDFs.
- **Neural Verification**: Validates scanned data against historical hardware logs to flag significant deviations or billing errors.
- **Provider Detection**: Recognizes the utility provider (e.g., MERALCO) and applies specific parsing rules for unbundled charges.
- **Restricted Processing**: To conserve AI resources, scanning is currently optimized for electricity bills, with water bills handled via a high-precision manual entry form.

## Workflow
1. **Upload**: Select an image or PDF of your bill.
2. **Analysis**: The system routes the file through the Gemini Vision API.
3. **Verification**: Review the extracted data in the "Verify Metrics" screen.
4. **Synchronization**: Confirm to save the data to the central database.

## Deep Analysis & Debugging
### Backend (Intelligence)
- **Model Stability**: Corrected a model name mismatch, stabilizing the engine on `gemini-1.5-flash` for production reliability.
- **Constraint Enforcement**: Implemented a "Hardware Required" gate to ensure contextual data is available for ghost-load detection.

### Frontend (Implementation)
- **Animations**: Custom "Neural Scan" pulsing effect during AI processing for visual feedback.
- **Error Handling**: Comprehensive retry logic and user-friendly error messages for unreadable documents or API limits.

### Web Design
- **UX Pattern**: Multi-step verification flow ensures 100% data accuracy before committing any entry to the database.
