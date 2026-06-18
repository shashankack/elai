'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import {
  accountStepSchema,
  bankStepSchema,
  businessStepSchema,
  storeStepSchema,
  type AccountStepValues,
  type BankStepValues,
  type BusinessStepValues,
  type StoreStepValues,
} from '@/lib/onboarding-validations'
import { ONBOARDING_STEPS } from './constants'

function flattenErrors(error: { fieldErrors: Record<string, string[] | undefined> }) {
  return Object.fromEntries(
    Object.entries(error.fieldErrors).map(([key, value]) => [key, value?.[0]])
  ) as Record<string, string | undefined>
}

async function uploadDocument(email: string, file: File): Promise<string> {
  const request = await fetch('/api/onboarding/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  })

  const payload = await request.json()
  if (!request.ok) {
    throw new Error(payload.error || 'Failed to prepare upload')
  }

  const uploadResponse = await fetch(payload.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload document')
  }

  return payload.fileKey as string
}

export function useOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const [account, setAccount] = useState<AccountStepValues>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })

  const [store, setStore] = useState<StoreStepValues>({
    name: '',
    email: '',
    phone: '',
    description: '',
    handle: '',
  })

  const [business, setBusiness] = useState<BusinessStepValues>({
    address_1: '',
    city: '',
    province: '',
    postal_code: '',
    corporate_name: '',
    tax_id: '',
    registration_number: '',
  })

  const [bank, setBank] = useState<BankStepValues>({
    holder_name: '',
    bank_name: '',
    routing_number: '',
    account_number: '',
    gst_certificate_key: '',
    cancelled_cheque_key: '',
  })

  const [gstFileName, setGstFileName] = useState('')
  const [chequeFileName, setChequeFileName] = useState('')

  const currentStep = ONBOARDING_STEPS[step]

  const goNext = () => {
    setSubmitError(null)
    setErrors({})

    if (step === 0) {
      const result = accountStepSchema.safeParse(account)
      if (!result.success) {
        setErrors(flattenErrors(result.error.flatten()))
        return
      }
      if (!store.email) {
        setStore((prev) => ({ ...prev, email: account.email }))
      }
    }

    if (step === 1) {
      const result = storeStepSchema.safeParse(store)
      if (!result.success) {
        setErrors(flattenErrors(result.error.flatten()))
        return
      }
      setBusiness((prev) => ({
        ...prev,
        corporate_name: prev.corporate_name || store.name,
      }))
      setBank((prev) => ({
        ...prev,
        holder_name: prev.holder_name || store.name,
      }))
    }

    if (step === 2) {
      const result = businessStepSchema.safeParse(business)
      if (!result.success) {
        setErrors(flattenErrors(result.error.flatten()))
        return
      }
      setBank((prev) => ({
        ...prev,
        holder_name: prev.holder_name || business.corporate_name,
      }))
    }

    setDirection('forward')
    setStep((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1))
  }

  const goBack = () => {
    setErrors({})
    setSubmitError(null)
    setDirection('back')
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleDocumentUpload = async (
    field: 'gst_certificate_key' | 'cancelled_cheque_key',
    file: File,
    setFileName: (name: string) => void
  ) => {
    if (!account.email) {
      setSubmitError('Enter your account email in step 1 before uploading documents')
      return
    }

    setUploadingField(field)
    setSubmitError(null)

    try {
      const fileKey = await uploadDocument(account.email, file)
      setBank((prev) => ({ ...prev, [field]: fileKey }))
      setFileName(file.name)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploadingField(null)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitError(null)
    setErrors({})

    const result = bankStepSchema.safeParse(bank)
    if (!result.success) {
      setErrors(flattenErrors(result.error.flatten()))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, store, business, bank }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Submission failed')
      }

      router.push(`/thank-you?seller=${encodeURIComponent(payload.handle || '')}`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastStep = step === ONBOARDING_STEPS.length - 1
  const progress = ((step + 1) / ONBOARDING_STEPS.length) * 100

  return {
    step,
    currentStep,
    direction,
    progress,
    isLastStep,
    errors,
    submitError,
    isSubmitting,
    uploadingField,
    account,
    setAccount,
    store,
    setStore,
    business,
    setBusiness,
    bank,
    setBank,
    gstFileName,
    chequeFileName,
    setGstFileName,
    setChequeFileName,
    goNext,
    goBack,
    handleSubmit,
    handleDocumentUpload,
  }
}
