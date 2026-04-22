import { db } from '../db';

/**
 * Deterministic Algorithm: Nationwide Provider Aggregator
 * Crowdsources utility benchmark rates natively from all scanned bills.
 */
export async function aggregateProviderBenchmarking() {
  try {
    // 1. Fetch all distinctly detected providers with more than 3 scans
    // We run raw group-by to find the average effective rate per provider
    const aggregatedRates = await db.utilityReading.groupBy({
      by: ['providerDetected'],
      _avg: {
        effectiveRate: true
      },
      _count: {
        id: true
      },
      where: {
        providerDetected: { not: null },
        effectiveRate: { gt: 0, lt: 50 }, // Sanity bounds (no PHP > 50/kWh)
        sourceType: 'ai_scan' 
      }
    });

    if (!aggregatedRates || aggregatedRates.length === 0) return null;

    // 2. Upsert these crowdsourced averages into the Master Catalog
    let updatedCount = 0;
    
    for (const group of aggregatedRates) {
      if (group._count.id >= 3 && group.providerDetected) { // At least 3 scans to trust it
        
        const officialName = group.providerDetected.toUpperCase().trim();
        const avgRate = Number((group._avg.effectiveRate || 0).toFixed(4));
        
        // Find existing provider or create a new nationwide entry
        const existingProvider = await db.utilityProvider.findFirst({
          where: { name: officialName }
        });

        if (existingProvider) {
          await db.utilityProvider.update({
            where: { id: existingProvider.id },
            data: { benchmarkAvg: avgRate }
          });
        } else {
          await db.utilityProvider.create({
            data: {
              name: officialName,
              type: "electric", // assume electric by default, can be parsed later
              benchmarkAvg: avgRate,
              baseRate: avgRate
            }
          });
        }
        updatedCount++;
      }
    }

    return { success: true, updatedProviders: updatedCount };
  } catch (error) {
    console.error('[Provider Aggregator Error]', error);
    return null;
  }
}
