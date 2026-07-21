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
import { renderEmailTemplate } from "./templates"

type ResendOptions = {
  api_key: string
  from: string
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * Resend notification provider for Medusa / Mercur.
 *
 * Template resolution order:
 * 1. notification.content.html (explicit override)
 * 2. Central templates in ./templates (by notification.template id)
 * 3. notification.content.text wrapped as simple HTML
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

  private resolveEmail(notification: ProviderSendNotificationDTO): {
    subject: string
    html: string
    text?: string
  } | null {
    const content = notification.content as
      | { subject?: string; html?: string; text?: string }
      | undefined
    const data = {
      ...((notification.data ?? {}) as Record<string, unknown>),
    }

    const rendered = notification.template
      ? renderEmailTemplate(notification.template, data)
      : null

    const subject =
      content?.subject ||
      (typeof data.subject === "string" ? data.subject : null) ||
      rendered?.subject ||
      "Elai notification"

    if (content?.html) {
      return {
        subject,
        html: content.html,
        text: content.text || rendered?.text,
      }
    }

    if (rendered) {
      return {
        subject,
        html: rendered.html,
        text: content?.text || rendered.text,
      }
    }

    if (content?.text) {
      return {
        subject,
        html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${content.text}</pre>`,
        text: content.text,
      }
    }

    return null
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    const email = this.resolveEmail(notification)

    if (!email) {
      this.logger.error(
        `Resend: no HTML content for template "${notification.template}". Add a template under src/modules/resend/templates or pass content.html.`,
      )
      return {}
    }

    const emailOptions: CreateEmailOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: email.subject,
      html: email.html,
      ...(email.text ? { text: email.text } : {}),
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
