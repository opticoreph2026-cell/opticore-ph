export const NEOVOLT_INVERTERS_SINGLE = [
  { sku: 'BW-INV-SPH3.6K', output: '3.68 kVA', maxPv: '7.36 kW', backup: '7.36 kVA' },
  { sku: 'BW-INV-SPH5K', output: '5.0 kVA', maxPv: '10.0 kW', backup: '10.0 kVA' },
  { sku: 'BW-INV-SPH6K', output: '6.0 kVA', maxPv: '12.0 kW', backup: '12.0 kVA' },
  { sku: 'BW-INV-SPH8K', output: '8.0 kVA', maxPv: '16.0 kW', backup: '16.0 kVA' },
] as const;

export const NEOVOLT_INVERTERS_THREE = [
  { sku: 'BW-INV-TPH4K', output: '4.0 kVA', maxPv: '8.0 kW' },
  { sku: 'BW-INV-TPH6K', output: '6.0 kVA', maxPv: '12.0 kW' },
  { sku: 'BW-INV-TPH8K', output: '8.0 kVA', maxPv: '16.0 kW' },
  { sku: 'BW-INV-TPH10K', output: '10.0 kVA', maxPv: '20.0 kW' },
  { sku: 'BW-INV-TPH12K', output: '12.0 kVA', maxPv: '24.0 kW' },
  { sku: 'BW-INV-TPH15K', output: '15.0 kVA', maxPv: '30.0 kW' },
] as const;

export const NEOVOLT_BATTERIES = [
  { sku: 'BW-BAT-4.8S', usable: '4.57 kWh', voltage: '48V', cycles: '6,000+' },
  { sku: 'BW-BAT-9.6P', usable: '9.12 kWh', voltage: '96V', cycles: '6,000+' },
  { sku: 'BW-BAT-10.1P', usable: '9.6 kWh', voltage: '96V', cycles: '8,000' },
] as const;

export const SYSTEM_PRESETS = [
  {
    name: 'Small Residential (1–2 BR)',
    inverter: 'BW-INV-SPH3.6K',
    battery: '1× BW-BAT-4.8S',
    storage: '4.57 kWh',
    pv: '3.0–4.0 kWp',
  },
  {
    name: 'Standard Residential (3–4 BR)',
    inverter: 'BW-INV-SPH5K',
    battery: '1× BW-BAT-10.1P',
    storage: '9.6 kWh',
    pv: '4.0–6.0 kWp',
  },
  {
    name: 'Premium Residential',
    inverter: 'BW-INV-SPH5K',
    battery: '2× BW-BAT-10.1P',
    storage: '19.2 kWh',
    pv: '6.0–10.0 kWp',
  },
  {
    name: 'Medium Commercial (3-ph)',
    inverter: 'BW-INV-TPH10K',
    battery: '2× BW-BAT-9.6P',
    storage: '18.24 kWh',
    pv: '10.0–15.0 kWp',
  },
] as const;
