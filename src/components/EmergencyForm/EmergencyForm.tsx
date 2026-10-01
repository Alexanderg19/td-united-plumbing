'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormDict, Locale } from '@/app/[lang]/dictionaries'
import { isValidPhone } from '@/lib/phone'
import PhoneField from '@/components/PhoneField'
import styles from './EmergencyForm.module.css'

declare global {
  interface Window {
    grecaptcha: {
      render: (container: string | HTMLElement, params: {
        sitekey: string
        callback: () => void
        'expired-callback': () => void
      }) => number
      getResponse: (widgetId?: number) => string
      reset: (widgetId?: number) => void
    }
  }
}

const PHONE_DISPLAY = '(954) 555-0199'
const PHONE_TEL = '+19545550199'
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

interface EmergencyFormProps {
  isOpen: boolean
  onClose: () => void
  dict: FormDict
  lang: Locale
}

interface FieldErrors { name: boolean; phone: boolean; email: boolean; type: boolean; address: boolean }
interface FieldFilled { name: boolean; phone: boolean; type: boolean; address: boolean }

const EMPTY_ERRORS: FieldErrors = { name: false, phone: false, email: false, type: false, address: false }
const EMPTY_FILLED: FieldFilled = { name: false, phone: false, type: false, address: false }

function validEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) }

export default function EmergencyForm({ isOpen, onClose, dict, lang }: EmergencyFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRecapErr, setShowRecapErr] = useState(false)
  const [showSubmitErr, setShowSubmitErr] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>(EMPTY_ERRORS)
  const [filled, setFilled] = useState<FieldFilled>(EMPTY_FILLED)
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const typeInputRef = useRef<HTMLSelectElement>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const recaptchaWidgetId = useRef<number | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setTimeout(() => {
      const el = formRef.current
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 90
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
      nameInputRef.current?.focus({ preventScroll: true })
    }, 60)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || isSuccess || recaptchaWidgetId.current !== null) return
    const render = () => {
      if (typeof window.grecaptcha?.render !== 'function') return false
      recaptchaWidgetId.current = window.grecaptcha.render('ef-recaptcha', {
        sitekey: SITE_KEY,
        callback: () => setRecaptchaCompleted(true),
        'expired-callback': () => setRecaptchaCompleted(false),
      })
      return true
    }
    if (!render()) {
      const interval = setInterval(() => { if (render()) clearInterval(interval) }, 100)
      return () => clearInterval(interval)
    }
  }, [isOpen, isSuccess])

  const isFormValid = Object.values(filled).every(Boolean) && recaptchaCompleted

  const setFill = (field: keyof FieldFilled, value: string) =>
    setFilled((prev) => ({ ...prev, [field]: value.trim().length > 0 }))

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: false }))

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const name = nameInputRef.current?.value ?? ''
    const phone = phoneInputRef.current?.value ?? ''
    const email = emailInputRef.current?.value ?? ''
    const type = typeInputRef.current?.value ?? ''
    const address = addressInputRef.current?.value ?? ''

    const nameErr = !name.trim()
    const phoneErr = !isValidPhone(phone)
    const emailErr = email.trim() !== '' && !validEmail(email)
    const typeErr = !type
    const addressErr = !address.trim()
    setErrors({ name: nameErr, phone: phoneErr, email: emailErr, type: typeErr, address: addressErr })

    const token = window.grecaptcha?.getResponse(recaptchaWidgetId.current ?? undefined) ?? ''
    if (nameErr || phoneErr || emailErr || typeErr || addressErr || !token) {
      if (nameErr) nameInputRef.current?.focus()
      else if (phoneErr) phoneInputRef.current?.focus()
      else if (emailErr) emailInputRef.current?.focus()
      else if (typeErr) typeInputRef.current?.focus()
      else if (addressErr) addressInputRef.current?.focus()
      return
    }

    setShowRecapErr(false)
    setShowSubmitErr(false)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'emergency', token, lang, name, phone, email: email.trim() || undefined, emergencyType: type, address }),
      })
      const { success, error } = await res.json()
      if (!success) {
        if (error === 'recaptcha') {
          setShowRecapErr(true)
          setRecaptchaCompleted(false)
          window.grecaptcha?.reset(recaptchaWidgetId.current ?? undefined)
        } else {
          setShowSubmitErr(true)
        }
        return
      }
    } catch {
      setShowSubmitErr(true)
      return
    } finally {
      setIsSubmitting(false)
    }

    setIsSuccess(true)
    setTimeout(() => {
      const el = formRef.current
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' })
    }, 40)
  }

  const handleClose = () => {
    if (isSuccess) recaptchaWidgetId.current = null
    setIsSuccess(false)
    setRecaptchaCompleted(false)
    setFilled(EMPTY_FILLED)
    setErrors(EMPTY_ERRORS)
    setShowRecapErr(false)
    setShowSubmitErr(false)
    onClose()
  }

  const eformClass = [
    styles.eform,
    isOpen && styles.isOpen,
    showRecapErr && styles.showRecapErr,
  ].filter(Boolean).join(' ')

  return (
    <div id="emergencyForm" ref={formRef} className={eformClass}>
      {!isSuccess && (
        <div className={styles.head}>
          <div>
            <span className={styles.dot} aria-hidden="true"></span>
            <h3>{dict.title}</h3>
          </div>
          <div className={styles.close} onClick={handleClose}>X</div>
        </div>
      )}

      {!isSuccess && (
        <div className={styles.body}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="fgrid">
              <div className={`field${errors.name ? ' has-error' : ''}`}>
                <label htmlFor="ef-name">{dict.labelName} <span className="req">*</span></label>
                <input type="text" id="ef-name" name="name" autoComplete="name"
                  placeholder={dict.placeholderName} ref={nameInputRef}
                  onChange={(e) => { clearError('name'); setFill('name', e.target.value) }} />
                <span className="field__err" role="alert">{dict.errName}</span>
              </div>

              <div className={`field${errors.phone ? ' has-error' : ''}`}>
                <label htmlFor="ef-phone">{dict.labelPhone} <span className="req">*</span></label>
                <PhoneField id="ef-phone" lang={lang} inputRef={phoneInputRef}
                  onChange={(value) => { clearError('phone'); setFill('phone', value) }} />
                <span className="field__err" role="alert">{dict.errPhone}</span>
              </div>

              <div className={`field${errors.email ? ' has-error' : ''}`}>
                <label htmlFor="ef-email">{dict.labelEmail} <span style={{ color: 'var(--gray)' }}>{dict.optional}</span></label>
                <input type="email" id="ef-email" name="email" autoComplete="email"
                  placeholder={dict.placeholderEmail} ref={emailInputRef}
                  onChange={() => clearError('email')} />
                <span className="field__err" role="alert">{dict.errEmail}</span>
              </div>

              <div className={`field${errors.type ? ' has-error' : ''}`}>
                <label htmlFor="ef-type">{dict.labelType} <span className="req">*</span></label>
                <select id="ef-type" name="type" ref={typeInputRef}
                  onChange={(e) => { clearError('type'); setFill('type', e.target.value) }}
                  defaultValue="">
                  <option value="">{dict.placeholderType}</option>
                  {dict.options.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                <span className="field__err" role="alert">{dict.errType}</span>
              </div>

              <div className={`field field--full${errors.address ? ' has-error' : ''}`}>
                <label htmlFor="ef-address">{dict.labelAddress} <span className="req">*</span></label>
                <input type="text" id="ef-address" name="address" autoComplete="street-address"
                  placeholder={dict.placeholderAddress} ref={addressInputRef}
                  onChange={(e) => { clearError('address'); setFill('address', e.target.value) }} />
                <span className="field__err" role="alert">{dict.errAddress}</span>
              </div>

              <div className="field field--full">
                <div id="ef-recaptcha"></div>
                <span className={styles.recapErr} role="alert">{dict.errRecaptcha}</span>
                {showSubmitErr && (
                  <span className={styles.recapErr} role="alert" style={{ display: 'block' }}>{dict.errSubmit}</span>
                )}
              </div>
            </div>

            <div className="eform__actions">
              <button
                type="submit"
                className={`btn btn--emergency btn--lg${!isFormValid || isSubmitting ? ` ${styles.submitDisabled}` : ''}`}
                disabled={!isFormValid || isSubmitting}
              >
                <span className="btn__dot" aria-hidden="true"></span>
                {isSubmitting ? dict.btnSending : dict.btnSend}
              </button>
              <button type="button" className={`btn btn--lg ${styles.btn_outline}`}>
                <span className="btn__dot" aria-hidden="true" style={{ background: 'var(--red)' }}></span>
                <span className="eform__note">
                  {dict.btnCall} —{' '}
                  <a href={`tel:${PHONE_TEL}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>
                    {PHONE_DISPLAY}
                  </a>
                </span>
              </button>
            </div>
            <p className="eform__consent">
              {dict.consent}{' '}
              <a href={`/${lang}/privacy`} target="_blank" rel="noopener">{dict.consentLink}</a>.
            </p>
          </form>
        </div>
      )}

      {isSuccess && (
        <div className={styles.esuccess} aria-live="polite">
          <button className={styles.esuccess__close} onClick={handleClose} aria-label="Close">✕</button>
          <div className={styles.esuccess__check}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>{dict.successTitle}</h3>
          <p>{dict.successMsg}</p>
          <a className={styles.callLine} href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
        </div>
      )}
    </div>
  )
}
