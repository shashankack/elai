'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-xs font-medium text-red-700" role="alert">
      {message}
    </p>
  )
}

type FieldProps = {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: React.ReactNode
  className?: string
}

export function Field({ label, hint, error, optional, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#34421E]/85">
          {label}
          {optional && (
            <span className="ml-2 normal-case tracking-normal text-[#34421E]/45">Optional</span>
          )}
        </label>
      </div>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-[#34421E]/50">{hint}</p>}
      <FieldError message={error} />
    </div>
  )
}

const inputBase =
  'w-full rounded-2xl border border-[#34421E]/12 bg-white/90 px-4 py-3.5 text-[15px] text-[#34421E] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition-all duration-200 placeholder:text-[#34421E]/35 focus:border-[#34421E]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(52,66,30,0.08)]'

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
}

export function TextInput({ error, className = '', ...props }: TextInputProps) {
  return (
    <input
      className={`${inputBase} ${error ? 'border-red-300 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]' : ''} ${className}`}
      {...props}
    />
  )
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string
}

export function TextArea({ error, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`${inputBase} min-h-[120px] resize-y ${error ? 'border-red-300' : ''} ${className}`}
      {...props}
    />
  )
}

type FileDropzoneProps = {
  label: string
  hint?: string
  fileName?: string
  uploading?: boolean
  disabled?: boolean
  onFile: (file: File) => void
}

export function FileDropzone({
  label,
  hint,
  fileName,
  uploading,
  disabled,
  onFile,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0])
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`group cursor-pointer rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 ${
        isDragActive
          ? 'border-[#34421E] bg-[#34421E]/5'
          : fileName
            ? 'border-[#34421E]/35 bg-white/95'
            : 'border-[#34421E]/18 bg-white/60 hover:border-[#34421E]/30 hover:bg-white/80'
      } ${disabled || uploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#34421E]/8 text-[#34421E]">
        {uploading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#34421E]/20 border-t-[#34421E]" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <p className="text-sm font-medium text-[#34421E]">{label}</p>
      <p className="mt-1 text-xs text-[#34421E]/55">
        {fileName ? `Uploaded: ${fileName}` : 'PDF, JPG or PNG · drag & drop or click'}
      </p>
      {hint && <p className="mt-2 text-[11px] text-[#34421E]/45">{hint}</p>}
    </div>
  )
}

export function Alert({ variant, children }: { variant: 'error' | 'info'; children: React.ReactNode }) {
  const styles =
    variant === 'error'
      ? 'border-red-200/80 bg-red-50/90 text-red-900'
      : 'border-[#34421E]/15 bg-white/80 text-[#34421E]/80'

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${styles}`} role="alert">
      {children}
    </div>
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary:
      'bg-[#34421E] text-[#FFF7D4] shadow-[0_8px_24px_rgba(52,66,30,0.18)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(52,66,30,0.22)] active:translate-y-0',
    secondary:
      'border border-[#34421E]/25 bg-white/70 text-[#34421E] hover:border-[#34421E]/45 hover:bg-white',
    ghost: 'text-[#34421E]/70 hover:text-[#34421E] hover:bg-[#34421E]/5',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current" />
      )}
      {children}
    </button>
  )
}
