export interface MercurSellerResult {
  sellerId: string
  handle: string
  status: string
}

export interface KycMercurInput {
  applicationId: string
  businessName: string
  businessAddress: string
  taxIdNumber: string
  vendorEmail: string
  existingMercurSellerId?: string | null
  bankAccountName?: string | null
  bankAccountNumber?: string | null
  bankRoutingNumber?: string | null
  shippingMethod?: string | null
  leadTime?: string | null
  aboutUs?: string | null
  logoUrl?: string | null
  firstProductTitle?: string | null
  firstProductPrice?: string | null
  firstProductCategory?: string | null
  firstProductImageUrl?: string | null
}

function slugifyHandle(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'seller'
  )
}

function countryCodeFromCurrency(currencyCode: string): string {
  const map: Record<string, string> = {
    inr: 'in',
    usd: 'us',
    eur: 'de',
    gbp: 'gb',
  }
  return (
    (process.env.MERCUR_DEFAULT_COUNTRY_CODE || '').toLowerCase() ||
    map[currencyCode.toLowerCase()] ||
    'us'
  )
}

class MercurService {
  private baseUrl: string
  private adminEmail: string
  private adminPassword: string
  private currencyCode: string
  private countryCode: string

  constructor() {
    this.baseUrl = (process.env.MERCUR_API_URL || '').replace(/\/$/, '')
    this.adminEmail = process.env.MERCUR_ADMIN_EMAIL || ''
    this.adminPassword = process.env.MERCUR_ADMIN_PASSWORD || ''
    this.currencyCode = (process.env.MERCUR_DEFAULT_CURRENCY_CODE || 'usd').toLowerCase()
    this.countryCode = countryCodeFromCurrency(this.currencyCode)
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.adminEmail && this.adminPassword)
  }

  private async request<T>(
    path: string,
    options: RequestInit & { token?: string } = {}
  ): Promise<T> {
    const { token, headers, ...rest } = options
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
    })

    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message =
        typeof body?.message === 'string'
          ? body.message
          : typeof body?.error === 'string'
            ? body.error
            : `Mercur API error (${response.status})`
      throw new Error(message)
    }

    return body as T
  }

  private async getAdminToken(): Promise<string> {
    const data = await this.request<{ token: string }>('/auth/user/emailpass', {
      method: 'POST',
      body: JSON.stringify({
        email: this.adminEmail,
        password: this.adminPassword,
      }),
    })

    if (!data.token) {
      throw new Error('Mercur admin login did not return a token')
    }

    return data.token
  }

  private buildSellerMetadata(input: KycMercurInput): Record<string, unknown> {
    return {
      kyc_application_id: input.applicationId,
      business_address: input.businessAddress,
      shipping_method: input.shippingMethod,
      lead_time: input.leadTime,
      first_product: input.firstProductTitle
        ? {
            title: input.firstProductTitle,
            price: input.firstProductPrice,
            category: input.firstProductCategory,
            image_url: input.firstProductImageUrl,
          }
        : null,
    }
  }

  private async createSeller(
    token: string,
    input: KycMercurInput
  ): Promise<MercurSellerResult> {
    const handle = `${slugifyHandle(input.businessName)}-${input.applicationId.slice(-6)}`

    const data = await this.request<{ seller: { id: string; handle: string; status: string } }>(
      '/admin/sellers',
      {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: input.businessName,
          handle,
          email: input.vendorEmail,
          currency_code: this.currencyCode,
          external_id: input.applicationId,
          description: input.aboutUs || `Approved via ELAI vendor portal`,
          logo: input.logoUrl || null,
          metadata: this.buildSellerMetadata(input),
          member: {
            email: input.vendorEmail,
          },
        }),
      }
    )

    return {
      sellerId: data.seller.id,
      handle: data.seller.handle,
      status: data.seller.status,
    }
  }

  private async syncSellerDetails(
    token: string,
    sellerId: string,
    input: KycMercurInput
  ): Promise<void> {
    await this.request(`/admin/sellers/${sellerId}/address`, {
      method: 'POST',
      token,
      body: JSON.stringify({
        company: input.businessName,
        address_1: input.businessAddress,
        country_code: this.countryCode,
      }),
    })

    if (input.bankAccountName || input.bankAccountNumber || input.bankRoutingNumber) {
      await this.request(`/admin/sellers/${sellerId}/payment-details`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          country_code: this.countryCode,
          holder_name: input.bankAccountName || input.businessName,
          account_number: input.bankAccountNumber || undefined,
          routing_number: input.bankRoutingNumber || undefined,
        }),
      })
    }

    if (input.taxIdNumber) {
      await this.request(`/admin/sellers/${sellerId}/professional-details`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          corporate_name: input.businessName,
          tax_id: input.taxIdNumber,
        }),
      })
    }

    if (input.aboutUs || input.logoUrl) {
      await this.request(`/admin/sellers/${sellerId}`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          description: input.aboutUs || undefined,
          logo: input.logoUrl || undefined,
          metadata: this.buildSellerMetadata(input),
        }),
      })
    }
  }

  private async approveSeller(token: string, sellerId: string): Promise<MercurSellerResult> {
    const data = await this.request<{ seller: { id: string; handle: string; status: string } }>(
      `/admin/sellers/${sellerId}/approve`,
      {
        method: 'POST',
        token,
        body: JSON.stringify({}),
      }
    )

    return {
      sellerId: data.seller.id,
      handle: data.seller.handle,
      status: data.seller.status,
    }
  }

  private async resendMemberInvite(token: string, sellerId: string, email: string): Promise<void> {
    await this.request(`/admin/sellers/${sellerId}/members/invite`, {
      method: 'POST',
      token,
      body: JSON.stringify({
        email,
        role_id: 'role_seller_administration',
      }),
    })
  }

  async provisionSellerFromKyc(input: KycMercurInput): Promise<MercurSellerResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Mercur is not configured. Set MERCUR_API_URL, MERCUR_ADMIN_EMAIL, and MERCUR_ADMIN_PASSWORD.'
      )
    }

    const token = await this.getAdminToken()

    let sellerId = input.existingMercurSellerId

    if (sellerId) {
      await this.syncSellerDetails(token, sellerId, input)
    } else {
      const created = await this.createSeller(token, input)
      sellerId = created.sellerId
      await this.syncSellerDetails(token, sellerId, input)
    }

    const approved = await this.approveSeller(token, sellerId)

    try {
      await this.resendMemberInvite(token, sellerId, input.vendorEmail)
    } catch (inviteError) {
      console.warn('Mercur member invite resend skipped:', inviteError)
    }

    return approved
  }
}

export const mercurService = new MercurService()
