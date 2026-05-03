const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const url = process.env.TURSO_DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const cleanUrl = url.replace(/['"]/g, '').split('?')[0];

const adapter = new PrismaLibSQL({
  url: cleanUrl,
  authToken: authToken?.replace(/['"]/g, ''),
});

const prisma = new PrismaClient({ adapter });

const mapCategory = (cat) => {
  if (cat === 'aircon') return 'AC';
  if (cat === 'refrigerator') return 'Fridge';
  if (cat === 'water_heater') return 'Heater';
  return 'Other';
};

const mapToModel = (item) => {
  const category = mapCategory(item.category);
  if (category === 'Heater' || category === 'Pump') return null;
  
  // Approximate engineering specifications based on typical wattage + category
  let coolingCapacityKjH = null;
  let eerRating = null;
  const wattage = Number(item.typical_wattage) || 0;

  if (category === 'AC') {
    // 1 HP roughly = 9000 kJ/h, typical wattage ~750w
    coolingCapacityKjH = (wattage / 750) * 9000;
    eerRating = coolingCapacityKjH / wattage; // Simplified EER
  } else if (category === 'Fridge') {
    // Cooling capacity for fridge loosely correlates to volume. 
    coolingCapacityKjH = wattage * 1.5; 
  }

  // Derive estimated price (for ROI simulator)
  let estimatedPricePhp = wattage * 30; // ₱30 per watt ballpark string
  
  return {
    brand: item.brand,
    modelNumber: item.model,
    category,
    wattage,
    coolingCapacityKjH,
    eerRating,
    estimatedPricePhp,
    sourceUrl: `https://www.google.com/search?q=${item.brand}+${item.model}+philippines`,
    modelYear: new Date().getFullYear() - Math.floor(Math.random() * 5), // last 5 years
  };
};

async function main() {
  console.log('🌱 Starting Master Appliance Catalog DB Seeding...\n');

  const jsonPath = path.join(process.cwd(), 'src', 'data', 'appliances-ph.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const catalog = JSON.parse(rawData);

  console.log(`🧹 Clearing existing ApplianceCatalog records...`);
  await prisma.applianceCatalog.deleteMany({});
  console.log(`✅ Cleared.`);

  console.log(`\n⏳ Inserting ${catalog.length} smart-mapped models...`);
  
  let successCount = 0;
  for (const item of catalog) {
    const data = mapToModel(item);
    if (!data) continue;
    try {
      await prisma.applianceCatalog.upsert({
        where: { modelNumber: data.modelNumber },
        update: data,
        create: data,
      });
      successCount++;
    } catch (e) {
      console.warn(`[WARN] Failed to insert ${data.brand} ${data.modelNumber}:`, e.message);
    }
  }

  console.log(`\n✅ Database seeding complete! Successfully registered ${successCount} models to Turso.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
