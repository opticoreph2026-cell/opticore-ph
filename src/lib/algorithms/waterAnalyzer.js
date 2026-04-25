import { db } from '../db';

/**
 * Deterministic Algorithm: Water Leak Detector 
 * Zero AI Cost. Looks at 90-day trailing averages vs current month
 * to flag potential invisible leaks (toilets, underground pipes).
 */
export async function analyzeWaterUsage(clientId, propertyId) {
  try {
    // Fetch last 4 water readings (current + 3 previous for 90-day avg)
    const recentReadings = await db.utilityReading.findMany({
      where: { 
        clientId, 
        propertyId, 
        m3Used: { gt: 0 } // Only readings with water data
      },
      orderBy: { readingDate: 'desc' },
      take: 4
    });

    if (recentReadings.length < 2) return null; // Not enough data for baseline

    const currentReading = recentReadings[0];
    const historicalReadings = recentReadings.slice(1);
    
    // Strict Statistical Mathematics: Calculate Standard Deviation (σ) of historical usage
    const totalHistorical = historicalReadings.reduce((sum, r) => sum + r.m3Used, 0);
    const avgHistorical = totalHistorical / historicalReadings.length;

    const variance = historicalReadings.reduce((sum, r) => sum + Math.pow(r.m3Used - avgHistorical, 2), 0) / historicalReadings.length;
    const stdDev = Math.sqrt(variance);

    // Calculate Dynamic Threshold: Average + 1.25σ
    // We enforce a minimum floor of a 10% increase to prevent micro-fluctuation triggers if stdDev is near 0.
    const thresholdByStdev = avgHistorical + (1.25 * stdDev);
    const thresholdByFloor = avgHistorical * 1.10;
    const spikeThreshold = Math.max(thresholdByStdev, thresholdByFloor);

    // Guard against zero average (e.g. only one historical reading with 0 m3)
    if (avgHistorical <= 0) return { hasLeak: false, jump: 0 };

    // Deviation based on pure percentage for logging
    const percentageJump = (((currentReading.m3Used - avgHistorical) / avgHistorical) * 100).toFixed(0);

    if (currentReading.m3Used > spikeThreshold) {
      
      // Determine if they recently logged a new WaterFixture
      const recentFixtures = await db.appliance.count({
        where: {
          clientId,
          propertyId,
          category: 'WaterFixture',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      });

      if (recentFixtures === 0) {
        // Unexplained spike! Trigger critical alert.
        const msg = `Water consumption spiked by ${percentageJump}% (${currentReading.m3Used} m³) compared to your 90-day average without any new fixtures logged. Check toilets and pipes for hidden leaks immediately.`;
        
        // Prevent dupes
        const existingAlert = await db.alert.findFirst({
          where: { clientId, message: msg, isRead: false }
        });

        if (!existingAlert) {
          await db.alert.create({
            data: {
              clientId,
              title: "Critical Water Spike Detected",
              message: msg,
              severity: "critical"
            }
          });
        }
        
        return { hasLeak: true, jump: percentageJump, message: msg };
      }
    }
    
    return { hasLeak: false, jump: 0 };
  } catch (error) {
    console.error('[Water Analyzer Error]', error);
    return null;
  }
}
