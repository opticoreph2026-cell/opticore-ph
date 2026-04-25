const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(process.cwd(), 'models.json');

const acBrands = ["Carrier", "Panasonic", "LG", "Daikin", "Condura", "Samsung", "Kolin", "TCL", "Haier"];
const fridgeBrands = ["Panasonic", "LG", "Samsung", "Condura", "Whirlpool", "Sharp", "Fujidenzo", "Haier", "Beko"];
const heaterBrands = ["Champs", "Panasonic", "Rinnai", "Ariston", "Centon", "Joven"];
const pumpBrands = ["Grundfos", "Pedrollo", "Goulds", "Shakti", "Leo", "Wilo"];
const tvBrands = ["Samsung", "LG", "Sony", "TCL", "Hisense", "Panasonic"];
const washerBrands = ["Samsung", "LG", "Whirlpool", "Panasonic", "Sharp", "Beko"];

const mockData = [];

// Generate 100 ACs
for (let i = 1; i <= 100; i++) {
  const brand = acBrands[Math.floor(Math.random() * acBrands.length)];
  mockData.push({
    category: "AC",
    brand: brand,
    modelNumber: `${brand.substring(0, 3).toUpperCase()}-AC${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    pricePhp: Math.floor(Math.random() * (75000 - 18000 + 1) + 18000)
  });
}

// Generate 100 Fridges
for (let i = 1; i <= 100; i++) {
  const brand = fridgeBrands[Math.floor(Math.random() * fridgeBrands.length)];
  mockData.push({
    category: "Fridge",
    brand: brand,
    modelNumber: `${brand.substring(0, 3).toUpperCase()}-FR${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    pricePhp: Math.floor(Math.random() * (95000 - 12000 + 1) + 12000)
  });
}

// Generate 50 Heaters
for (let i = 1; i <= 50; i++) {
  const brand = heaterBrands[Math.floor(Math.random() * heaterBrands.length)];
  mockData.push({
    category: "Heater",
    brand: brand,
    modelNumber: `${brand.substring(0, 3).toUpperCase()}-HT${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    pricePhp: Math.floor(Math.random() * (25000 - 3000 + 1) + 3000)
  });
}

// Generate 50 Pumps
for (let i = 1; i <= 50; i++) {
  const brand = pumpBrands[Math.floor(Math.random() * pumpBrands.length)];
  mockData.push({
    category: "Pump",
    brand: brand,
    modelNumber: `${brand.substring(0, 3).toUpperCase()}-WP${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    pricePhp: Math.floor(Math.random() * (45000 - 8000 + 1) + 8000)
  });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockData, null, 2));
console.log(`[Success] Generated ${mockData.length} mock appliances in ${OUTPUT_FILE}`);
