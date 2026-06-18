import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'ELAI Vendor Portal <noreply@elai.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Email sent to ${options.to}: ${options.subject}`)
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  async sendApplicationSubmitted(userEmail: string, businessName: string, applicationId: string): Promise<void> {
    const subject = 'Your ELAI Vendor Application Has Been Submitted'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Submitted</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">ELAI Vendor Portal</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin-top: 0;">Application Received!</h2>
            <p>Dear ${businessName} team,</p>
            <p>Thank you for your interest in becoming a vendor on the ELAI platform. Your application has been successfully submitted and is now under review.</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Application Details:</h3>
              <p><strong>Business Name:</strong> ${businessName}</p>
              <p><strong>Application ID:</strong> #${applicationId}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3 style="color: #374151;">What happens next?</h3>
            <ol style="color: #4b5563;">
              <li>Our team will review your application (typically within 24-48 hours)</li>
              <li>You'll receive an email notification once a decision has been made</li>
              <li>If approved, you'll receive a link to complete your seller agreement</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/status" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Check Application Status
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 ELAI Vendor Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }

  async sendApplicationApproved(
    userEmail: string,
    businessName: string,
    vendorPanelUrl?: string
  ): Promise<void> {
    const vendorUrl =
      vendorPanelUrl ||
      process.env.MERCUR_VENDOR_URL ||
      `${process.env.NEXTAUTH_URL}/contract`
    const subject = 'Congratulations! Your ELAI Vendor Application Has Been Approved'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Approved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">ELAI Vendor Portal</h1>
          </div>
          
          <div style="background: #f0fdf4; padding: 30px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
            <h2 style="color: #16a34a; margin-top: 0;">🎉 Application Approved!</h2>
            <p>Dear ${businessName},</p>
            <p>Congratulations! Your application to join the ELAI marketplace has been approved.</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px;">
            <h3 style="color: #374151;">Next Steps:</h3>
            <ol style="color: #4b5563;">
              <li>Open the vendor dashboard using the link below</li>
              <li>Accept your seller invite and set your password</li>
              <li>Complete store setup, products, and Stripe Connect</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${vendorUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Open Vendor Dashboard
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 ELAI Vendor Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }

  async sendApplicationRejected(userEmail: string, businessName: string, reason: string): Promise<void> {
    const subject = 'Your ELAI Vendor Application Status'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">ELAI Vendor Portal</h1>
          </div>
          
          <div style="background: #fef2f2; padding: 30px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fecaca;">
            <h2 style="color: #dc2626; margin-top: 0;">Application Status Update</h2>
            <p>Thank you for your interest in joining ELAI. After careful review, we are unable to approve your application at this time.</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px;">
            <h3 style="color: #374151;">Reason for Decision:</h3>
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #dc2626;">
              <p style="color: #4b5563;">${reason}</p>
            </div>
            
            <h3 style="color: #374151; margin-top: 30px;">What you can do:</h3>
            <ul style="color: #4b5563;">
              <li>Address the issues mentioned above</li>
              <li>Submit a new application with updated information</li>
              <li>Contact our support team if you have questions</li>
            </ul>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 ELAI Vendor Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }

  async sendInfoRequested(userEmail: string, businessName: string, notes: string): Promise<void> {
    const subject = 'Additional Information Needed for Your ELAI Application'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Information Requested</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">ELAI Vendor Portal</h1>
          </div>
          
          <div style="background: #fffbeb; padding: 30px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fed7aa;">
            <h2 style="color: #d97706; margin-top: 0;">📧 Additional Information Needed</h2>
            <p>We're reviewing your application and need some additional information to complete our evaluation.</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px;">
            <h3 style="color: #374151;">Information Requested:</h3>
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #d97706;">
              <p style="color: #4b5563;">${notes}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/register/supplement" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Provide Information
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Please provide the requested information within 7 business days to avoid application closure.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 ELAI Vendor Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }
}

export const emailService = new EmailService()
