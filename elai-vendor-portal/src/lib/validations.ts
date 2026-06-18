import { z } from "zod";

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().regex(/^image\/(jpeg|png|jpg)|application\/pdf$/, "Invalid file type. Only JPG, PNG, and PDF are allowed."),
  fileSize: z.number().max(10 * 1024 * 1024, "File size must be less than 10MB").optional(),
  email: z.string().email().optional(), // Required when not authenticated (for find-or-create user)
});

export const kycFormSchema = z.object({
  email: z.string().email("Valid email is required"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  taxIdNumber: z.string().min(4, "Tax ID is required"),
  businessAddress: z.string().min(5, "Address is required"),
  
  // Banking
  bankAccountName: z.string().min(2, "Account name is required"),
  bankAccountNumber: z.string().min(5, "Account number is required"),
  bankRoutingNumber: z.string().min(5, "Routing number is required"),
  
  // Shipping
  shippingMethod: z.enum(["flat_rate", "free_shipping", "calculated"]),
  leadTime: z.enum(["1-2_days", "3-5_days", "1-2_weeks", "2-3_weeks"]),
  
  // Storefront
  aboutUs: z.string().max(500).optional(),
  
  // Product
  firstProductTitle: z.string().min(2, "Product title is required"),
  firstProductPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  firstProductCategory: z.string().min(1, "Category is required"),

  // File Keys (S3 keys returned after upload)
  businessLicenseKey: z.string().min(1, "Business license is required"),
  taxIdDocumentKey: z.string().min(1, "Tax ID document is required"),
  governmentIdKey: z.string().min(1, "Government ID is required"),
  logoKey: z.string().optional(),
  firstProductImageKey: z.string().optional(),
});

export type KYCFormValues = z.infer<typeof kycFormSchema>;
