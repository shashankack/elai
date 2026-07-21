import { z } from "zod"

export const CreateShipmentSchema = z.object({
  send_notification: z.boolean().optional(),
  labels: z
    .array(
      z.object({
        tracking_url: z
          .string()
          .trim()
          .min(1, "Enter a tracking URL")
          .url("Enter a valid URL (https://…)"),
        tracking_number: z.string().trim().optional(),
        label_url: z.string().trim().optional(),
      })
    )
    .min(1, "Add at least one tracking URL"),
})
