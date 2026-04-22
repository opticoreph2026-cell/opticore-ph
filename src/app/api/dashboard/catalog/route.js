import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/dashboard/catalog
 * 
 * Returns the full master appliance catalog for search and matching.
 * Includes wattage, cooling capacity, and EER data.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const catalog = await db.applianceCatalog.findMany({
      orderBy: [
        { category: 'asc' },
        { brand: 'asc' }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      count: catalog.length,
      data: catalog 
    });

  } catch (error) {
    console.error('[API Catalog] Error:', error);
    return NextResponse.json(
      { error: "AI_LIMIT", message: "Service busy" }, // Standardized SRE error
      { status: 500 }
    );
  }
}
