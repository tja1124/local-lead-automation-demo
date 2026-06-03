import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { LeadFormData, LeadFormErrors } from '../utils/leadForm'
import {
  getDefaultFormData,
  SERVICE_OPTIONS,
  SOURCE_OPTIONS,
  validateLeadForm,
} from '../utils/leadForm'

interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LeadFormData) => void
}

export function LeadCaptureModal({ isOpen, onClose, onSubmit }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState<LeadFormData>(getDefaultFormData)
  const [errors, setErrors] = useState<LeadFormErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(getDefaultFormData())
      setErrors({})
      setShowSuccess(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const updateField = <K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const validationErrors = validateLeadForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setShowSuccess(true)
    onSubmit(formData)

    window.setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close lead form"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-capture-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-brand-600">Lead capture</p>
            <h2 id="lead-capture-title" className="mt-0.5 text-lg font-semibold text-slate-900">
              Add new inquiry
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Record a new customer request for Apex Auto Detailing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showSuccess ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-900">Lead added successfully</p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {formData.name.trim()} has been added to your inbox with status New.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Customer name" error={errors.name} className="sm:col-span-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className={inputClass(!!errors.name)}
                    placeholder="Jordan Smith"
                  />
                </FormField>

                <FormField label="Phone" error={errors.phone}>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    className={inputClass(!!errors.phone)}
                    placeholder="(512) 555-0199"
                  />
                </FormField>

                <FormField label="Email" error={errors.email} hint="Optional">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className={inputClass(!!errors.email)}
                    placeholder="customer@email.com"
                  />
                </FormField>

                <FormField label="Vehicle" error={errors.vehicle} className="sm:col-span-2">
                  <input
                    type="text"
                    value={formData.vehicle}
                    onChange={(event) => updateField('vehicle', event.target.value)}
                    className={inputClass(!!errors.vehicle)}
                    placeholder="2024 Toyota Camry"
                  />
                </FormField>

                <FormField label="Service interest" error={errors.serviceInterest}>
                  <select
                    value={formData.serviceInterest}
                    onChange={(event) =>
                      updateField('serviceInterest', event.target.value as LeadFormData['serviceInterest'])
                    }
                    className={inputClass(!!errors.serviceInterest)}
                  >
                    {SERVICE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Source" error={errors.source}>
                  <select
                    value={formData.source}
                    onChange={(event) =>
                      updateField('source', event.target.value as LeadFormData['source'])
                    }
                    className={inputClass(!!errors.source)}
                  >
                    {SOURCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Requested date" error={errors.requestedDate}>
                  <input
                    type="date"
                    value={formData.requestedDate}
                    onChange={(event) => updateField('requestedDate', event.target.value)}
                    className={inputClass(!!errors.requestedDate)}
                  />
                </FormField>

                <FormField label="Estimated value ($)" error={errors.estimatedValue}>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.estimatedValue}
                    onChange={(event) => updateField('estimatedValue', event.target.value)}
                    className={inputClass(!!errors.estimatedValue)}
                    placeholder="450"
                  />
                </FormField>

                <FormField label="Notes" className="sm:col-span-2" hint="Optional">
                  <textarea
                    value={formData.notes}
                    onChange={(event) => updateField('notes', event.target.value)}
                    rows={3}
                    className={`${inputClass(false)} resize-none`}
                    placeholder="Customer preferences, damage notes, scheduling requests..."
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Add lead
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
  }`
}

function FormField({
  label,
  error,
  hint,
  className = '',
  children,
}: {
  label: string
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">({hint})</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
