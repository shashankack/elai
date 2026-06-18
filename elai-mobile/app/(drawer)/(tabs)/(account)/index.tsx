import { Loading } from '@/components/loading'
import { Colors } from '@/constants/theme'
import { useAuth } from '@/context/auth-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { sdk } from '@/lib/sdk'
import { formatPrice } from '@/lib/format-price'
import type { HttpTypes } from '@medusajs/types'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

type AuthMode = 'login' | 'register'

export default function AccountScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const { customer, loading, error, login, register, logout } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const { orders: fetched } = await sdk.store.order.list({ limit: 20 })
      setOrders(fetched)
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (customer) {
      fetchOrders()
    } else {
      setOrders([])
    }
  }, [customer, fetchOrders])

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Email and password are required.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!firstName || !lastName) {
          Alert.alert('Missing fields', 'First and last name are required.')
          return
        }
        await register(email, password, firstName, lastName)
      }
      setPassword('')
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  if (loading && !customer) {
    return <Loading message="Loading account..." />
  }

  if (!customer) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.authContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.text }]}>Elai account</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Sign in to track orders and save your details at checkout.
        </Text>

        <View style={styles.modeRow}>
          <Pressable onPress={() => setMode('login')}>
            <Text
              style={[
                styles.modeLabel,
                { color: mode === 'login' ? colors.tint : colors.icon },
              ]}
            >
              Sign in
            </Text>
          </Pressable>
          <Pressable onPress={() => setMode('register')}>
            <Text
              style={[
                styles.modeLabel,
                { color: mode === 'register' ? colors.tint : colors.icon },
              ]}
            >
              Create account
            </Text>
          </Pressable>
        </View>

        {mode === 'register' && (
          <>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="First name"
              placeholderTextColor={colors.icon}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Last name"
              placeholderTextColor={colors.icon}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </>
        )}

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Email"
          placeholderTextColor={colors.icon}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.icon}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </Text>
        </Pressable>
      </ScrollView>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.loggedInContent}
    >
      <View style={[styles.card, { borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {customer.first_name} {customer.last_name}
        </Text>
        <Text style={{ color: colors.icon }}>{customer.email}</Text>
      </View>

      <Pressable
        style={[styles.secondaryButton, { borderColor: colors.border }]}
        onPress={handleLogout}
      >
        <Text style={{ color: colors.text }}>Sign out</Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your orders</Text>

      {ordersLoading ? (
        <Loading message="Loading orders..." />
      ) : orders.length === 0 ? (
        <Text style={{ color: colors.icon }}>No orders yet.</Text>
      ) : (
        orders.map((order) => (
          <Pressable
            key={order.id}
            style={[styles.orderCard, { borderColor: colors.border }]}
            onPress={() => router.push(`/order-confirmation/${order.id}`)}
          >
            <Text style={[styles.orderId, { color: colors.text }]}>
              Order #{order.display_id}
            </Text>
            <Text style={{ color: colors.icon }}>
              {formatPrice(order.total, order.currency_code)}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContent: {
    padding: 20,
    gap: 12,
  },
  loggedInContent: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '500',
  },
})
