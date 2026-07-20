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
  barangay: z.string().max(100).optional().nullable(),
  utilityCompanyId: z.string().max(100).optional().nullable(),
  customerType: z.enum(['residential', 'commercial', 'small_commercial', 'industrial']).default('residential'),
  monthlyBill: z.number().min(0).optional().nullable(),
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
  averageMonthlyBill: z.number().positive().optional(),
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
  hardwareSubtotal: z.number().min(0).default(0),
  installationFee: z.number().min(0).default(0),
  designFee: z.number().min(0).default(0),
  permitFee: z.number().min(0).default(0),
  grandTotal: z.number().min(0).default(0),
  validUntil: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const QUOTATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent'],
  sent: ['accepted', 'rejected', 'expired'],
  accepted: [],
  rejected: [],
  expired: ['sent'],
};

const quotationStatusEnum = z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']);

export const updateQuotationSchema = z.object({
  status: z.string().optional(),
  hardwareSubtotal: z.number().min(0).optional(),
  installationFee: z.number().min(0).optional(),
  designFee: z.number().min(0).optional(),
  permitFee: z.number().min(0).optional(),
  grandTotal: z.number().min(0).optional(),
  notes: z.string().max(2000).optional().nullable(),
  vatTreatment: z.enum(['vat_inclusive', 'vat_exclusive', 'vat_exempt']).optional(),
  depositRequiredPct: z.number().min(0).max(100).optional(),
  maintenanceContractOffer: z.number().min(0).optional(),
});

export function getQuotationStatusTransitions() {
  return QUOTATION_STATUS_TRANSITIONS;
}

export function isValidQuotationTransition(from: string, to: string): boolean {
  const allowed = QUOTATION_STATUS_TRANSITIONS[from];
  return !!allowed && allowed.includes(to);
}

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(1, 'Name is required').max(255),
  turnstileToken: z.string().min(1, 'Security check required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});

export const onboardingSchema = z.object({
  siteAddress: z.string().min(1, 'Address is required').max(500),
  utilityCompanyId: z.string().min(1, 'Utility company is required'),
  averageBill: z.number().min(0, 'Average bill is required'),
  province: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
});

export const updateRoiSchema = z.object({
  scenarioLabel: z.string().max(200).optional(),
  selfConsumptionPct: z.number().min(0).max(100).optional(),
  capexTotal: z.number().min(0).optional(),
  financingType: z.enum(['cash', 'loan', 'lease']).optional(),
  loanTermMonths: z.number().int().min(0).optional().nullable(),
  loanInterestRatePct: z.number().min(0).max(100).optional().nullable(),
  annualDegradationPct: z.number().min(0).max(100).optional(),
  annualRateEscalationPct: z.number().min(0).max(100).optional(),
  discountRatePct: z.number().min(0).max(100).optional(),
  omAnnualCost: z.number().min(0).optional(),
  analysisHorizonYears: z.number().int().min(1).max(50).optional(),
});
