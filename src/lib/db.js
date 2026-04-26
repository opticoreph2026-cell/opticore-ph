import 'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';


/**
 * OptiCore PH - Database Engine
 * 
 * Version: Prisma 6 Stable + Config Adapter
 * 
 * In this version, we pass the raw Turso config to PrismaLibSQL.
 * This prevents the "undefined" URL error by letting the adapter manage the client lifecycle.
 */

const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
const rawToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

function sanitize(val) {
  if (!val || val === 'undefined' || val === 'null') return null;
  return val.replace(/['"]/g, '').split('?')[0].trim();
}

const dbUrl = sanitize(rawUrl);
const authToken = sanitize(rawToken);

function makePrisma() {
  try {
    // 1. Remote connection (Turso) - Use Adapter Factory
    if (dbUrl && (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://'))) {
      const client = createClient({ 
        url: dbUrl, 
        authToken: authToken || undefined 
      });
      const adapter = new PrismaLibSQL(client);
      
      // Satisfy Prisma 6 validator with a dummy environment variable
      process.env.DATABASE_URL = 'file:./dev.db';
      
      return new PrismaClient({ adapter });
    }

    // 2. Local connection (Development/Build) - Use Native Engine
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'file:./dev.db';
    }
    return new PrismaClient();
  } catch (error) {
    console.error('[OptiCore DB] CRITICAL INITIALIZATION ERROR:', error);
    return new PrismaClient();
  }
}

// Singleton Pattern
const GLOBAL_DB_KEY = 'opticore_prisma_v6_config_final';
const globalForPrisma = globalThis;

if (!globalForPrisma[GLOBAL_DB_KEY]) {
  globalForPrisma[GLOBAL_DB_KEY] = makePrisma();
}

export const db = globalForPrisma[GLOBAL_DB_KEY];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export async function getClientByEmail(email) {
  if (!email) return null;
  return db.client.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function getClientById(id) {
  if (!id) return null;
  return db.client.findUnique({ where: { id } });
}

export async function listAllClients(options = {}) {
  const { maxRecords = 100, includeAdmins = false } = options;
  return db.client.findMany({
    where: includeAdmins ? {} : { 
      NOT: { role: 'admin' }
    },
    orderBy: { createdAt: 'desc' },
    take: maxRecords,
  });
}

export async function setClientPlanTier(id, tier, subscriptionId = null, logType = 'payment') {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  const client = await db.client.update({
    where: { id },
    data: { 
      planTier: tier,
      planExpiry: expiry,
      subscriptionId: subscriptionId
    },
  });

  await logTransaction({
    clientId: id,
    planTier: tier,
    type: logType,
    referenceId: subscriptionId || (logType === 'manual_override' ? 'Admin Override' : null),
    amount: tier === 'pro' ? 499 : (tier === 'business' ? 2499 : 0)
  });

  return client;
}

export async function listAllTransactions(options = {}) {
  return db.transaction.findMany({
    include: { client: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: options.maxRecords || 100,
  });
}

export async function logTransaction(data) {
  return db.transaction.create({
    data: {
      clientId:    data.clientId,
      planTier:    data.planTier,
      type:        data.type || 'payment',
      amount:      data.amount || 0,
      referenceId: data.referenceId,
      status:      'completed'
    }
  });
}

export async function recordLogin(id) {
  return db.client.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

export async function incrementTokenUsage(id, tokens) {
  return db.client.update({
    where: { id },
    data: { totalTokensUsed: { increment: tokens } },
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
    where: { email: email.toLowerCase().trim() },
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
      email: data.email.toLowerCase().trim(),
      passwordHash: data.password_hash,
      electricityProviderId: data.electricity_provider_id || '',
      waterProviderId: data.water_provider_id || '',
      applianceCount: data.appliance_count || 0,
      consentGiven: true,
      onboardingComplete: false,
      role: 'client',
      planTier: 'starter',
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
  if (data.avatar !== undefined) fields.avatar = data.avatar;
  
  return db.client.update({
    where: { id },
    data: fields,
  });
}

export async function updateClientSettings(id, data) {
  const patch = {};
  if (data.electricProvider !== undefined)   patch.electricityProviderId = data.electricProvider;
  if (data.waterProvider !== undefined)      patch.waterProviderId       = data.waterProvider;
  if (data.emailAlertsEnabled !== undefined) patch.emailAlertsEnabled    = data.emailAlertsEnabled;
  if (data.name !== undefined)                patch.name                  = data.name;
  if (data.avatar !== undefined)              patch.avatar                = data.avatar;

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
      generationCharge:    data.generation_charge   != null ? Number(data.generation_charge)   : null,
      transmissionCharge:  data.transmission_charge != null ? Number(data.transmission_charge) : null,
      systemLoss:          data.system_loss         != null ? Number(data.system_loss)         : null,
      distributionCharge:  data.distribution_charge != null ? Number(data.distribution_charge) : null,
      subsidies:           data.subsidies           != null ? Number(data.subsidies)           : null,
      governmentTax:       data.government_tax      != null ? Number(data.government_tax)      : null,
      vat:                 data.vat                 != null ? Number(data.vat)                 : null,
      otherCharges:        data.other_charges       != null ? Number(data.other_charges)       : null,
      effectiveRate:       kwh > 0 ? Number((bill / kwh).toFixed(4)) : null,
      sourceType:          data.source_type         || 'manual',
      providerDetected:    data.provider_detected   || null,
      billingPeriod:       data.billing_period      || null,
    },
  });
}

// ─── AI Reports ──────────────────────────────────────────────────────────────
export async function getSystemTelemetry() {
  const clients = await db.client.findMany({
    select: {
      totalTokensUsed: true,
      scanCount: true,
      subscriptionId: true,
    }
  });

  const totalTokens = clients.reduce((acc, c) => acc + (c.totalTokensUsed || 0), 0);
  const totalScans = clients.reduce((acc, c) => acc + (c.scanCount || 0), 0);
  const googleLogins = await db.client.count(); 

  return {
    totalTokens,
    totalScans,
    googleLogins,
    geminiLimit: 1000000, 
  };
}

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

export async function markAllAlertsRead(clientId) {
  return db.alert.updateMany({
    where: { clientId, isRead: false },
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

export async function getAdminKPIs() {
  const [totalUsers, admins, pro, business, totalReports, activeAlerts] = await Promise.all([
    db.client.count(),
    db.client.count({ where: { role: 'admin' } }),
    db.client.count({ where: { planTier: 'pro' } }),
    db.client.count({ where: { planTier: 'business' } }),
    db.aIReport.count(),
    db.alert.count({ where: { isRead: false } }),
  ]);

  const totalClients = Math.max(0, totalUsers - admins);
  
  // For counts, we exclude admins from the tiers just in case an admin has a tier set
  // In most cases admins won't have 'pro'/'business' tiers but we handle it here
  const proClients = Math.max(0, pro - await db.client.count({ where: { planTier: 'pro', role: 'admin' } }));
  const businessClients = Math.max(0, business - await db.client.count({ where: { planTier: 'business', role: 'admin' } }));
  const starter = Math.max(0, totalClients - proClients - businessClients);

  const mrr = (proClients * 499) + (businessClients * 2499);

  return {
    totalClients,
    proClients,
    businessClients,
    adminCount: admins,
    activeAlerts,
    totalReports,
    mrr,
    planCounts: {
      starter,
      pro: proClients,
      business: businessClients,
    },
  };
}

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

export async function listProvidersByType(type) {
  return db.utilityProvider.findMany({
    where: { type },
    orderBy: { name: 'asc' }
  });
}

// ─── Admin Notifications ─────────────────────────────────────────────────────

export async function createAdminNotification(data) {
  return db.adminNotification.create({
    data: {
      type:    data.type,
      title:   data.title,
      message: data.message,
      meta:    data.meta ? JSON.stringify(data.meta) : null,
      isRead:  false,
    },
  });
}

export async function getAdminNotifications(limit = 30) {
  const rows = await db.adminNotification.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map(r => ({
    ...r,
    meta: r.meta ? (() => { try { return JSON.parse(r.meta); } catch { return {}; } })() : {},
  }));
}

export async function countUnreadAdminNotifications() {
  return db.adminNotification.count({ where: { isRead: false } });
}

export async function markAdminNotificationRead(id) {
  return db.adminNotification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAdminNotificationsRead() {
  return db.adminNotification.updateMany({ where: { isRead: false }, data: { isRead: true } });
}
