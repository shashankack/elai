'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import {
  createCustomerAddress,
  deleteCustomerAddress,
  formatAddressLines,
  listCustomerAddresses,
  updateCustomerAddress,
  type AddressInput,
  type StoreCustomerAddress,
} from '@/lib/mercur/addresses'
import { formatCartMoney } from '@/lib/mercur/cart'
import {
  listCustomerOrderGroups,
  orderGroupCurrency,
  orderGroupIsShipped,
  orderGroupLabel,
  orderGroupTrackingLinks,
  summarizeOrderStatuses,
  type StoreOrderGroup,
} from '@/lib/mercur/orders'
import { MercurStoreError } from '@/lib/mercur/store-client'

type AccountSection = 'profile' | 'addresses' | 'orders'

const emptyAddress = (): AddressInput => ({
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

function orderThumbnails(group: StoreOrderGroup) {
  const thumbs: { id: string; src: string | null; title: string }[] = []
  for (const order of group.orders ?? []) {
    for (const item of order.items ?? []) {
      thumbs.push({
        id: item.id,
        src: item.thumbnail ?? null,
        title: item.title || 'Item',
      })
      if (thumbs.length >= 5) return thumbs
    }
  }
  return thumbs
}

export function AccountView() {
  const router = useRouter()
  const {
    customer,
    token,
    loading,
    isAuthenticated,
    logout,
    updateProfile,
    busy: profileBusy,
    error: profileError,
    clearError,
  } = useAuth()

  const [section, setSection] = useState<AccountSection>('orders')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)

  const [addresses, setAddresses] = useState<StoreCustomerAddress[]>([])
  const [orders, setOrders] = useState<StoreOrderGroup[]>([])
  const [ordersCount, setOrdersCount] = useState(0)
  const [sectionLoading, setSectionLoading] = useState(true)
  const [sectionError, setSectionError] = useState<string | null>(null)

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<AddressInput>(emptyAddress)
  const [addressBusy, setAddressBusy] = useState(false)
  const [addressMessage, setAddressMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/account/login?next=/account')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (!customer) return
    setFirstName(customer.first_name ?? '')
    setLastName(customer.last_name ?? '')
    setPhone(customer.phone ?? '')
  }, [customer])

  const loadSections = useCallback(async () => {
    if (!token) return
    setSectionLoading(true)
    setSectionError(null)
    try {
      const [addressList, orderData] = await Promise.all([
        listCustomerAddresses(token),
        listCustomerOrderGroups(token, { limit: 8 }),
      ])
      setAddresses(addressList)
      setOrders(orderData.order_groups)
      setOrdersCount(orderData.count)
    } catch (err) {
      const message =
        err instanceof MercurStoreError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not load account details.'
      setSectionError(message)
    } finally {
      setSectionLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token && isAuthenticated) {
      void loadSections()
    }
  }, [token, isAuthenticated, loadSections])

  const profileDirty = useMemo(() => {
    if (!customer) return false
    return (
      firstName !== (customer.first_name ?? '') ||
      lastName !== (customer.last_name ?? '') ||
      phone !== (customer.phone ?? '')
    )
  }, [customer, firstName, lastName, phone])

  useEffect(() => {
    if (profileDirty) setProfileSaved(false)
  }, [profileDirty])

  if (loading || !customer) {
    return (
      <main className="elai-commerce-shell account-page">
        <p className="account-muted font-subheading">Loading your account…</p>
      </main>
    )
  }

  const name =
    [customer.first_name, customer.last_name].filter(Boolean).join(' ') ||
    'there'
  const initials =
    [customer.first_name?.[0], customer.last_name?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || customer.email.slice(0, 1).toUpperCase()

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault()
    clearError()
    setProfileSaved(false)
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      setProfileSaved(true)
    } catch {
      // surfaced via auth error
    }
  }

  function startAddAddress() {
    setEditingId(null)
    setAddressForm({
      ...emptyAddress(),
      first_name: customer.first_name ?? '',
      last_name: customer.last_name ?? '',
      phone: customer.phone ?? '',
    })
    setAddressMessage(null)
    setShowAddressForm(true)
    setSection('addresses')
  }

  function startEditAddress(address: StoreCustomerAddress) {
    setEditingId(address.id)
    setAddressForm({
      address_name: address.address_name ?? '',
      first_name: address.first_name ?? '',
      last_name: address.last_name ?? '',
      phone: address.phone ?? '',
      address_1: address.address_1 ?? '',
      address_2: address.address_2 ?? '',
      city: address.city ?? '',
      province: address.province ?? '',
      postal_code: address.postal_code ?? '',
      country_code: address.country_code ?? 'in',
      is_default_shipping: Boolean(address.is_default_shipping),
      is_default_billing: Boolean(address.is_default_billing),
    })
    setAddressMessage(null)
    setShowAddressForm(true)
    setSection('addresses')
  }

  async function onSaveAddress(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setAddressBusy(true)
    setAddressMessage(null)
    try {
      if (editingId) {
        await updateCustomerAddress(token, editingId, addressForm)
        setAddressMessage('Address updated.')
      } else {
        await createCustomerAddress(token, addressForm)
        setAddressMessage('Address saved.')
      }
      setShowAddressForm(false)
      setEditingId(null)
      await loadSections()
    } catch (err) {
      setAddressMessage(
        err instanceof Error ? err.message : 'Could not save address.',
      )
    } finally {
      setAddressBusy(false)
    }
  }

  async function onDeleteAddress(addressId: string) {
    if (!token) return
    if (!window.confirm('Remove this address?')) return
    setAddressBusy(true)
    try {
      await deleteCustomerAddress(token, addressId)
      await loadSections()
    } catch (err) {
      setAddressMessage(
        err instanceof Error ? err.message : 'Could not remove address.',
      )
    } finally {
      setAddressBusy(false)
    }
  }

  const navItems: { id: AccountSection; label: string; hint: string }[] = [
    {
      id: 'orders',
      label: 'Orders',
      hint: ordersCount ? `${ordersCount}` : 'Recent',
    },
    {
      id: 'addresses',
      label: 'Addresses',
      hint: addresses.length ? `${addresses.length}` : 'Saved',
    },
    { id: 'profile', label: 'Profile', hint: 'You' },
  ]

  return (
    <main className="elai-commerce-shell account-page">
      <header className="account-hero">
        <div className="account-hero__identity">
          <div className="account-monogram font-heading" aria-hidden>
            {initials}
          </div>
          <div className="account-hero__copy">
            <p className="account-eyebrow font-subheading">Your account</p>
            <h1 className="account-title font-heading">Hi, {name}</h1>
            <p className="account-lead font-subheading">{customer.email}</p>
          </div>
        </div>
        <div className="account-hero__actions font-subheading">
          <Link href="/shop" className="account-btn account-btn--primary">
            Continue shopping
          </Link>
          <Link href="/shop/cart" className="account-btn account-btn--ghost">
            View bag
          </Link>
          <button
            type="button"
            className="account-btn account-btn--ghost"
            onClick={() => {
              logout()
              router.push('/')
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="account-shell">
        <nav className="account-nav font-subheading" aria-label="Account sections">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                section === item.id
                  ? 'account-nav__item is-active'
                  : 'account-nav__item'
              }
              onClick={() => setSection(item.id)}
            >
              <span>{item.label}</span>
              <em>{item.hint}</em>
            </button>
          ))}
        </nav>

        <div className="account-stage">
          {section === 'profile' && (
            <section className="account-panel" aria-labelledby="account-profile">
              <div className="account-panel__head">
                <h2
                  id="account-profile"
                  className="account-panel__title font-heading"
                >
                  Profile
                </h2>
                <p className="account-panel__desc font-subheading">
                  Used for orders and delivery updates.
                </p>
              </div>

              <form className="auth-form font-subheading" onSubmit={onSaveProfile}>
                {profileError && <p className="auth-error">{profileError}</p>}
                {profileSaved && !profileError && (
                  <p className="auth-success">Profile saved.</p>
                )}

                <div className="auth-form__row auth-form__row--2">
                  <div className="auth-field">
                    <label htmlFor="acct-first">First name</label>
                    <input
                      id="acct-first"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="acct-last">Last name</label>
                    <input
                      id="acct-last"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="acct-phone">Phone</label>
                  <input
                    id="acct-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="acct-email">Email</label>
                  <input
                    id="acct-email"
                    type="email"
                    value={customer.email}
                    disabled
                    readOnly
                  />
                </div>

                {profileDirty && (
                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={profileBusy}
                  >
                    {profileBusy ? 'Saving…' : 'Save profile'}
                  </button>
                )}
              </form>
            </section>
          )}

          {section === 'addresses' && (
            <section
              className="account-panel"
              aria-labelledby="account-addresses"
            >
              <div className="account-panel__head account-panel__head--row">
                <div>
                  <h2
                    id="account-addresses"
                    className="account-panel__title font-heading"
                  >
                    Addresses
                  </h2>
                  <p className="account-panel__desc font-subheading">
                    Saved for checkout across sellers.
                  </p>
                </div>
                {!showAddressForm && (
                  <button
                    type="button"
                    className="account-btn account-btn--ghost font-subheading"
                    onClick={startAddAddress}
                  >
                    Add address
                  </button>
                )}
              </div>

              {addressMessage && (
                <p
                  className={
                    addressMessage.includes('Could')
                      ? 'auth-error'
                      : 'auth-success'
                  }
                >
                  {addressMessage}
                </p>
              )}

              {showAddressForm && (
                <form
                  className="auth-form font-subheading account-address-form"
                  onSubmit={onSaveAddress}
                >
                  <div className="auth-field">
                    <label htmlFor="addr-label">Label</label>
                    <input
                      id="addr-label"
                      value={addressForm.address_name ?? ''}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          address_name: e.target.value,
                        }))
                      }
                      placeholder="Home, Studio…"
                    />
                  </div>

                  <div className="auth-form__row auth-form__row--2">
                    <div className="auth-field">
                      <label htmlFor="addr-first">First name</label>
                      <input
                        id="addr-first"
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
                      <label htmlFor="addr-last">Last name</label>
                      <input
                        id="addr-last"
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
                    <label htmlFor="addr-1">Address</label>
                    <input
                      id="addr-1"
                      required
                      value={addressForm.address_1}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          address_1: e.target.value,
                        }))
                      }
                      placeholder="House / street"
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="addr-2">Landmark / line 2</label>
                    <input
                      id="addr-2"
                      value={addressForm.address_2 ?? ''}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          address_2: e.target.value,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className="auth-form__row auth-form__row--2">
                    <div className="auth-field">
                      <label htmlFor="addr-city">City</label>
                      <input
                        id="addr-city"
                        required
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm((f) => ({
                            ...f,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="addr-state">State</label>
                      <input
                        id="addr-state"
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

                  <div className="auth-form__row auth-form__row--2">
                    <div className="auth-field">
                      <label htmlFor="addr-pin">PIN code</label>
                      <input
                        id="addr-pin"
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
                    <div className="auth-field">
                      <label htmlFor="addr-phone">Phone</label>
                      <input
                        id="addr-phone"
                        type="tel"
                        value={addressForm.phone ?? ''}
                        onChange={(e) =>
                          setAddressForm((f) => ({
                            ...f,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <label className="account-check font-subheading">
                    <input
                      type="checkbox"
                      checked={Boolean(addressForm.is_default_shipping)}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          is_default_shipping: e.target.checked,
                          is_default_billing: e.target.checked,
                        }))
                      }
                    />
                    Use as default shipping address
                  </label>

                  <div className="account-form-actions">
                    <button
                      type="submit"
                      className="auth-submit"
                      disabled={addressBusy}
                    >
                      {addressBusy
                        ? 'Saving…'
                        : editingId
                          ? 'Update address'
                          : 'Save address'}
                    </button>
                    <button
                      type="button"
                      className="account-btn account-btn--ghost"
                      onClick={() => {
                        setShowAddressForm(false)
                        setEditingId(null)
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {sectionLoading ? (
                <p className="account-muted font-subheading">
                  Loading addresses…
                </p>
              ) : addresses.length === 0 && !showAddressForm ? (
                <div className="account-empty font-subheading">
                  <p>No saved addresses yet. Add one before checkout.</p>
                  <button
                    type="button"
                    className="account-btn account-btn--primary"
                    onClick={startAddAddress}
                  >
                    Add address
                  </button>
                </div>
              ) : (
                <ul className="account-address-list">
                  {addresses.map((address) => (
                    <li key={address.id} className="account-address-card">
                      <div>
                        <p className="account-address-card__label font-subheading">
                          {address.address_name || 'Address'}
                          {address.is_default_shipping ? (
                            <span className="account-pill">Default</span>
                          ) : null}
                        </p>
                        {formatAddressLines(address).map((line) => (
                          <p
                            key={line}
                            className="account-address-card__line font-subheading"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                      <div className="account-address-card__actions font-subheading">
                        <button
                          type="button"
                          onClick={() => startEditAddress(address)}
                          disabled={addressBusy}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAddress(address.id)}
                          disabled={addressBusy}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {section === 'orders' && (
            <section
              className="account-panel account-panel--orders"
              aria-labelledby="account-orders"
            >
              <div className="account-panel__head">
                <h2
                  id="account-orders"
                  className="account-panel__title font-heading"
                >
                  Orders
                </h2>
                <p className="account-panel__desc font-subheading">
                  Recent purchases across Elai sellers.
                </p>
              </div>

              {sectionError && <p className="auth-error">{sectionError}</p>}

              {sectionLoading ? (
                <p className="account-muted font-subheading">Loading orders…</p>
              ) : orders.length === 0 ? (
                <div className="account-empty font-subheading">
                  <p>No orders yet — your next favourite is waiting.</p>
                  <Link href="/shop" className="account-btn account-btn--primary">
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="account-order-list">
                  {orders.map((group) => {
                    const currency = orderGroupCurrency(group)
                    const itemCount =
                      group.orders?.reduce(
                        (sum, order) =>
                          sum +
                          (order.items?.reduce(
                            (n, item) => n + (item.quantity ?? 0),
                            0,
                          ) ?? 0),
                        0,
                      ) ?? 0
                    const sellers = (group.orders ?? [])
                      .map((o) => o.seller?.name)
                      .filter((n): n is string => Boolean(n))
                      .slice(0, 3)
                      .join(' · ')
                    const thumbs = orderThumbnails(group)
                    const trackingLinks = orderGroupTrackingLinks(group)
                    const shipped = orderGroupIsShipped(group)

                    return (
                      <li key={group.id} className="account-order-card">
                        {thumbs.length > 0 && (
                          <div
                            className="account-order-card__thumbs"
                            aria-hidden
                          >
                            {thumbs.map((thumb, index) => (
                              <span
                                key={thumb.id}
                                className="account-order-card__thumb"
                                style={{
                                  transform: `rotate(${(index % 2 === 0 ? -1 : 1) * (4 + index)}deg)`,
                                  zIndex: thumbs.length - index,
                                }}
                              >
                                {thumb.src ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={thumb.src} alt="" />
                                ) : (
                                  <em className="font-heading">
                                    {thumb.title.slice(0, 1)}
                                  </em>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="account-order-card__body">
                          <div className="account-order-card__top">
                            <div>
                              <p className="account-order-card__id font-subheading">
                                Order {orderGroupLabel(group)}
                                {shipped ? (
                                  <span className="account-pill">Shipped</span>
                                ) : null}
                              </p>
                              <p className="account-order-card__meta font-subheading">
                                {group.created_at
                                  ? new Date(
                                      group.created_at,
                                    ).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '—'}
                                {' · '}
                                {summarizeOrderStatuses(group)}
                                {group.seller_count
                                  ? ` · ${group.seller_count} seller${group.seller_count === 1 ? '' : 's'}`
                                  : ''}
                              </p>
                            </div>
                            <p className="account-order-card__total font-subheading">
                              {formatCartMoney(group.total, currency)}
                            </p>
                          </div>
                          <p className="account-order-card__items font-subheading">
                            {itemCount} item{itemCount === 1 ? '' : 's'}
                            {sellers ? ` · ${sellers}` : ''}
                          </p>
                          {trackingLinks.length > 0 && (
                            <div className="account-order-card__tracking font-subheading">
                              {trackingLinks.map((link) => (
                                <a
                                  key={link.url}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="account-track-link"
                                >
                                  Track · {link.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              {!sectionLoading && ordersCount > orders.length && (
                <p className="account-muted font-subheading">
                  Showing latest {orders.length} of {ordersCount} orders.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
