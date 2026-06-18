import { z } from 'zod'

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const CIN_REGEX = /^[UL]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[\d\W]/.test(val), {
    message: 'Password must include upper, lower, and a number or symbol',
  })

export const accountStepSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const storeStepSchema = z.object({
  name: z.string().min(2, 'Store name is required'),
  email: z.string().email('Valid store email is required'),
  phone: z.string().min(10, 'Phone number is required'),
  description: z.string().max(500).optional(),
  handle: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Handle can only use lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
})

export const businessStepSchema = z.object({
  address_1: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'State is required'),
  postal_code: z.string().min(4, 'PIN code is required'),
  corporate_name: z.string().min(2, 'Legal business name is required'),
  tax_id: z
    .string()
    .length(15, 'GSTIN must be 15 characters')
    .regex(GSTIN_REGEX, 'Invalid GSTIN format'),
  registration_number: z
    .string()
    .refine((val) => val === '' || CIN_REGEX.test(val), 'Invalid CIN format'),
})

export const bankStepSchema = z.object({
  holder_name: z.string().min(2, 'Account holder name is required'),
  bank_name: z.string().min(2, 'Bank name is required'),
  routing_number: z.string().min(11, 'IFSC must be 11 characters').max(11, 'IFSC must be 11 characters'),
  account_number: z.string().min(5, 'Account number is required'),
  gst_certificate_key: z.string().optional().or(z.literal('')),
  cancelled_cheque_key: z.string().optional().or(z.literal('')),
})

export const onboardingSubmitSchema = z.object({
  account: accountStepSchema,
  store: storeStepSchema,
  business: businessStepSchema,
  bank: bankStepSchema,
})

export type AccountStepValues = z.infer<typeof accountStepSchema>
export type StoreStepValues = z.infer<typeof storeStepSchema>
export type BusinessStepValues = z.infer<typeof businessStepSchema>
export type BankStepValues = z.infer<typeof bankStepSchema>
export type OnboardingSubmitValues = z.infer<typeof onboardingSubmitSchema>

export const onboardingUploadSchema = z.object({
  email: z.string().email(),
  fileName: z.string().min(1),
  fileType: z.string().regex(/^image\/(jpeg|png|jpg)|application\/pdf$/, 'Only JPG, PNG, and PDF allowed'),
  fileSize: z.number().max(10 * 1024 * 1024).optional(),
})
