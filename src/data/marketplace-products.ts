export const marketplaceCategories = [
  { id: 'smart_monitoring', name: 'Smart Monitoring' },
  { id: 'appliances', name: 'Energy Efficient Appliances' },
  { id: 'lighting', name: 'LED Lighting' },
  { id: 'water_fixtures', name: 'Water Saving Fixtures' },
  { id: 'solar', name: 'Solar Solutions' },
  { id: 'backup_power', name: 'Backup Power' }
]

export function formatPriceRange(minCentavos: number, maxCentavos: number) {
  const min = minCentavos / 100
  const max = maxCentavos / 100
  if (min === max) return `₱${min.toLocaleString()}`
  return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`
}
