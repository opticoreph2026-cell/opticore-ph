export const applianceCategories = [
  { id: 'cooling', name: 'Cooling & AC' },
  { id: 'refrigeration', name: 'Refrigerators & Freezers' },
  { id: 'kitchen', name: 'Kitchen Appliances' },
  { id: 'laundry', name: 'Laundry & Cleaning' },
  { id: 'entertainment', name: 'TV & Entertainment' },
  { id: 'lighting', name: 'Lighting' },
  { id: 'water', name: 'Water Heating & Pumping' },
  { id: 'other', name: 'Other' }
]

export const commonAppliances = [
  { name: 'Split-type Inverter AC (1.0 HP)', category: 'cooling', defaultWattage: 750, defaultHours: 8 },
  { name: 'Window-type Non-Inverter AC (1.0 HP)', category: 'cooling', defaultWattage: 1000, defaultHours: 8 },
  { name: 'Electric Fan (Stand/Desk)', category: 'cooling', defaultWattage: 65, defaultHours: 12 },
  { name: 'Inverter Refrigerator (7-9 cu ft)', category: 'refrigeration', defaultWattage: 120, defaultHours: 24 },
  { name: 'Non-Inverter Refrigerator (7-9 cu ft)', category: 'refrigeration', defaultWattage: 180, defaultHours: 24 },
  { name: 'Rice Cooker', category: 'kitchen', defaultWattage: 400, defaultHours: 1 },
  { name: 'Microwave Oven', category: 'kitchen', defaultWattage: 1200, defaultHours: 0.5 },
  { name: 'Induction Cooker', category: 'kitchen', defaultWattage: 1500, defaultHours: 1 },
  { name: 'Washing Machine (Automatic)', category: 'laundry', defaultWattage: 500, defaultHours: 1 },
  { name: 'Washing Machine (Twin Tub)', category: 'laundry', defaultWattage: 350, defaultHours: 1 },
  { name: 'LED TV (32-43 inch)', category: 'entertainment', defaultWattage: 60, defaultHours: 6 },
  { name: 'LED Bulb', category: 'lighting', defaultWattage: 9, defaultHours: 8 },
  { name: 'Water Heater (Shower)', category: 'water', defaultWattage: 3500, defaultHours: 0.5 },
  { name: 'Water Pump (0.5 HP)', category: 'water', defaultWattage: 375, defaultHours: 1 }
]
