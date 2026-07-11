import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import { Resend, type CreateEmailOptions } from "resend"

type ResendOptions = {
  api_key: string
  from: string
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * Resend notification provider for Medusa.
 * Prefers notification.content.html/subject when present (Mercur invite emails),
 * otherwise uses simple built-in HTML for known template ids.
 */
class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"

  private resendClient: Resend
  private options: ResendOptions
  private logger: Logger

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super()
    this.resendClient = new Resend(options.api_key)
    this.options = options
    this.logger = logger
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the Resend provider options.",
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the Resend provider options.",
      )
    }
  }

  private resolveSubject(notification: ProviderSendNotificationDTO): string {
    const content = notification.content as
      | { subject?: string }
      | undefined
    if (content?.subject) return content.subject

    const data = notification.data as { subject?: string } | undefined
    if (data?.subject) return data.subject

    switch (notification.template) {
      case "password-reset":
      case "password_reset":
        return "Reset your Elai password"
      case "member-invite":
      case "newSellerInvitation":
        return "You're invited to Elai"
      case "order-placed":
        return "Your Elai order confirmation"
      default:
        return "Elai notification"
    }
  }

  private resolveHtml(notification: ProviderSendNotificationDTO): string | null {
    const content = notification.content as
      | { html?: string; text?: string }
      | undefined

    if (content?.html) return content.html
    if (content?.text) {
      return `<pre style="font-family:sans-serif;white-space:pre-wrap">${content.text}</pre>`
    }

    const data = (notification.data ?? {}) as Record<string, unknown>
    const template = notification.template

    if (template === "password-reset" || template === "password_reset") {
      const resetUrl = String(data.reset_url ?? "#")
      return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;padding:40px 20px;">
  <table width="560" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:8px;padding:40px;">
    <tr><td style="font-size:20px;font-weight:600;color:#18181b;padding-bottom:16px;">Reset your password</td></tr>
    <tr><td style="font-size:14px;color:#52525b;line-height:1.6;">We received a request to reset your Elai account password.</td></tr>
    <tr><td style="padding:24px 0 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">Choose a new password</a>
    </td></tr>
    <tr><td style="font-size:12px;color:#a1a1aa;padding-top:32px;">If you did not request this, you can ignore this email.</td></tr>
  </table>
</body></html>`
    }

    if (template === "member-invite" || template === "newSellerInvitation") {
      const inviteUrl = String(data.invite_url ?? data.registration_url ?? "#")
      const email = String(data.email ?? "")
      return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;padding:40px 20px;">
  <table width="560" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:8px;padding:40px;">
    <tr><td style="font-size:20px;font-weight:600;color:#18181b;padding-bottom:16px;">You're invited to Elai</td></tr>
    <tr><td style="font-size:14px;color:#52525b;line-height:1.6;">
      An invitation was sent to <strong>${email}</strong> to join as a seller or team member on Elai.
    </td></tr>
    <tr><td style="padding:24px 0 0;">
      <a href="${inviteUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">Accept invitation</a>
    </td></tr>
    <tr><td style="font-size:12px;color:#a1a1aa;padding-top:32px;">If you did not expect this invitation, you can ignore this email.</td></tr>
  </table>
</body></html>`
    }

    return null
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    const html = this.resolveHtml(notification)

    if (!html) {
      this.logger.error(
        `Resend: no HTML content for template "${notification.template}". Pass content.html or use a known template id.`,
      )
      return {}
    }

    const emailOptions: CreateEmailOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: this.resolveSubject(notification),
      html,
    }

    const { data, error } = await this.resendClient.emails.send(emailOptions)

    if (error || !data) {
      this.logger.error("Resend: failed to send email", error ?? undefined)
      return {}
    }

    this.logger.info(`Resend: sent email ${data.id} to ${notification.to}`)
    return { id: data.id }
  }
}

export default ResendNotificationProviderService
