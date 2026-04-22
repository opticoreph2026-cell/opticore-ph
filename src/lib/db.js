import 'server-only';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import path from 'path';

let rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN?.replace(/['"]/g, '');

// Defensive: Some environments might set these to the literal string "undefined"
if (rawUrl === 'undefined' || !rawUrl) {
  rawUrl = 'file:./dev.db';
}

// Strip surrounding quotes that may appear in .env values
const cleanUrl = rawUrl.replace(/['"]/g, '').split('?')[0];

// ─── URL resolution ────────────────────────────────────────────────────────────
// libsql on Windows hangs when given a *relative* file: path (e.g. file:./dev.db).
// Fix: always pass a fully-qualified absolute file: URL to the adapter.
function resolveDbUrl(url) {
  if (url && url.startsWith('file:') && !url.startsWith('file:///') && !url.startsWith('file://')) {
    const filePath = url.replace(/^file:/, '');
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    
    // On Windows, drive letters like C:\ should be converted to file:C:/ to be safe with all driver versions
    const normalizedPath = absPath.replace(/\\/g, '/');
    const finalUrl = `file:${normalizedPath}`; 
    
    return finalUrl;
  }
  return url;
}

const resolvedUrl = resolveDbUrl(cleanUrl);

// AGGRESSIVE FIX: Inject the resolved URL back into process.env to satisfy internal Prisma/libsql checks
if (typeof resolvedUrl === 'string' && resolvedUrl !== 'undefined') {
  process.env.DATABASE_URL = resolvedUrl;
  process.env.TURSO_DATABASE_URL = resolvedUrl;
}

// Debug logging (development only)
if (process.env.NODE_ENV === 'development') {
  console.log(`[OptiCore DB] EXPLICIT ENV SET: ${process.env.DATABASE_URL}`);
}

// Debug logging (development only)
if (process.env.NODE_ENV === 'development') {
  console.log(`[OptiCore DB] Initializing connection to: ${resolvedUrl}`);
}

function makeClient() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[OptiCore DB] [makeClient] Initializing with URL string: "${resolvedUrl}"`);
  }

  if (!resolvedUrl || resolvedUrl === 'undefined') {
    throw new Error('[OptiCore DB] DATABASE_URL is undefined or invalid.');
  }
  
  // In Prisma 7, we pass the config object to the PrismaLibSql factory
  // We MUST include the authToken for Turso/Cloud connections
  const adapter = new PrismaLibSql({ 
    url: resolvedUrl,
    authToken: authToken 
  });
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Fixed: Using a new unique key for the brute-force fix
const GLOBAL_PRISMA_KEY = 'prisma_v7_bruteforce_v1';
const globalForPrisma = globalThis;

if (!globalForPrisma[GLOBAL_PRISMA_KEY]) {
  globalForPrisma[GLOBAL_PRISMA_KEY] = makeClient();
}

export const db = globalForPrisma[GLOBAL_PRISMA_KEY];
if (process.env.NODE_ENV !== 'production') globalForPrisma[GLOBAL_PRISMA_KEY] = db;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export async function getClientByEmail(email) {
  return db.client.findUnique({ where: { email: email.toLowerCase() } });
}

export async function getClientById(id) {
  return db.client.findUnique({ where: { id } });
}

export async function listAllClients(options = {}) {
  return db.client.findMany({
    where: { role: 'client' },
    orderBy: { createdAt: 'desc' },
    take: options.maxRecords || 100,
  });
}

export async function setClientPlanTier(id, tier, subscriptionId = null) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30); // 30-day monthly renewal

  return db.client.update({
    where: { id },
    data: { 
      planTier: tier,
      planExpiry: expiry,
      subscriptionId: subscriptionId
    },
  });
}

export async function setOnboardingComplete(id) {
  return db.client.update({
    where: { id },
    data: { onboardingComplete: true },
  });
}

export async function updateClientPasswordById(id, passwordHash) {
  return db.client.update({
    where: { id },
    data: { passwordHash },
  });
}

export async function updateClientPasswordByEmail(email, passwordHash) {
  return db.client.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash },
  });
}

export async function incrementClientScanQuota(id) {
  return db.client.update({
    where: { id },
    data: { scanCount: { increment: 1 } },
  });
}

export async function resetClientScanQuota(id) {
  return db.client.update({
    where: { id },
    data: { scanCount: 0, lastScanReset: new Date() },
  });
}

export async function createNewClientRecord(data) {
  return db.client.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.password_hash,
      electricityProviderId: data.electricity_provider_id || '',
      waterProviderId: data.water_provider_id || '',
      applianceCount: data.appliance_count || 0,
      consentGiven: true,
      onboardingComplete: false,
    },
  });
}

export async function deleteClient(id) {
  return db.client.delete({ where: { id } });
}

export async function updateClientProfile(id, data) {
  const fields = {};
  if (data.applianceCount !== undefined) fields.applianceCount = Number(data.applianceCount);
  if (data.name !== undefined) fields.name = data.name;
  
  return db.client.update({
    where: { id },
    data: fields,
  });
}

export async function updateClientSettings(id, data) {
  const patch = {};
  if (data.electricProvider !== undefined) patch.electricityProviderId = data.electricProvider;
  if (data.waterProvider !== undefined) patch.waterProviderId = data.waterProvider;
  if (data.emailAlertsEnabled !== undefined) patch.emailAlertsEnabled = data.emailAlertsEnabled;

  return db.client.update({
    where: { id },
    data: patch,
  });
}

// ─── Properties ─────────────────────────────────────────────────────────────
export async function getPropertiesByClient(clientId) {
  return db.property.findMany({
    where: { clientId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });
}

export async function getActiveProperty(clientId) {
  const props = await getPropertiesByClient(clientId);
  return props.find(p => p.isDefault) || props[0] || null;
}

export async function ensureDefaultProperty(clientId) {
  let property = await getActiveProperty(clientId);
  if (!property) {
    property = await createProperty(clientId, { name: 'Main Home', isDefault: true });
  }
  return property;
}

export async function migrateLegacyDataToProperty(clientId, propertyId) {
  // Safe migration of existing propertyId=null records to the assigned property
  await Promise.all([
    db.utilityReading.updateMany({
      where: { clientId, propertyId: null },
      data: { propertyId },
    }),
    db.appliance.updateMany({
      where: { clientId, propertyId: null },
      data: { propertyId },
    }),
    db.aIReport.updateMany({
      where: { clientId, propertyId: null },
      data: { propertyId },
    }),
  ]);
}

export async function createProperty(clientId, data) {
  // If this is the first property or marked default, reset others
  if (data.isDefault) {
    await db.property.updateMany({
      where: { clientId },
      data: { isDefault: false },
    });
  }
  return db.property.create({
    data: {
      clientId,
      name: data.name,
      address: data.address || null,
      electricityProviderId: data.electricityProviderId || null,
      waterProviderId: data.waterProviderId || null,
      isDefault: data.isDefault ?? false,
    },
  });
}

export async function updateProperty(propertyId, clientId, data) {
  const record = await db.property.findUnique({ where: { id: propertyId } });
  if (!record) throw new Error('Property not found.');
  if (record.clientId !== clientId) throw new Error('Forbidden.');

  if (data.isDefault) {
    await db.property.updateMany({
      where: { clientId, NOT: { id: propertyId } },
      data: { isDefault: false },
    });
  }

  return db.property.update({
    where: { id: propertyId },
    data: {
      name: data.name ?? record.name,
      address: data.address ?? record.address,
      electricityProviderId: data.electricityProviderId ?? record.electricityProviderId,
      waterProviderId: data.waterProviderId ?? record.waterProviderId,
      isDefault: data.isDefault ?? record.isDefault,
    },
  });
}

export async function deleteProperty(propertyId, clientId) {
  const record = await db.property.findUnique({ where: { id: propertyId } });
  if (!record) throw new Error('Property not found.');
  if (record.clientId !== clientId) throw new Error('Forbidden.');
  return db.property.delete({ where: { id: propertyId } });
}

// ─── Utility Readings ────────────────────────────────────────────────────────
export async function getReadingsByClient(clientId, propertyId) {
  return db.utilityReading.findMany({
    where: { 
      clientId,
      ...(propertyId ? { propertyId } : {})
    },
    orderBy: { readingDate: 'desc' },
    take: 24,
  });
}

export async function createReading(data) {
  const kwh = Number(data.kwh_used || 0);
  const bill = Number(data.bill_amount_electric || 0);

  return db.utilityReading.create({
    data: {
      clientId:            data.client_id,
      propertyId:          data.property_id || null,
      kwhUsed:             kwh,
      m3Used:              Number(data.m3_used || 0),
      billAmountElectric:  bill,
      billAmountWater:     Number(data.bill_amount_water || 0),
      readingDate:         data.reading_date,

      // Unbundled charges (all optional, populated by Gemini PDF parsing)
      generationCharge:    data.generation_charge   != null ? Number(data.generation_charge)   : null,
      transmissionCharge:  data.transmission_charge != null ? Number(data.transmission_charge) : null,
      systemLoss:          data.system_loss         != null ? Number(data.system_loss)         : null,
      distributionCharge:  data.distribution_charge != null ? Number(data.distribution_charge) : null,
      subsidies:           data.subsidies           != null ? Number(data.subsidies)           : null,
      governmentTax:       data.government_tax      != null ? Number(data.government_tax)      : null,
      vat:                 data.vat                 != null ? Number(data.vat)                 : null,
      otherCharges:        data.other_charges       != null ? Number(data.other_charges)       : null,
      effectiveRate:       kwh > 0 ? Number((bill / kwh).toFixed(4)) : null,

      // Source metadata
      sourceType:          data.source_type         || 'manual',
      providerDetected:    data.provider_detected   || null,
      billingPeriod:       data.billing_period      || null,
    },
  });
}

// ─── AI Reports ──────────────────────────────────────────────────────────────
export async function getLatestReport(clientId) {
  return db.aIReport.findFirst({
    where: { clientId },
    orderBy: { generatedAt: 'desc' },
  });
}

export async function getReportsByClient(clientId, propertyId) {
  return db.aIReport.findMany({
    where: { 
      clientId,
      ...(propertyId ? { propertyId } : {})
    },
    orderBy: { generatedAt: 'desc' },
    take: 12,
  });
}

export async function createReport(data) {
  return db.aIReport.create({
    data: {
      clientId: data.client_id,
      propertyId: data.property_id || null,
      summary: data.summary,
      recommendations: data.recommendations,
      estimatedSavings: Number(data.estimated_savings || 0),
      providerContext: data.provider_context,
      pdfUrl: data.pdf_url || null,
    },
  });
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export async function getAlertsByClient(clientId) {
  return db.alert.findMany({
    where: { clientId, isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function markAlertRead(alertId, clientId) {
  const record = await db.alert.findUnique({ where: { id: alertId } });
  if (!record) throw new Error('Alert not found.');
  if (record.clientId !== clientId) throw new Error('Forbidden.');

  return db.alert.update({
    where: { id: alertId },
    data: { isRead: true },
  });
}

export async function listAllAlerts() {
  return db.alert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function createAlert(data) {
  return db.alert.create({
    data: {
      clientId: data.client_id,
      title: data.title,
      message: data.message,
      severity: data.severity || 'info',
    },
  });
}

// ─── Appliances ──────────────────────────────────────────────────────────────
export async function getAppliancesByClient(clientId, propertyId) {
  return db.appliance.findMany({
    where: { 
      clientId,
      ...(propertyId ? { propertyId } : {})
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAppliance(data) {
  return db.appliance.create({
    data: {
      clientId: data.client_id,
      propertyId: data.property_id || null,
      name: data.name || '',
      category: data.category || 'other',
      brand: data.brand || '',
      model: data.model || '',
      year: data.year ? Number(data.year) : null,
      wattage: data.wattage ? Number(data.wattage) : null,
      hoursPerDay: data.hours_per_day ? Number(data.hours_per_day) : null,
      energyRating: data.energy_rating || 'not-rated',
      notes: data.notes || '',
      quantity: data.quantity ? Number(data.quantity) : 1,
    },
  });
}

export async function updateAppliance(applianceId, clientId, data) {
  const record = await db.appliance.findUnique({ where: { id: applianceId } });
  if (!record) throw new Error('Appliance not found.');
  if (record.clientId !== clientId) throw new Error('Forbidden.');

  const fields = {};
  if (data.name !== undefined) fields.name = data.name;
  if (data.category !== undefined) fields.category = data.category;
  if (data.brand !== undefined) fields.brand = data.brand;
  if (data.model !== undefined) fields.model = data.model;
  if (data.year !== undefined) fields.year = data.year ? Number(data.year) : null;
  if (data.wattage !== undefined) fields.wattage = data.wattage ? Number(data.wattage) : null;
  if (data.hours_per_day !== undefined) fields.hoursPerDay = data.hours_per_day ? Number(data.hours_per_day) : null;
  if (data.energy_rating !== undefined) fields.energyRating = data.energy_rating;
  if (data.notes !== undefined) fields.notes = data.notes;
  if (data.quantity !== undefined) fields.quantity = Number(data.quantity || 1);

  return db.appliance.update({
    where: { id: applianceId },
    data: fields,
  });
}

export async function deleteAppliance(applianceId, clientId) {
  const record = await db.appliance.findUnique({ where: { id: applianceId } });
  if (!record) throw new Error('Appliance not found.');
  if (record.clientId !== clientId) throw new Error('Forbidden.');
  return db.appliance.delete({ where: { id: applianceId } });
}

// ─── Utility Providers ───────────────────────────────────────────────────────
export async function listProviders(type = null) {
  const where = type ? { type } : {};
  return db.utilityProvider.findMany({
    where,
    orderBy: { name: 'asc' },
  });
}

export async function createProvider(data) {
  return db.utilityProvider.create({
    data: {
      name: data.name,
      type: data.type,
      region: data.region || '',
      baseRate: Number(data.baseRate || 0),
      benchmarkAvg: Number(data.benchmarkAvg || 0),
      logoUrl: data.logoUrl || null,
      website: data.website || null,
    },
  });
}

export async function updateProvider(id, data) {
  return db.utilityProvider.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      region: data.region || '',
      baseRate: Number(data.baseRate || 0),
      benchmarkAvg: Number(data.benchmarkAvg || 0),
      logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
      website: data.website !== undefined ? data.website : undefined,
    },
  });
}

export async function deleteProvider(id) {
  return db.utilityProvider.delete({ where: { id } });
}

// Admin stats
export async function getAdminKPIs() {
  const [totalClients, starter, pro, business, totalReports, activeAlerts] = await Promise.all([
    db.client.count({ where: { role: 'client' } }),
    db.client.count({ where: { role: 'client', planTier: 'starter' } }),
    db.client.count({ where: { role: 'client', planTier: 'pro' } }),
    db.client.count({ where: { role: 'client', planTier: 'business' } }),
    db.aIReport.count(),
    db.alert.count({ where: { isRead: false } }),
  ]);

  const mrr = (pro * 199) + (business * 999);

  return {
    totalClients,
    proClients: pro,
    businessClients: business,
    activeAlerts,
    totalReports,
    mrr,
    planCounts: {
      starter,
      pro,
      business,
    },
  };
}

// ─── Verification Tokens (OTPs) ─────────────────────────────────────────────
export async function createVerificationToken(email, token, expires) {
  return db.verificationToken.create({
    data: { email, token, expires }
  });
}

export async function getVerificationToken(email, token) {
  return db.verificationToken.findUnique({
    where: { 
      email_token: { email, token } 
    }
  });
}

export async function deleteVerificationTokens(email) {
  return db.verificationToken.deleteMany({
    where: { email }
  });
}

export async function deleteVerificationTokenById(id) {
  return db.verificationToken.delete({ 
    where: { id } 
  });
}

// ─── Daily Meter Readings ───────────────────────────────────────────────────
export async function getDailyReadingsByUser(clientId) {
  return db.dailyMeterReading.findMany({
    where: { clientId },
    orderBy: { date: 'desc' },
    take: 31,
  });
}

export async function createDailyReading(data) {
  return db.dailyMeterReading.create({
    data: {
      clientId:   data.clientId,
      meterValue: Number(data.meterValue),
      date:       data.date,
      kwhDelta:   data.kwhDelta != null ? Number(data.kwhDelta) : null,
    },
  });
}

