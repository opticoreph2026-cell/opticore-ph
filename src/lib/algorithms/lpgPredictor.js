import { db } from '../db';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';

/**
 * Deterministic Algorithm: LPG Tank Depletion Predictor
 * Uses historical burn rate to forecast exactly when tank runs dry.
 */
export async function predictLPGDepletion(clientId, propertyId) {
  try {
    const lpgHistory = await db.lPGReading.findMany({
      where: { clientId, propertyId },
      orderBy: { replacementDate: 'asc' }
    });

    if (lpgHistory.length === 0) return null;

    // Strict Thermodynamics logic. NO generic placeholders.
    // If we do not have enough log points, we CANNOT guess depletion unless they registered a stove.
    // Base formula for LPG: 0.072 kg/h is the consumption of 1 kW of burner capacity.
    
    // Default burn rate will only be established mathematically.
    let dailyBurnRateKg = null;

    // If we have history >= 2, calculate true custom burn rate using actual depletion
    if (lpgHistory.length >= 2) {
      let totalDepletedKg = 0;
      let totalDays = 0;

      for (let i = 0; i < lpgHistory.length - 1; i++) {
        const currentTank = lpgHistory[i];
        const nextTank = lpgHistory[i + 1];
        
        const daysLasted = differenceInDays(
          parseISO(nextTank.replacementDate), 
          parseISO(currentTank.replacementDate)
        );

        if (daysLasted > 0) {
          totalDepletedKg += currentTank.tankSizeKg;
          totalDays += daysLasted;
        }
      }

      if (totalDays > 0) {
        dailyBurnRateKg = totalDepletedKg / totalDays;
      }
    } else {
      // Not enough history, we must calculate based on engineering parameters.
      // Search for GasStove in user's appliances
      const gasStoves = await db.appliance.findMany({
        where: { clientId, propertyId, category: 'GasStove' }
      });

      if (gasStoves && gasStoves.length > 0) {
        // Compute Burn Rate = Sum of (kW Rating * hoursPerDay * 0.072 kg/h)
        let totalDailyBurn = 0;
        gasStoves.forEach(stove => {
          const thermalCapacityKW = stove.wattage || 2.5; // fallback strictly to 2.5kW standard burner if missing
          const usageHours = stove.hoursPerDay || 1;
          totalDailyBurn += (thermalCapacityKW * usageHours * 0.072) * stove.quantity;
        });
        dailyBurnRateKg = totalDailyBurn;
      } else {
        // Uncalibrated status: No historical data AND no registered appliances = No generic guessing allowed.
        return { 
          status: 'insufficient_data', 
          message: 'Uncalibrated: Please log your Gas Stove in Appliances to calibrate, or submit 2 logs.',
          activeTank: lpgHistory[lpgHistory.length - 1]
        };
      }
    }

    // Guard: if burn rate couldn't be established (all consecutive logs on same day), abort cleanly
    if (!dailyBurnRateKg || dailyBurnRateKg <= 0) {
      return {
        status: 'insufficient_data',
        message: 'Cannot calculate burn rate: all LPG logs have the same replacement date. Please log tanks on different days.',
        activeTank: lpgHistory[lpgHistory.length - 1]
      };
    }

    // Determine current active tank
    const currentTank = lpgHistory[lpgHistory.length - 1];
    
    if (currentTank.isEmpty) {
      return { status: 'empty', activeTank: null };
    }

    const daysSincePurchase = differenceInDays(new Date(), parseISO(currentTank.replacementDate));
    const kgBurnedSoFar = daysSincePurchase * dailyBurnRateKg;
    const kgRemaining = currentTank.tankSizeKg - kgBurnedSoFar;

    // If burned > size, it's effectively empty
    if (kgRemaining <= 0) {
      return { 
        status: 'critical', 
        daysLeft: 0, 
        estimatedDate: format(new Date(), 'MMM dd, yyyy'),
        percentLeft: 0
      };
    }

    const daysLeft = Math.floor(kgRemaining / dailyBurnRateKg);
    const estimatedDate = format(addDays(new Date(), daysLeft), 'MMM dd, yyyy');
    const percentLeft = Math.max(0, Math.min(100, (kgRemaining / currentTank.tankSizeKg) * 100));

    return {
      status: percentLeft <= 15 ? 'warning' : 'healthy',
      daysLeft,
      estimatedDate,
      percentLeft,
      currentTank
    };

  } catch (error) {
    console.error('[LPG Predictor Error]', error);
    return null;
  }
}
