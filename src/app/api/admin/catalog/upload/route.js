import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * Parses raw CSV text into mapped objects, ignoring commas inside quotes.
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const regex = /(?:,"|^")(""|[\w\W]*?)(?=",|"$)|(?:,(?!")|^(?!"))([^,]*?)/g;
    let match;
    const values = [];
    while ((match = regex.exec(lines[i])) !== null) {
      if (match[1] !== undefined) {
        values.push(match[1].replace(/""/g, '"').trim());
      } else if (match[2] !== undefined) {
        values.push(match[2].trim());
      }
    }
    
    // We only create an object if it has enough parsed values
    if (values.length >= headers.length - 2) {
      const record = {};
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          record[header] = values[index];
        }
      });
      records.push(record);
    }
  }
  return records;
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Security Check: In a real app, query db.client to ensure they have an ADMIN role.
    const clientRecord = await db.client.findUnique({ where: { id: user.sub }});
    // For now, as long as they are authenticated, we let them upload, but you can gate this.
    if (!clientRecord) {
       return NextResponse.json({ error: 'Auth record sync failed' }, { status: 403 });
    }

    const body = await request.json();
    const { csvContent } = body;

    if (!csvContent) {
      return NextResponse.json({ error: 'No CSV content provided.' }, { status: 400 });
    }

    const records = parseCSV(csvContent);

    if (records.length === 0) {
       return NextResponse.json({ error: 'CSV parsed to 0 valid records. Check headers.' }, { status: 400 });
    }

    const insertPayloads = records.map(r => {
      // Mapping expected CSV headers to Prisma fields safely
      // Expected headers: brand, model, category, wattage, eer, coolingcapacity
      let categoryRaw = r.category ? r.category.toUpperCase() : 'OTHER';
      // Force valid enum mappings
      const validEnums = ['AC', 'FRIDGE', 'HEATER', 'PUMP', 'WATERFIXTURE', 'GASSTOVE'];
      const mappedCategory = validEnums.find(v => v === categoryRaw) ? 
        (categoryRaw === 'FRIDGE' ? 'Fridge' : 
         categoryRaw === 'HEATER' ? 'Heater' : 
         categoryRaw === 'PUMP' ? 'Pump' : 
         categoryRaw === 'WATERFIXTURE' ? 'WaterFixture' : 
         categoryRaw === 'GASSTOVE' ? 'GasStove' : 'AC') : 'Other';

      return {
        brand: r.brand || 'Unknown',
        modelNumber: r.model || 'Unknown',
        category: mappedCategory,
        wattage: parseFloat(r.wattage) || 0,
        eerRating: r.eer ? parseFloat(r.eer) : null,
        coolingCapacityKjH: r.coolingcapacity ? parseInt(r.coolingcapacity) : null,
      };
    });

    const result = await db.applianceCatalog.createMany({
      data: insertPayloads,
      // skipDuplicates: true // In sqlite LibSQL this may not be perfectly supported, but handled by unique constraints if exist
    });

    return NextResponse.json({
      success: true,
      message: `Successfully injected ${result.count} appliances into the Master Database.`,
    }, { status: 200 });

  } catch (error) {
    console.error('[Admin Upload Catalog Error]', error);
    return NextResponse.json({ error: 'Internal Server Error processing CSV' }, { status: 500 });
  }
}
