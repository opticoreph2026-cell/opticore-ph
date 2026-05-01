import { NextResponse } from 'next/server';

/**
 * GET /api/dashboard/grid-status
 *
 * Returns a deterministic grid status based on Philippine grid peak-hour heuristics.
 * This is a best-effort local estimate — NOT a live NGCP/ERC feed.
 * Peak hours: 1–4 PM daily, especially April–June (summer AC load).
 */
export async function GET() {
  const currentHour = new Date().getHours();
  
  let status = 'NORMAL';
  let message = 'Power grid is stable. Safe to run heavy appliances.';
  let surgePenaltyPercent = 0;
  
  // Red Alert: Critical peak (1 PM — hottest load hour in PH summer)
  if (currentHour === 13) {
    status = 'RED';
    message = 'Grid Critical: Supply is very tight. Unplug non-essential high-power devices to avoid interruptions.';
    surgePenaltyPercent = 100;
  }
  // Yellow Alert: High demand period (2–4 PM)
  else if (currentHour >= 14 && currentHour <= 16) {
    status = 'YELLOW';
    message = 'Grid Alert: High demand period. Electricity rates may be elevated. Reduce heavy appliance use to lower your next bill.';
    surgePenaltyPercent = 40;
  }

  return NextResponse.json({
    status,
    message,
    surgePenaltyPercent,
    timestamp: new Date().toISOString(),
  });
}
