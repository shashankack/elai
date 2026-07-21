import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"

type SendInvitationEmailInput = {
  email: string
  registration_url?: string
}

/**
 * Sends seller invitation mail via the notification module.
 * HTML/subject come from the centralized Resend templates
 * (`newSellerInvitation` in apps/api resend/templates).
 */
export const sendSellerInvitationEmailStep = createStep(
  "send-seller-invitation-email",
  async (input: SendInvitationEmailInput, { container }) => {
    const notificationService = container.resolve<INotificationModuleService>(
      Modules.NOTIFICATION
    )

    const notification = await notificationService.createNotifications({
      to: input.email,
      channel: "email",
      template: "newSellerInvitation",
      data: {
        email: input.email,
        registration_url: input.registration_url,
      },
    })

    return new StepResponse(notification)
  }
)
