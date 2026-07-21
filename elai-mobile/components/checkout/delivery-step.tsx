import { AddressForm } from '@/components/checkout/address-form'
import { Button } from '@/components/ui/button'
import { Colors, FontFamily, Radii, Spacing } from '@/constants/theme'
import { useRegion } from '@/context/region-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import {
  addressLabel,
  formatAddressLines,
  type StoreCustomerAddress,
} from '@/lib/addresses'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'

interface Address {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  countryCode: string
  phone: string
}

interface DeliveryStepProps {
  email: string
  shippingAddress: Address
  billingAddress: Address
  useSameForBilling: boolean
  loading: boolean
  isAuthenticated: boolean
  savedAddresses: StoreCustomerAddress[]
  savedAddressesLoading: boolean
  selectedAddressId: string | null
  useNewAddress: boolean
  onEmailChange: (value: string) => void
  onShippingAddressChange: (field: keyof Address, value: string) => void
  onBillingAddressChange: (field: keyof Address, value: string) => void
  onUseSameForBillingChange: (value: boolean) => void
  onSelectSavedAddress: (addressId: string) => void
  onUseNewAddressChange: (value: boolean) => void
  onNext: () => void
}

export function DeliveryStep({
  email,
  shippingAddress,
  billingAddress,
  useSameForBilling,
  loading,
  isAuthenticated,
  savedAddresses,
  savedAddressesLoading,
  selectedAddressId,
  useNewAddress,
  onEmailChange,
  onShippingAddressChange,
  onBillingAddressChange,
  onUseSameForBillingChange,
  onSelectSavedAddress,
  onUseNewAddressChange,
  onNext,
}: DeliveryStepProps) {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const { selectedRegion } = useRegion()
  const scrollViewRef = useRef<ScrollView>(null)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)

  const countries = selectedRegion?.countries || []
  const showSavedList =
    isAuthenticated && savedAddresses.length > 0 && !useNewAddress
  const showNewForm =
    !isAuthenticated || useNewAddress || savedAddresses.length === 0

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    )
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    )

    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [])

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardVisible && styles.scrollContentKeyboard,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact
          </Text>

          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />

          <View style={styles.headerRow}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              Shipping address
            </Text>
            {isAuthenticated && savedAddresses.length > 0 ? (
              <Pressable onPress={() => onUseNewAddressChange(!useNewAddress)}>
                <Text style={[styles.toggleLink, { color: colors.tint }]}>
                  {useNewAddress ? 'Use saved' : 'Add new'}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {isAuthenticated && savedAddressesLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.tint} />
              <Text style={{ color: colors.textMuted, marginLeft: 8 }}>
                Loading saved addresses…
              </Text>
            </View>
          ) : null}

          {showSavedList ? (
            <View style={styles.addressList}>
              {savedAddresses.map((address) => {
                const selected = selectedAddressId === address.id
                const lines = formatAddressLines(address)
                return (
                  <Pressable
                    key={address.id}
                    onPress={() => onSelectSavedAddress(address.id)}
                    style={[
                      styles.addressCard,
                      {
                        borderColor: selected ? colors.tint : colors.border,
                        backgroundColor: selected
                          ? `${colors.tint}14`
                          : colors.cardBackground,
                      },
                    ]}
                  >
                    <View style={styles.addressCardTop}>
                      <Text
                        style={[
                          styles.addressName,
                          { color: selected ? colors.tint : colors.text },
                        ]}
                      >
                        {addressLabel(address)}
                      </Text>
                      {selected ? (
                        <Text style={{ color: colors.tint, fontWeight: '700' }}>
                          ✓
                        </Text>
                      ) : null}
                    </View>
                    {lines.map((line) => (
                      <Text
                        key={`${address.id}-${line}`}
                        style={[styles.addressLine, { color: colors.textMuted }]}
                      >
                        {line}
                      </Text>
                    ))}
                  </Pressable>
                )
              })}
            </View>
          ) : null}

          {showNewForm ? (
            <>
              {isAuthenticated && savedAddresses.length > 0 ? (
                <Text style={[styles.helper, { color: colors.textMuted }]}>
                  Enter a new shipping address for this order.
                </Text>
              ) : null}
              <AddressForm
                firstName={shippingAddress.firstName}
                lastName={shippingAddress.lastName}
                address={shippingAddress.address}
                city={shippingAddress.city}
                postalCode={shippingAddress.postalCode}
                countryCode={shippingAddress.countryCode}
                phone={shippingAddress.phone}
                countries={countries}
                onFirstNameChange={(value) =>
                  onShippingAddressChange('firstName', value)
                }
                onLastNameChange={(value) =>
                  onShippingAddressChange('lastName', value)
                }
                onAddressChange={(value) =>
                  onShippingAddressChange('address', value)
                }
                onCityChange={(value) => onShippingAddressChange('city', value)}
                onPostalCodeChange={(value) =>
                  onShippingAddressChange('postalCode', value)
                }
                onCountryCodeChange={(value) =>
                  onShippingAddressChange('countryCode', value)
                }
                onPhoneChange={(value) =>
                  onShippingAddressChange('phone', value)
                }
              />
            </>
          ) : null}

          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>
              Use same address for billing
            </Text>
            <Switch
              value={useSameForBilling}
              onValueChange={onUseSameForBillingChange}
              trackColor={{ false: colors.border, true: `${colors.tint}88` }}
              thumbColor={useSameForBilling ? colors.tint : '#f4f3f4'}
            />
          </View>

          {!useSameForBilling && (
            <>
              <Text
                style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}
              >
                Billing address
              </Text>
              <AddressForm
                firstName={billingAddress.firstName}
                lastName={billingAddress.lastName}
                address={billingAddress.address}
                city={billingAddress.city}
                postalCode={billingAddress.postalCode}
                countryCode={billingAddress.countryCode}
                phone={billingAddress.phone}
                countries={countries}
                onFirstNameChange={(value) =>
                  onBillingAddressChange('firstName', value)
                }
                onLastNameChange={(value) =>
                  onBillingAddressChange('lastName', value)
                }
                onAddressChange={(value) =>
                  onBillingAddressChange('address', value)
                }
                onCityChange={(value) => onBillingAddressChange('city', value)}
                onPostalCodeChange={(value) =>
                  onBillingAddressChange('postalCode', value)
                }
                onCountryCodeChange={(value) =>
                  onBillingAddressChange('countryCode', value)
                }
                onPhoneChange={(value) =>
                  onBillingAddressChange('phone', value)
                }
              />
            </>
          )}
        </View>

        <View
          style={[styles.buttonContainer, { backgroundColor: colors.background }]}
        >
          <Button
            title="Continue"
            onPress={onNext}
            loading={loading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  scrollContentKeyboard: {
    paddingBottom: Platform.OS === 'ios' ? 300 : 320,
  },
  section: {
    padding: Spacing.xl,
  },
  buttonContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontFamily: FontFamily.heading,
    fontSize: 22,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  helper: {
    fontSize: 13,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addressList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addressCard: {
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  addressCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '700',
  },
  addressLine: {
    fontSize: 13,
    lineHeight: 18,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.lg,
  },
  switchLabel: {
    fontSize: 15,
    flex: 1,
    paddingRight: Spacing.md,
  },
  button: {
    marginTop: 8,
  },
})
