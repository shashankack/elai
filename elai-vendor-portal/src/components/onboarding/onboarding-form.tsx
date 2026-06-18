'use client'

import Link from 'next/link'
import { BotanicalDecoration } from './botanical-decoration'
import { StepSidebar } from './step-sidebar'
import { Alert, Button, Field, FileDropzone, TextArea, TextInput } from './ui'
import { useOnboarding } from './use-onboarding'

export default function OnboardingForm() {
  const {
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
  } = useOnboarding()

  return (
    <div className="min-h-screen bg-[#FFF7D4] text-[#34421E] lg:grid lg:grid-cols-[minmax(320px,420px)_1fr]">
      <StepSidebar step={step} progress={progress} />

      <div className="relative flex min-h-screen flex-col">
        <BotanicalDecoration className="pointer-events-none absolute right-0 top-0 hidden h-[420px] w-[180px] opacity-70 md:block" />

        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8 sm:px-8 lg:py-14">
          <div className="mb-8 lg:hidden">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#34421E]/50">
              <span>
                Step {step + 1} of 4 · {currentStep.label}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#34421E]/10">
              <div
                className="h-full rounded-full bg-[#34421E] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div
            key={step}
            className={`onboarding-step ${direction === 'forward' ? 'onboarding-step-forward' : 'onboarding-step-back'}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#34421E]/50">
              {currentStep.label}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-[0.02em] sm:text-4xl">
              {currentStep.title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#34421E]/65">
              {currentStep.description}
            </p>
          </div>

          <form
            onSubmit={isLastStep ? handleSubmit : (e) => { e.preventDefault(); goNext() }}
            className="mt-8 flex flex-1 flex-col"
          >
            <div
              key={`form-${step}`}
              className={`onboarding-panel rounded-[28px] border border-[#34421E]/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(52,66,30,0.08)] backdrop-blur-sm sm:p-8 ${direction === 'forward' ? 'onboarding-step-forward' : 'onboarding-step-back'}`}
            >
              {step === 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First name" error={errors.first_name}>
                    <TextInput
                      autoComplete="given-name"
                      value={account.first_name}
                      error={errors.first_name}
                      onChange={(e) => setAccount({ ...account, first_name: e.target.value })}
                    />
                  </Field>
                  <Field label="Last name" error={errors.last_name}>
                    <TextInput
                      autoComplete="family-name"
                      value={account.last_name}
                      error={errors.last_name}
                      onChange={(e) => setAccount({ ...account, last_name: e.target.value })}
                    />
                  </Field>
                  <Field
                    label="Email"
                    hint="Used to sign in to your vendor dashboard"
                    error={errors.email}
                    className="sm:col-span-2"
                  >
                    <TextInput
                      type="email"
                      autoComplete="email"
                      value={account.email}
                      error={errors.email}
                      onChange={(e) => setAccount({ ...account, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Password" error={errors.password}>
                    <TextInput
                      type="password"
                      autoComplete="new-password"
                      value={account.password}
                      error={errors.password}
                      onChange={(e) => setAccount({ ...account, password: e.target.value })}
                    />
                  </Field>
                  <Field label="Confirm password" error={errors.confirm_password}>
                    <TextInput
                      type="password"
                      autoComplete="new-password"
                      value={account.confirm_password}
                      error={errors.confirm_password}
                      onChange={(e) => setAccount({ ...account, confirm_password: e.target.value })}
                    />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-5">
                  <Field label="Store name" error={errors.name}>
                    <TextInput
                      value={store.name}
                      error={errors.name}
                      placeholder="e.g. Elai Naturals"
                      onChange={(e) => setStore({ ...store, name: e.target.value })}
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Store email" error={errors.email}>
                      <TextInput
                        type="email"
                        value={store.email}
                        error={errors.email}
                        onChange={(e) => setStore({ ...store, email: e.target.value })}
                      />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                      <TextInput
                        type="tel"
                        value={store.phone}
                        error={errors.phone}
                        placeholder="+91 98765 43210"
                        onChange={(e) => setStore({ ...store, phone: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field
                    label="Store URL handle"
                    optional
                    hint="elai.com/store/your-handle"
                    error={errors.handle}
                  >
                    <div className="flex overflow-hidden rounded-2xl border border-[#34421E]/12 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus-within:border-[#34421E]/45 focus-within:shadow-[0_0_0_4px_rgba(52,66,30,0.08)]">
                      <span className="flex items-center border-r border-[#34421E]/10 bg-[#34421E]/4 px-4 text-sm text-[#34421E]/50">
                        @
                      </span>
                      <input
                        className="w-full bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-[#34421E]/35"
                        placeholder="your-store"
                        value={store.handle}
                        onChange={(e) =>
                          setStore({ ...store, handle: e.target.value.toLowerCase() })
                        }
                      />
                    </div>
                  </Field>
                  <Field label="About your store" optional error={errors.description}>
                    <TextArea
                      value={store.description}
                      error={errors.description}
                      placeholder="What do you sell? What makes your brand special?"
                      onChange={(e) => setStore({ ...store, description: e.target.value })}
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Business address" error={errors.address_1} className="sm:col-span-2">
                    <TextInput
                      value={business.address_1}
                      error={errors.address_1}
                      onChange={(e) => setBusiness({ ...business, address_1: e.target.value })}
                    />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <TextInput
                      value={business.city}
                      error={errors.city}
                      onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                    />
                  </Field>
                  <Field label="State" error={errors.province}>
                    <TextInput
                      value={business.province}
                      error={errors.province}
                      onChange={(e) => setBusiness({ ...business, province: e.target.value })}
                    />
                  </Field>
                  <Field label="PIN code" error={errors.postal_code}>
                    <TextInput
                      value={business.postal_code}
                      error={errors.postal_code}
                      onChange={(e) => setBusiness({ ...business, postal_code: e.target.value })}
                    />
                  </Field>
                  <Field label="Legal business name" error={errors.corporate_name}>
                    <TextInput
                      value={business.corporate_name}
                      error={errors.corporate_name}
                      onChange={(e) =>
                        setBusiness({ ...business, corporate_name: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="GSTIN" hint="15-character GST identification number" error={errors.tax_id}>
                    <TextInput
                      value={business.tax_id}
                      error={errors.tax_id}
                      className="font-mono uppercase tracking-wider"
                      placeholder="29ABCDE1234F1Z5"
                      onChange={(e) =>
                        setBusiness({ ...business, tax_id: e.target.value.toUpperCase() })
                      }
                    />
                  </Field>
                  <Field
                    label="CIN"
                    optional
                    hint="Corporate Identification Number, if registered"
                    error={errors.registration_number}
                    className="sm:col-span-2"
                  >
                    <TextInput
                      value={business.registration_number}
                      error={errors.registration_number}
                      className="font-mono uppercase tracking-wide"
                      placeholder="U12345KA2020PTC123456"
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          registration_number: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5">
                  <Field label="Account holder name" error={errors.holder_name}>
                    <TextInput
                      value={bank.holder_name}
                      error={errors.holder_name}
                      onChange={(e) => setBank({ ...bank, holder_name: e.target.value })}
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Bank name" error={errors.bank_name}>
                      <TextInput
                        value={bank.bank_name}
                        error={errors.bank_name}
                        onChange={(e) => setBank({ ...bank, bank_name: e.target.value })}
                      />
                    </Field>
                    <Field label="IFSC" error={errors.routing_number}>
                      <TextInput
                        value={bank.routing_number}
                        error={errors.routing_number}
                        className="font-mono uppercase"
                        onChange={(e) =>
                          setBank({ ...bank, routing_number: e.target.value.toUpperCase() })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Account number" error={errors.account_number}>
                    <TextInput
                      value={bank.account_number}
                      error={errors.account_number}
                      className="font-mono"
                      onChange={(e) => setBank({ ...bank, account_number: e.target.value })}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FileDropzone
                      label="GST certificate"
                      hint="Optional but speeds up approval"
                      fileName={gstFileName}
                      uploading={uploadingField === 'gst_certificate_key'}
                      disabled={!account.email}
                      onFile={(file) =>
                        handleDocumentUpload('gst_certificate_key', file, setGstFileName)
                      }
                    />
                    <FileDropzone
                      label="Cancelled cheque"
                      hint="Or bank proof document"
                      fileName={chequeFileName}
                      uploading={uploadingField === 'cancelled_cheque_key'}
                      disabled={!account.email}
                      onFile={(file) =>
                        handleDocumentUpload('cancelled_cheque_key', file, setChequeFileName)
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {submitError && (
              <div className="mt-5">
                <Alert variant="error">{submitError}</Alert>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              {step > 0 ? (
                <Button type="button" variant="secondary" onClick={goBack}>
                  Back
                </Button>
              ) : (
                <Link
                  href="/"
                  className="text-sm text-[#34421E]/60 underline-offset-4 transition hover:text-[#34421E] hover:underline"
                >
                  ← Back to home
                </Link>
              )}

              {isLastStep ? (
                <Button type="submit" loading={isSubmitting} disabled={uploadingField !== null}>
                  Submit application
                </Button>
              ) : (
                <Button type="submit">Continue</Button>
              )}
            </div>

            <p className="mt-8 text-center text-sm text-[#34421E]/55 lg:hidden">
              Already a vendor?{' '}
              <Link href="/login" className="font-medium text-[#34421E] underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
