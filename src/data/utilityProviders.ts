export const utilityProvidersData = {
  electric_du: [
    { code: 'MERALCO', name: 'Manila Electric Company' },
    { code: 'MORE_POWER', name: 'MORE Electric and Power Corporation' },
    { code: 'DLPC', name: 'Davao Light and Power Company' },
    { code: 'VECO', name: 'Visayan Electric Company' },
    { code: 'CEPALCO', name: 'Cagayan Electric Power and Light Company' }
  ],
  electric_coop: [
    { code: 'BENECO', name: 'Benguet Electric Cooperative' },
    { code: 'CEBECO_II', name: 'Cebu II Electric Cooperative' }
  ],
  water_concessionaire: [
    { code: 'MAYNILAD', name: 'Maynilad Water Services' },
    { code: 'MANILA_WATER', name: 'Manila Water Company' }
  ],
  water_district: [
    { code: 'MCWD', name: 'Metropolitan Cebu Water District' },
    { code: 'DCWD', name: 'Davao City Water District' }
  ]
}

export function getProviderName(code: string) {
  for (const category of Object.values(utilityProvidersData)) {
    const provider = category.find(p => p.code === code)
    if (provider) return provider.name
  }
  return code
}
