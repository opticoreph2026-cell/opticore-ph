import { NextResponse } from 'next/server';

export async function GET() {
  const currentHour = new Date().getHours();
  
  // Philippine Grid Peak Hours: Yellow/Red Alerts typically happen around 1-4PM during summer
  let status = 'NORMAL';
  let message = 'Power Grid is Stable. Utility rates are normal. Safe to run heavy appliances.';
  let penalty = 0;
  
  // Simulate Yellow Alert during 2PM-4PM (14-16)
  if (currentHour >= 14 && currentHour <= 16) {
    status = 'YELLOW';
    message = '⚠️ Grid Alert: High Demand. Rates are currently higher. Turn off heavy cooling to save money today.';
    penalty = 40; // 40% price surge
  }
  // Simulate Red Alert during 1PM (13)
  else if (currentHour === 13) {
    status = 'RED';
    message = '🚨 Grid Alert: Critical Supply. Power interruptions may occur. Please unplug non-essential high-power devices.';
    penalty = 100;
  }
  
  // For demonstration/investor pitch purposes, if it's NOT peak hours, we will force a YELLOW alert 
  // with 50% probability so they can see it working regardless of the time of day they test it.
  if (status === 'NORMAL') {
     const forceDemoAlert = Math.random() > 0.5;
     if (forceDemoAlert) {
        status = 'YELLOW';
        message = '⚠️ Grid Alert: High Demand. Rates are slightly higher right now. Reducing usage now helps lower your next bill.';
        penalty = 35;
     }
  }

  return NextResponse.json({
    status,
    message,
    surgePenaltyPercent: penalty,
    timestamp: new Date().toISOString()
  });
}
