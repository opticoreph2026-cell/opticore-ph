import { z } from 'zod';

export const emailSchema = z.string().email().max(255);

export const sendOtpSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const createLeadSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  phone: z.string().max(50).optional().nullable(),
  email: emailSchema.optional().nullable(),
  addressLine: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  customerType: z.enum(['residential', 'commercial', 'industrial']).default('residential'),
  monthlyBillPhp: z.number().int().min(0).optional().nullable(),
  source: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const contactFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
});

const gridConnectionEnum = z.enum(['single_phase', 'three_phase', 'three_phase_high_voltage']);
const designPathwayEnum = z.enum(['zero_export_hybrid', 'net_metering', 'off_grid', 'battery_backup']);
const customerTypeEnum = z.enum(['residential', 'commercial', 'industrial']);

export const criticalLoadSchema = z.object({
  name: z.string(),
  watts: z.number().positive(),
  hoursPerDay: z.number().min(0).max(24),
});

export const designComputeSchema = z.object({
  leadId: z.string().uuid(),
  save: z.boolean().default(false),
  averageMonthlyKwh: z.number().positive().optional(),
  averageMonthlyBillCentavos: z.number().int().positive().optional(),
  gridConnectionType: gridConnectionEnum.default('single_phase'),
  designPathway: designPathwayEnum.default('zero_export_hybrid'),
  customerType: customerTypeEnum.default('residential'),
  peakSunHours: z.number().min(1).max(8).default(4.5),
  targetOffsetPct: z.number().min(0).max(100).default(80),
  panelWattage: z.number().positive().default(550),
  backupAutonomyHours: z.number().min(0).max(72).default(4),
  criticalLoads: z.array(criticalLoadSchema).default([]),
  availableRoofAreaSqm: z.number().positive().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const createQuotationSchema = z.object({
  customerId: z.string().uuid(),
  designId: z.string().uuid(),
  roiScenarioId: z.string().uuid().optional().nullable(),
  hardwareSubtotalCentavos: z.number().int().min(0).default(0),
  installationFeeCentavos: z.number().int().min(0).default(0),
  designFeeCentavos: z.number().int().min(0).default(0),
  grandTotalCentavos: z.number().int().min(0).default(0),
  validUntil: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});
