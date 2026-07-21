'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useCart } from '@/components/cart/cart-provider'
import {
  createCustomerAddress,
  listCustomerAddresses,
  type AddressInput,
  type StoreCustomerAddress,
} from '@/lib/mercur/addresses'
import { formatCartMoney } from '@/lib/mercur/cart'
import {
  RAZORPAY_PROVIDER_ID,
  SYSTEM_PROVIDER_ID,
  addShippingMethodsForSellers,
  addressInputToCartPayload,
  completeCart,
  confirmRazorpayPayment,
  ensurePaymentSession,
  isRazorpayProvider,
  listPaymentProviders,
  listSellerShippingOptions,
  pickPreferredProvider,
  updateCartCheckout,
  type SellerShippingOptionsMap,
  type StorePaymentProvider,
  type StoreShippingOption,
} from '@/lib/mercur/checkout'
import { MercurStoreError } from '@/lib/mercur/store-client'
import { openRazorpayCheckout } from '@/lib/razorpay-checkout'
import { CheckoutBagMosaic } from '@/components/checkout/checkout-bag-mosaic'

type CheckoutStep = 'delivery' | 'shipping' | 'payment'

const emptyForm = (): AddressInput => ({
  address_name: '',
  first_name: '',
  last_name: '',
  phone: '',
  address_1: '',
  address_2: '',
  city: '',
  province: '',
  postal_code: '',
  country_code: 'in',
  is_default_shipping: true,
  is_default_billing: true,
})

export function CheckoutView() {
  const router = useRouter()
  const { customer, token, loading: authLoading, isAuthenticated } = useAuth()
  const {
    cart,
    itemCount,
    loading: cartLoading,
    refreshCart,
    clearLocalCart,
  } = useCart()

  const [step, setStep] = useState<CheckoutStep>('delivery')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [addresses, setAddresses] = useState<StoreCustomerAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressInput>(emptyForm)

  const [shippingBySeller, setShippingBySeller] =
    useState<SellerShippingOptionsMap>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {},
  )

  const [providers, setProviders] = useState<StorePaymentProvider[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/account/login?next=/shop/checkout')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!customer) return
    setAddressForm((prev) => ({
      ...prev,
      first_name: prev.first_name || customer.first_name || '',
      last_name: prev.last_name || customer.last_name || '',
      phone: prev.phone || customer.phone || '',
    }))
  }, [customer])

  const loadAddresses = useCallback(async () => {
    if (!token) return
    try {
      const list = await listCustomerAddresses(token)
      setAddresses(list)
      const defaultAddr =
        list.find((a) => a.is_default_shipping) || list[0] || null
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
        setUseNewAddress(false)
      } else {
        setUseNewAddress(true)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load saved addresses.',
      )
    }
  }, [token])

  useEffect(() => {
    if (token && isAuthenticated) {
      void loadAddresses()
    }
  }, [token, isAuthenticated, loadAddresses])

  const currency = cart?.currency_code || 'inr'
  const total =
    cart?.total ?? cart?.item_total ?? cart?.item_subtotal ?? cart?.subtotal ?? null

  const sellerEntries = useMemo(
    () => Object.entries(shippingBySeller),
    [shippingBySeller],
  )

  const preferredProvider = useMemo(
    () => pickPreferredProvider(providers),
    [providers],
  )

  useEffect(() => {
    if (preferredProvider && !selectedProviderId) {
      setSelectedProviderId(preferredProvider.id)
    }
  }, [preferredProvider, selectedProviderId])

  if (authLoading || cartLoading || !isAuthenticated) {
    return (
      <main className="elai-commerce-shell checkout-page">
        <p className="checkout-muted font-subheading">Loading checkout…</p>
      </main>
    )
  }

  if (itemCount === 0 || !cart) {
    return (
      <main className="elai-commerce-shell checkout-page">
        <p className="checkout-eyebrow font-subheading">Checkout</p>
        <h1 className="checkout-title font-heading">Your bag is empty</h1>
        <p className="checkout-lead font-subheading">
          Add accessories to your bag, then come back to place an order.
        </p>
        <Link href="/shop" className="checkout-btn checkout-btn--primary">
          Browse shop
        </Link>
      </main>
    )
  }

  async function onDeliveryNext(e: FormEvent) {
    e.preventDefault()
    if (!cart || !token || !customer) return
    setBusy(true)
    setError(null)
    try {
      let shippingPayload

      if (useNewAddress || !selectedAddressId) {
        const phone = addressForm.phone?.trim()
        if (
          !addressForm.first_name?.trim() ||
          !addressForm.last_name?.trim() ||
          !phone ||
          !addressForm.address_1.trim() ||
          !addressForm.city.trim() ||
          !addressForm.postal_code.trim()
        ) {
          throw new Error('Please fill in name, phone, address, city, and PIN.')
        }
        if (!/^\d{6}$/.test(addressForm.postal_code.trim())) {
          throw new Error('Enter a valid 6-digit PIN code.')
        }

        const saved = await createCustomerAddress(token, {
          ...addressForm,
          country_code: 'in',
          is_default_shipping: true,
          is_default_billing: true,
        })
        if (!saved?.id) {
          throw new Error('Could not save address. Please try again.')
        }
        setAddresses((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)])
        setSelectedAddressId(saved.id)
        setUseNewAddress(false)
        shippingPayload = addressInputToCartPayload({
          ...addressForm,
          first_name: addressForm.first_name,
          last_name: addressForm.last_name,
          phone,
          country_code: 'in',
        })
      } else {
        const selected = addresses.find((a) => a.id === selectedAddressId)
        if (!selected) throw new Error('Select a delivery address.')
        if (!selected.phone?.trim()) {
          throw new Error(
            'Selected address needs a phone number (required for payment).',
          )
        }
        shippingPayload = addressInputToCartPayload({
          address_1: selected.address_1 || '',
          address_2: selected.address_2 || undefined,
          city: selected.city || '',
          province: selected.province || undefined,
          postal_code: selected.postal_code || '',
          country_code: selected.country_code || 'in',
          company: selected.company || undefined,
          first_name: selected.first_name || customer.first_name || '',
          last_name: selected.last_name || customer.last_name || '',
          phone: selected.phone || customer.phone || '',
        })
      }

      await updateCartCheckout(
        cart.id,
        {
          email: customer.email,
          shipping_address: shippingPayload,
          billing_address: shippingPayload,
        },
        token,
      )
      await refreshCart()

      const options = await listSellerShippingOptions(cart.id)
      setShippingBySeller(options)

      const autoSelect: Record<string, string> = {}
      for (const [sellerId, opts] of Object.entries(options)) {
        if (opts[0]?.id) autoSelect[sellerId] = opts[0].id
      }
      setSelectedOptions(autoSelect)

      if (!Object.keys(options).length) {
        throw new Error(
          'No shipping options available for this address. Ask sellers to configure shipping, or try another PIN.',
        )
      }

      setStep('shipping')
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onShippingNext(e: FormEvent) {
    e.preventDefault()
    if (!cart || !token) return
    setBusy(true)
    setError(null)
    try {
      const sellerIds = Object.keys(shippingBySeller)
      const missing = sellerIds.filter((id) => !selectedOptions[id])
      if (missing.length) {
        throw new Error('Select a shipping method for every seller.')
      }

      const optionIds = sellerIds.map((id) => selectedOptions[id])
      await addShippingMethodsForSellers(cart.id, optionIds, token)
      await refreshCart()

      if (!cart.region_id) {
        throw new Error('Cart is missing a region. Recreate your bag and try again.')
      }

      const list = await listPaymentProviders(cart.region_id)
      setProviders(list)
      const preferred = pickPreferredProvider(list)
      setSelectedProviderId(preferred?.id ?? null)

      if (!list.length) {
        throw new Error(
          'No payment methods available for this region. Check Admin → Regions → Payment providers.',
        )
      }

      setStep('payment')
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function placeOrder() {
    if (!cart || !token || !customer || !selectedProviderId) return
    setBusy(true)
    setError(null)
    try {
      const { payment_session } = await ensurePaymentSession(
        cart.id,
        selectedProviderId,
        token,
        undefined,
        cart.payment_collection?.id,
      )

      if (isRazorpayProvider(selectedProviderId)) {
        const sessionData = (payment_session?.data || {}) as {
          razorpay_order_id?: string
          id?: string
          amount?: number
          currency?: string
          key_id?: string
        }
        const orderId = sessionData.razorpay_order_id || sessionData.id
        const key =
          sessionData.key_id ||
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
          ''
        const amount = Number(sessionData.amount || 0)
        const payCurrency = String(sessionData.currency || 'INR')

        if (!orderId || !key || !amount) {
          throw new Error(
            'Razorpay session is incomplete. Check RAZORPAY keys on the API and NEXT_PUBLIC_RAZORPAY_KEY_ID.',
          )
        }

        await new Promise<void>((resolve, reject) => {
          void openRazorpayCheckout({
            key,
            amount,
            currency: payCurrency,
            order_id: orderId,
            name: 'Elai',
            description: `Order for ${itemCount} item${itemCount === 1 ? '' : 's'}`,
            prefill: {
              name: [customer.first_name, customer.last_name]
                .filter(Boolean)
                .join(' '),
              email: customer.email,
              contact: customer.phone || undefined,
            },
            onSuccess: async (response) => {
              try {
                await confirmRazorpayPayment(cart.id, response, token)
                const result = await completeCart(cart.id, token)
                if (result.type !== 'order_group' || !result.order_group?.id) {
                  throw new Error(
                    result.type === 'cart'
                      ? result.error?.message || 'Payment could not be completed.'
                      : 'Order was not created.',
                  )
                }
                await clearLocalCart()
                router.replace(
                  `/shop/order-confirmation/${result.order_group.id}`,
                )
                resolve()
              } catch (err) {
                reject(err)
              }
            },
            onDismiss: () => {
              reject(new Error('Payment cancelled.'))
            },
          }).catch(reject)
        })
        return
      }

      // System / manual payment (local fallback)
      const result = await completeCart(cart.id, token)
      if (result.type !== 'order_group' || !result.order_group?.id) {
        throw new Error(
          result.type === 'cart'
            ? result.error?.message || 'Could not place order.'
            : 'Order was not created.',
        )
      }
      await clearLocalCart()
      router.replace(`/shop/order-confirmation/${result.order_group.id}`)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="elai-commerce-shell checkout-page">
      <div className="checkout-layout">
        <div className="checkout-main">
          <header className="checkout-hero">
            <div>
              <p className="checkout-eyebrow font-subheading">Checkout</p>
              <h1 className="checkout-title font-heading">Almost yours</h1>
              <p className="checkout-lead font-subheading">
                Signed in as {customer?.email}
              </p>
            </div>
          </header>

          <ol
            className="checkout-steps font-subheading"
            aria-label="Checkout steps"
          >
            {(['delivery', 'shipping', 'payment'] as CheckoutStep[]).map(
              (s, index) => (
                <li
                  key={s}
                  className={
                    step === s
                      ? 'is-active'
                      : stepIndex(step) > index
                        ? 'is-done'
                        : undefined
                  }
                >
                  <span>{index + 1}</span>
                  {s === 'delivery'
                    ? 'Delivery'
                    : s === 'shipping'
                      ? 'Shipping'
                      : 'Payment'}
                </li>
              ),
            )}
          </ol>

          {error && <p className="auth-error">{error}</p>}

          {step === 'delivery' && (
            <form
              className="checkout-panel auth-form font-subheading"
              onSubmit={onDeliveryNext}
            >
              <h2 className="checkout-panel__title font-heading">Delivery</h2>
              <p className="checkout-panel__desc">
                Where should we send this order? Phone is required for payment.
              </p>

              {addresses.length > 0 && !useNewAddress && (
                <ul className="checkout-address-list">
                  {addresses.map((address) => (
                    <li key={address.id}>
                      <label className="checkout-choice">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                        />
                        <span>
                          <strong>
                            {address.address_name ||
                              [address.first_name, address.last_name]
                                .filter(Boolean)
                                .join(' ') ||
                              'Address'}
                          </strong>
                          <br />
                          {[address.address_1, address.city, address.postal_code]
                            .filter(Boolean)
                            .join(', ')}
                          {address.phone ? (
                            <>
                              <br />
                              {address.phone}
                            </>
                          ) : (
                            <>
                              <br />
                              <em>Missing phone</em>
                            </>
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {(useNewAddress || addresses.length === 0) && (
                <div className="checkout-new-address">
                  <div className="auth-form__row auth-form__row--2">
                    <div className="auth-field">
                      <label htmlFor="co-first">First name</label>
                      <input
                        id="co-first"
                        required
                        value={addressForm.first_name ?? ''}
                        onChange={(e) =>
                          setAddressForm((f) => ({
                            ...f,
                            first_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="co-last">Last name</label>
                      <input
                        id="co-last"
                        required
                        value={addressForm.last_name ?? ''}
                        onChange={(e) =>
                          setAddressForm((f) => ({
                            ...f,
                            last_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="co-phone">Phone</label>
                    <input
                      id="co-phone"
                      type="tel"
                      required
                      value={addressForm.phone ?? ''}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="co-addr">Address</label>
                    <input
                      id="co-addr"
                      required
                      value={addressForm.address_1}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          address_1: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="auth-form__row auth-form__row--2">
                    <div className="auth-field">
                      <label htmlFor="co-city">City</label>
                      <input
                        id="co-city"
                        required
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm((f) => ({ ...f, city: e.target.value }))
                        }
                      />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="co-pin">PIN code</label>
                      <input
                        id="co-pin"
                        required
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        value={addressForm.postal_code}
                        onChange={(e) =>
                          setAddressForm((f) => ({
                            ...f,
                            postal_code: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="co-state">State</label>
                    <input
                      id="co-state"
                      value={addressForm.province ?? ''}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          province: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {addresses.length > 0 && (
                <button
                  type="button"
                  className="checkout-link"
                  onClick={() => setUseNewAddress((v) => !v)}
                >
                  {useNewAddress ? 'Use a saved address' : 'Add a new address'}
                </button>
              )}

              <div className="checkout-actions">
                <Link href="/shop/cart" className="checkout-btn checkout-btn--ghost">
                  Back to bag
                </Link>
                <button
                  type="submit"
                  className="checkout-btn checkout-btn--primary"
                  disabled={busy}
                >
                  {busy ? 'Saving…' : 'Continue to shipping'}
                </button>
              </div>
            </form>
          )}

          {step === 'shipping' && (
            <form
              className="checkout-panel auth-form font-subheading"
              onSubmit={onShippingNext}
            >
              <h2 className="checkout-panel__title font-heading">Shipping</h2>
              <p className="checkout-panel__desc">
                Choose delivery for each seller in your bag.
              </p>

              {sellerEntries.map(([sellerId, options], index) => (
                <fieldset key={sellerId} className="checkout-seller-ship">
                  <legend>Seller {index + 1}</legend>
                  <ul className="checkout-address-list">
                    {options.map((option: StoreShippingOption) => (
                      <li key={option.id}>
                        <label className="checkout-choice">
                          <input
                            type="radio"
                            name={`ship-${sellerId}`}
                            checked={selectedOptions[sellerId] === option.id}
                            onChange={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [sellerId]: option.id,
                              }))
                            }
                          />
                          <span>
                            <strong>{option.name || 'Shipping'}</strong>
                            {option.amount != null && (
                              <>
                                {' · '}
                                {formatCartMoney(option.amount, currency)}
                              </>
                            )}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              ))}

              <div className="checkout-actions">
                <button
                  type="button"
                  className="checkout-btn checkout-btn--ghost"
                  onClick={() => setStep('delivery')}
                  disabled={busy}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="checkout-btn checkout-btn--primary"
                  disabled={busy}
                >
                  {busy ? 'Saving…' : 'Continue to payment'}
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <div className="checkout-panel font-subheading">
              <h2 className="checkout-panel__title font-heading">Payment</h2>
              <p className="checkout-panel__desc">
                {isRazorpayProvider(selectedProviderId)
                  ? 'Pay securely with Razorpay (UPI, cards, netbanking).'
                  : 'Local/dev payment — no card charge.'}
              </p>

              <ul className="checkout-address-list">
                {providers.map((provider) => (
                  <li key={provider.id}>
                    <label className="checkout-choice">
                      <input
                        type="radio"
                        name="provider"
                        checked={selectedProviderId === provider.id}
                        onChange={() => setSelectedProviderId(provider.id)}
                      />
                      <span>
                        <strong>
                          {provider.id === RAZORPAY_PROVIDER_ID
                            ? 'Razorpay'
                            : provider.id === SYSTEM_PROVIDER_ID
                              ? 'Manual payment (dev)'
                              : provider.id}
                        </strong>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <div className="checkout-pay-total">
                <span>Order total</span>
                <strong>{formatCartMoney(total, currency)}</strong>
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="checkout-btn checkout-btn--ghost"
                  onClick={() => setStep('shipping')}
                  disabled={busy}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="checkout-btn checkout-btn--primary"
                  disabled={busy || !selectedProviderId}
                  onClick={() => void placeOrder()}
                >
                  {busy
                    ? 'Processing…'
                    : isRazorpayProvider(selectedProviderId)
                      ? 'Pay with Razorpay'
                      : 'Place order'}
                </button>
              </div>
            </div>
          )}
        </div>

        <CheckoutBagMosaic
          items={cart.items ?? []}
          itemCount={itemCount}
          total={total}
          currency={currency}
        />
      </div>
    </main>
  )
}

function stepIndex(step: CheckoutStep) {
  return step === 'delivery' ? 0 : step === 'shipping' ? 1 : 2
}

function toErrorMessage(err: unknown): string {
  if (err instanceof MercurStoreError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}
