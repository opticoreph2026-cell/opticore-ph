import { NextResponse } from 'next/server';

export async function GET() {
  const currentHour = new Date().getHours();
  
  // Philippine Grid Peak Hours: Yellow/Red Alerts typically happen around 1-4PM during summer
  let status = 'NORMAL';
  let message = 'NGCP Grid Stable. Spot market rates normal. Safe to run heavy appliances.';
  let penalty = 0;
  
  // Simulate Yellow Alert during 2PM-4PM (14-16)
  if (currentHour >= 14 && currentHour <= 16) {
    status = 'YELLOW';
    message = '⚠️ NGCP Yellow Alert. Spot market surging. Pre-cool your house and turn off 2.5kW Inverters to save ₱450 today.';
    penalty = 40; // 40% price surge
  }
  // Simulate Red Alert during 1PM (13)
  else if (currentHour === 13) {
    status = 'RED';
    message = '🚨 NGCP Red Alert. Rolling blackouts imminent in your sector. Shift all heavy load immediately.';
    penalty = 100;
  }
  
  // For demonstration/investor pitch purposes, if it's NOT peak hours, we will force a YELLOW alert 
  // with 50% probability so they can see it working regardless of the time of day they test it.
  if (status === 'NORMAL') {
     const forceDemoAlert = Math.random() > 0.5;
     if (forceDemoAlert) {
        status = 'YELLOW';
        message = '⚠️ NGCP Yellow Alert (Demo). Spot market surging. Turn off your Inverter ACs now to save ₱450 today.';
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
