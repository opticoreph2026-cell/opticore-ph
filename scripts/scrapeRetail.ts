import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

// Target URL placeholder
const TARGET_URL = 'https://example-ecommerce.ph/category/air-conditioners';
const OUTPUT_FILE = path.join(process.cwd(), 'models.json');

interface ScrapedModel {
  brand: string;
  modelNumber: string;
  pricePhp: number;
  category?: string;
}

/**
 * Scrapes retail pricing and models.
 * Designed to fail gracefully if the DOM structure unexpectedly mutates.
 */
async function scrapeRetail() {
  console.log(`[Scraper] Initializing retail extraction from: ${TARGET_URL}`);

  try {
    // Pipeline Bypass: Provide mock data if the placeholder URL is used
    if (TARGET_URL.includes('example-ecommerce.ph')) {
        console.log(`[Scraper] Placeholder URL detected. Generating 100 ACs and 100 Fridges for pipeline testing...`);
      
      const mockData: ScrapedModel[] = [];
      const acBrands = ["Carrier", "Panasonic", "LG", "Daikin", "Condura", "Samsung", "Kolin", "TCL", "Haier"];
      const fridgeBrands = ["Panasonic", "LG", "Samsung", "Condura", "Whirlpool", "Sharp", "Fujidenzo", "Haier", "Beko"];

      // Generate 100 ACs
      for (let i = 1; i <= 100; i++) {
        const brand = acBrands[Math.floor(Math.random() * acBrands.length)] || "Unknown";
        mockData.push({
          category: "AC",
          brand: brand,
          modelNumber: `${brand.substring(0, 3).toUpperCase()}-AC${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          pricePhp: Math.floor(Math.random() * (75000 - 18000 + 1) + 18000) // 18k to 75k
        });
      }

      // Generate 100 Fridges
      for (let i = 1; i <= 100; i++) {
        const brand = fridgeBrands[Math.floor(Math.random() * fridgeBrands.length)] || "Unknown";
        mockData.push({
          category: "Fridge",
          brand: brand,
          modelNumber: `${brand.substring(0, 3).toUpperCase()}-FR${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          pricePhp: Math.floor(Math.random() * (95000 - 12000 + 1) + 12000) // 12k to 95k
        });
      }

      const heaterBrands = ["Champs", "Panasonic", "Rinnai", "Ariston", "Centon", "Joven"];
      const pumpBrands = ["Grundfos", "Pedrollo", "Goulds", "Shakti", "Leo", "Wilo"];

      // Generate 50 Heaters
      for (let i = 1; i <= 50; i++) {
        const brand = heaterBrands[Math.floor(Math.random() * heaterBrands.length)] || "Unknown";
        mockData.push({
          category: "Heater",
          brand: brand,
          modelNumber: `${brand.substring(0, 3).toUpperCase()}-HT${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          pricePhp: Math.floor(Math.random() * (25000 - 3000 + 1) + 3000) // 3k to 25k
        });
      }

      // Generate 50 Pumps
      for (let i = 1; i <= 50; i++) {
        const brand = pumpBrands[Math.floor(Math.random() * pumpBrands.length)] || "Unknown";
        mockData.push({
          category: "Pump",
          brand: brand,
          modelNumber: `${brand.substring(0, 3).toUpperCase()}-WP${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          pricePhp: Math.floor(Math.random() * (45000 - 8000 + 1) + 8000) // 8k to 45k
        });
      }

      const tvBrands = ["Samsung", "LG", "Sony", "TCL", "Hisense", "Panasonic"];
      const washerBrands = ["Samsung", "LG", "Whirlpool", "Panasonic", "Sharp", "Beko"];

      // Generate 50 TVs
      for (let i = 1; i <= 50; i++) {
        const brand = tvBrands[Math.floor(Math.random() * tvBrands.length)] || "Unknown";
        mockData.push({
          category: "TV",
          brand: brand,
          modelNumber: `${brand.substring(0, 3).toUpperCase()}-TV${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          pricePhp: Math.floor(Math.random() * (120000 - 10000 + 1) + 10000) // 10k to 120k
        });
      }

      // Generate 50 Washers
      for (let i = 1; i <= 50; i++) {
        const brand = washerBrands[Math.floor(Math.random() * washerBrands.length)] || "Unknown";
        mockData.push({
          category: "Washer",
          brand: brand,
          modelNumber: `${brand.substring(0, 3).toUpperCase()}-WM${1000 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          pricePhp: Math.floor(Math.random() * (60000 - 9000 + 1) + 9000) // 9k to 60k
        });
      }
      
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockData, null, 2));
      console.log(`[Scraper][Success] Extracted ${mockData.length} mock appliances. Wrote to ${OUTPUT_FILE}`);
      return;
    }

    // Native fetch is available in Node 18+ (Next.js 14 environment)
    const response = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const extractedData: ScrapedModel[] = [];

    // --- DOM SELECTORS (PLACEHOLDERS) ---
    // Update these selectors based on the actual target HTML structure
    const ITEM_SELECTOR = '.product-item'; 
    const BRAND_SELECTOR = '.brand-name';
    const MODEL_SELECTOR = '.model-number';
    const PRICE_SELECTOR = '.price-display';

    const items = $(ITEM_SELECTOR);
    
    if (items.length === 0) {
      console.warn(`[Scraper][Warning] No items found using selector '${ITEM_SELECTOR}'. DOM structure may have changed.`);
    }

    items.each((_, el) => {
      try {
        const brand = $(el).find(BRAND_SELECTOR).text().trim();
        const modelNumber = $(el).find(MODEL_SELECTOR).text().trim();
        const priceText = $(el).find(PRICE_SELECTOR).text().trim();

        // Strip currency symbols and commas (e.g., "₱ 35,000.00" -> 35000.00)
        const pricePhp = parseFloat(priceText.replace(/[^0-9.-]+/g, ''));

        // Validation - discard incomplete mappings gracefully
        if (!brand || !modelNumber || isNaN(pricePhp)) {
          console.debug(`[Scraper][Skip] Invalid mapped data: ${brand} | ${modelNumber} | ${priceText}`);
          return; // Skip to next element
        }

        extractedData.push({ brand, modelNumber, pricePhp });
      } catch (err) {
        console.error(`[Scraper][Error] Failed to parse an element block:`, err);
        // Continue parsing next items (graceful degradation)
      }
    });

    // Write to models.json in root directory
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extractedData, null, 2));
    console.log(`[Scraper][Success] Extracted ${extractedData.length} appliances. Wrote to ${OUTPUT_FILE}`);

  } catch (error) {
    console.error(`[Scraper][FATAL] Core execution failed.`, error);
    process.exit(1);
  }
}

// Execute Script
scrapeRetail();
