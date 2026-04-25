# Engineering Asset Inventory

The **Asset Inventory** is a managed hardware registry where administrators can track every appliance and device contributing to the network's energy load.

## Key Capabilities
- **Hardware Registry**: Comprehensive database of all electrical and water-consuming assets.
- **ROI Engine**: Simulate the financial impact of upgrading older appliances to modern, high-efficiency versions.
- **Efficiency Grading**: Automatically assigns efficiency scores based on runtime data and manufacturer specifications.
- **Payload Mapping**: Links specific appliances to total consumption peaks identified in the Command Center.

## Management Features
- **Add/Edit Assets**: Easy-to-use forms for registering new hardware.
- **Usage Metrics**: Track estimated hours of operation per device.
- **Maintenance Lifecycle**: Track the age and maintenance history of critical equipment.

## Deep Analysis & Debugging
### Backend (Intelligence)
- **Engineering Math**: Uses `engineeringMath.ts` to calculate theoretical kWh based on appliance-specific efficiency curves and inverter status.
- **Data Persistence**: Full CRUD operations with strict data validation to prevent mathematical drift.

### Frontend (Implementation)
- **Delete Protection**: Replaced native browser alerts with a custom **Obsidian Confirmation Modal** to prevent accidental data loss.
- **State Sync**: Real-time updates to the dashboard metrics when assets are modified, ensuring accurate "Managed Asset" counts.

### Web Design
- **Micro-Interactions**: Hover-tracking spotlight effects on each appliance card for a premium, interactive hardware dashboard feel.
