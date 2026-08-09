'use client'

import { useEffect, useRef, useState } from 'react'
import type { ContactCardDict, Locale } from '@/app/[lang]/dictionaries'
import styles from './ContactTabCard.module.css'

const PHONE_DISPLAY = '(954) 555-0199'
const PHONE_TEL = '+19545550199'
const WA_URL = 'https://wa.me/19545550199'
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

type TabKey = 'schedule' | 'quote'

interface ScheduleErrors { name: boolean; phone: boolean; email: boolean; service: boolean; address: boolean; date: boolean; time: boolean }
interface ScheduleFilled { name: boolean; phone: boolean; email: boolean; service: boolean; address: boolean; date: boolean; time: boolean }
interface QuoteErrors { name: boolean; phone: boolean; email: boolean; message: boolean }
interface QuoteFilled { name: boolean; phone: boolean; email: boolean; message: boolean }

function validPhone(v: string) { return (v.match(/\d/g) || []).length >= 7 }
function validEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) }

interface Props { dict: ContactCardDict; lang: Locale }

export default function ContactTabCard({ dict, lang }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('schedule')
  const [isSuccess, setIsSuccess] = useState(false)
  const [successTitle, setSuccessTitle] = useState('')
  const [successText, setSuccessText] = useState('')
  const [isScheduleSubmitting, setIsScheduleSubmitting] = useState(false)
  const [isQuoteSubmitting, setIsQuoteSubmitting] = useState(false)
  const [showScheduleSubmitErr, setShowScheduleSubmitErr] = useState(false)
  const [showQuoteSubmitErr, setShowQuoteSubmitErr] = useState(false)
  const [scheduleErrors, setScheduleErrors] = useState<ScheduleErrors>(
    { name: false, phone: false, email: false, service: false, address: false, date: false, time: false }
  )
  const [quoteErrors, setQuoteErrors] = useState<QuoteErrors>(
    { name: false, phone: false, email: false, message: false }
  )
  const [scheduleFilled, setScheduleFilled] = useState<ScheduleFilled>(
    { name: false, phone: false, email: false, service: false, address: false, date: false, time: false }
  )
  const [quoteFilled, setQuoteFilled] = useState<QuoteFilled>(
    { name: false, phone: false, email: false, message: false }
  )
  const [scheduleRecaptchaCompleted, setScheduleRecaptchaCompleted] = useState(false)
  const [quoteRecaptchaCompleted, setQuoteRecaptchaCompleted] = useState(false)
  const [showScheduleRecapErr, setShowScheduleRecapErr] = useState(false)
  const [showQuoteRecapErr, setShowQuoteRecapErr] = useState(false)

  const sNameRef = useRef<HTMLInputElement>(null)
  const sPhoneRef = useRef<HTMLInputElement>(null)
  const sEmailRef = useRef<HTMLInputElement>(null)
  const sServiceRef = useRef<HTMLSelectElement>(null)
  const sAddressRef = useRef<HTMLInputElement>(null)
  const sDateRef = useRef<HTMLInputElement>(null)
  const sTimeRef = useRef<HTMLInputElement>(null)
  const qNameRef = useRef<HTMLInputElement>(null)
  const qPhoneRef = useRef<HTMLInputElement>(null)
  const qEmailRef = useRef<HTMLInputElement>(null)
  const qMsgRef = useRef<HTMLTextAreaElement>(null)
  const tabcardRef = useRef<HTMLDivElement>(null)
  const scheduleWidgetId = useRef<number | null>(null)
  const quoteWidgetId = useRef<number | null>(null)

  useEffect(() => {
    if (isSuccess) {
      return;
    }
    if (scheduleWidgetId.current !== null && quoteWidgetId.current !== null) {
      return;
    }

    const renderWidgets = () => {
      if (typeof window.grecaptcha?.render !== 'function') {
        return false;
      }
      if (scheduleWidgetId.current === null) {
        scheduleWidgetId.current = window.grecaptcha.render('tc-s-recaptcha', {
          sitekey: SITE_KEY,
          callback: () => setScheduleRecaptchaCompleted(true),
          'expired-callback': () => setScheduleRecaptchaCompleted(false),
        })
      }
      if (quoteWidgetId.current === null) {
        quoteWidgetId.current = window.grecaptcha.render('tc-q-recaptcha', {
          sitekey: SITE_KEY,
          callback: () => setQuoteRecaptchaCompleted(true),
          'expired-callback': () => setQuoteRecaptchaCompleted(false),
        })
      }
      return true
    }
    if (!renderWidgets()) {
      const interval = setInterval(() => { if (renderWidgets()) clearInterval(interval) }, 100)
      return () => clearInterval(interval)
    }
  }, [isSuccess])

  const handleCloseSuccess = () => {
    scheduleWidgetId.current = null
    quoteWidgetId.current = null
    setIsSuccess(false)
    setScheduleRecaptchaCompleted(false)
    setQuoteRecaptchaCompleted(false)
    setScheduleFilled({ name: false, phone: false, email: false, service: false, address: false, date: false, time: false })
    setQuoteFilled({ name: false, phone: false, email: false, message: false })
    setScheduleErrors({ name: false, phone: false, email: false, service: false, address: false, date: false, time: false })
    setQuoteErrors({ name: false, phone: false, email: false, message: false })
    setShowScheduleRecapErr(false)
    setShowQuoteRecapErr(false)
    setShowScheduleSubmitErr(false)
    setShowQuoteSubmitErr(false)
  }

  const showSuccess = (title: string, text: string) => {
    setSuccessTitle(title)
    setSuccessText(text)
    setIsSuccess(true)
    setTimeout(() => {
      const el = tabcardRef.current
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' })
    }, 40)
  }

  const clearScheduleError = (field: keyof ScheduleErrors) =>
    setScheduleErrors((prev) => ({ ...prev, [field]: false }))
  const clearQuoteError = (field: keyof QuoteErrors) =>
    setQuoteErrors((prev) => ({ ...prev, [field]: false }))

  const setScheduleFill = (field: keyof ScheduleFilled, value: string) =>
    setScheduleFilled((prev) => ({ ...prev, [field]: value.trim().length > 0 }))
  const setQuoteFill = (field: keyof QuoteFilled, value: string) =>
    setQuoteFilled((prev) => ({ ...prev, [field]: value.trim().length > 0 }))

  const isScheduleValid = Object.values(scheduleFilled).every(Boolean) && scheduleRecaptchaCompleted
  const isQuoteValid = Object.values(quoteFilled).every(Boolean) && quoteRecaptchaCompleted

  const handleScheduleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const token = window.grecaptcha?.getResponse(scheduleWidgetId.current ?? undefined) ?? ''
    const errs: ScheduleErrors = {
      name: !sNameRef.current?.value.trim(),
      phone: !validPhone(sPhoneRef.current?.value ?? ''),
      email: !validEmail(sEmailRef.current?.value ?? ''),
      service: !sServiceRef.current?.value,
      address: !sAddressRef.current?.value.trim(),
      date: !sDateRef.current?.value,
      time: !sTimeRef.current?.value,
    }
    setScheduleErrors(errs)
    setShowScheduleRecapErr(!token)
    if (Object.values(errs).some(Boolean) || !token) {
      if (errs.name) sNameRef.current?.focus()
      else if (errs.phone) sPhoneRef.current?.focus()
      else if (errs.email) sEmailRef.current?.focus()
      else if (errs.service) sServiceRef.current?.focus()
      else if (errs.address) sAddressRef.current?.focus()
      else if (errs.date) sDateRef.current?.focus()
      else if (errs.time) sTimeRef.current?.focus()
      return
    }

    setShowScheduleSubmitErr(false)
    setIsScheduleSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'schedule',
          token,
          lang,
          name: sNameRef.current?.value ?? '',
          phone: sPhoneRef.current?.value ?? '',
          email: sEmailRef.current?.value ?? '',
          service: sServiceRef.current?.value ?? '',
          address: sAddressRef.current?.value ?? '',
          date: sDateRef.current?.value ?? '',
          time: sTimeRef.current?.value ?? '',
        }),
      })
      const { success, error } = await res.json()
      if (!success) {
        if (error === 'recaptcha') {
          setShowScheduleRecapErr(true)
          setScheduleRecaptchaCompleted(false)
          window.grecaptcha?.reset(scheduleWidgetId.current ?? undefined)
        } else {
          setShowScheduleSubmitErr(true)
        }
        return
      }
    } catch {
      setShowScheduleSubmitErr(true)
      return
    } finally {
      setIsScheduleSubmitting(false)
    }

    showSuccess(dict.schedule.successTitle, dict.schedule.successMsg)
  }

  const handleQuoteSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const token = window.grecaptcha?.getResponse(quoteWidgetId.current ?? undefined) ?? ''
    const errs: QuoteErrors = {
      name: !qNameRef.current?.value.trim(),
      phone: !validPhone(qPhoneRef.current?.value ?? ''),
      email: !validEmail(qEmailRef.current?.value ?? ''),
      message: (qMsgRef.current?.value.trim().length ?? 0) < 4,
    }
    setQuoteErrors(errs)
    setShowQuoteRecapErr(!token)
    if (Object.values(errs).some(Boolean) || !token) {
      if (errs.name) qNameRef.current?.focus()
      else if (errs.phone) qPhoneRef.current?.focus()
      else if (errs.email) qEmailRef.current?.focus()
      else if (errs.message) qMsgRef.current?.focus()
      return
    }

    setShowQuoteSubmitErr(false)
    setIsQuoteSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quote',
          token,
          lang,
          name: qNameRef.current?.value ?? '',
          phone: qPhoneRef.current?.value ?? '',
          email: qEmailRef.current?.value ?? '',
          message: qMsgRef.current?.value ?? '',
        }),
      })
      const { success, error } = await res.json()
      if (!success) {
        if (error === 'recaptcha') {
          setShowQuoteRecapErr(true)
          setQuoteRecaptchaCompleted(false)
          window.grecaptcha?.reset(quoteWidgetId.current ?? undefined)
        } else {
          setShowQuoteSubmitErr(true)
        }
        return
      }
    } catch {
      setShowQuoteSubmitErr(true)
      return
    } finally {
      setIsQuoteSubmitting(false)
    }

    showSuccess(dict.quote.successTitle, dict.quote.successMsg)
  }

  const s = dict.schedule
  const q = dict.quote

  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
    .toISOString().split('T')[0]

  return (
    <div className={styles.tabcard} id="tabcard" ref={tabcardRef}>
      {!isSuccess && (
        <>
          <div className={styles.tabs} role="tablist" aria-label="Contact options">
            <button
              className={`${styles.tab}${activeTab === 'schedule' ? ` ${styles.isActive}` : ''}`}
              role="tab" id="tab-schedule" aria-selected={activeTab === 'schedule'}
              aria-controls="panel-schedule" type="button"
              onClick={() => setActiveTab('schedule')}
            >
              <span className={styles.tab__k}>{dict.tabs.schedule.key}</span>
              <span className={styles.tab__t}>{dict.tabs.schedule.label}</span>
            </button>
            <button
              className={`${styles.tab}${activeTab === 'quote' ? ` ${styles.isActive}` : ''}`}
              role="tab" id="tab-quote" aria-selected={activeTab === 'quote'}
              aria-controls="panel-quote" type="button"
              onClick={() => setActiveTab('quote')}
            >
              <span className={styles.tab__k}>{dict.tabs.quote.key}</span>
              <span className={styles.tab__t}>{dict.tabs.quote.label}</span>
            </button>
          </div>

          <div className={`${styles.panel}${activeTab === 'schedule' ? ` ${styles.isActive}` : ''}`}
            id="panel-schedule" role="tabpanel" aria-labelledby="tab-schedule">
            <p className={styles.intro}>{s.intro}</p>
            <form onSubmit={handleScheduleSubmit} noValidate>
              <div className="fgrid">
                <div className={`field${scheduleErrors.name ? ' has-error' : ''}`}>
                  <label htmlFor="s-name">{s.labelName} <span className="req">*</span></label>
                  <input type="text" id="s-name" name="name" autoComplete="name" placeholder={s.placeholderName}
                    ref={sNameRef} onChange={(e) => { clearScheduleError('name'); setScheduleFill('name', e.target.value) }} />
                  <span className="field__err" role="alert">{s.errName}</span>
                </div>
                <div className={`field${scheduleErrors.phone ? ' has-error' : ''}`}>
                  <label htmlFor="s-phone">{s.labelPhone} <span className="req">*</span></label>
                  <input type="tel" id="s-phone" name="phone" autoComplete="tel" placeholder={s.placeholderPhone}
                    ref={sPhoneRef} onChange={(e) => { clearScheduleError('phone'); setScheduleFill('phone', e.target.value) }} />
                  <span className="field__err" role="alert">{s.errPhone}</span>
                </div>
                <div className={`field${scheduleErrors.email ? ' has-error' : ''}`}>
                  <label htmlFor="s-email">{s.labelEmail} <span className="req">*</span></label>
                  <input type="email" id="s-email" name="email" autoComplete="email" placeholder={s.placeholderEmail}
                    ref={sEmailRef} onChange={(e) => { clearScheduleError('email'); setScheduleFill('email', e.target.value) }} />
                  <span className="field__err" role="alert">{s.errEmail}</span>
                </div>
                <div className={`field${scheduleErrors.service ? ' has-error' : ''}`}>
                  <label htmlFor="s-service">{s.labelService} <span className="req">*</span></label>
                  <select id="s-service" name="service" ref={sServiceRef}
                    onChange={(e) => { clearScheduleError('service'); setScheduleFill('service', e.target.value) }} defaultValue="">
                    <option value="">{s.placeholderService}</option>
                    {dict.serviceOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                  <span className="field__err" role="alert">{s.errService}</span>
                </div>
                <div className={`field field--full${scheduleErrors.address ? ' has-error' : ''}`}>
                  <label htmlFor="s-address">{s.labelAddress} <span className="req">*</span></label>
                  <input type="text" id="s-address" name="address" autoComplete="street-address"
                    placeholder={s.placeholderAddress} ref={sAddressRef}
                    onChange={(e) => { clearScheduleError('address'); setScheduleFill('address', e.target.value) }} />
                  <span className="field__err" role="alert">{s.errAddress}</span>
                </div>
                <div className={`field${scheduleErrors.date ? ' has-error' : ''}`}>
                  <label htmlFor="s-date">{s.labelDate} <span className="req">*</span></label>
                  <input type="date" id="s-date" name="date" ref={sDateRef}
                    min={minDate} max={maxDate}
                    onChange={(e) => { clearScheduleError('date'); setScheduleFill('date', e.target.value) }} />
                  <span className="field__err" role="alert">{s.errDate}</span>
                </div>
                <div className={`field${scheduleErrors.time ? ' has-error' : ''}`}>
                  <label htmlFor="s-time">{s.labelTime} <span className="req">*</span></label>
                  <input type="time" id="s-time" name="time" ref={sTimeRef}
                    onChange={(e) => { clearScheduleError('time'); setScheduleFill('time', e.target.value) }} />
                  <span className="field__err" role="alert">{s.errTime}</span>
                </div>
                <div className="field field--full">
                  <label htmlFor="s-msg">{s.labelMsg} <span style={{ color: 'var(--gray)' }}>{s.optional}</span></label>
                  <textarea id="s-msg" name="message" placeholder={s.placeholderMsg}></textarea>
                </div>
                <div className="field field--full">
                  <div id="tc-s-recaptcha"></div>
                  {showScheduleRecapErr && (
                    <span className={styles.recapErr} role="alert">{s.errRecaptcha}</span>
                  )}
                  {showScheduleSubmitErr && (
                    <span className={styles.recapErr} role="alert">{s.errSubmit}</span>
                  )}
                </div>
              </div>
              <div className="eform__actions">
                <button
                  type="submit"
                  className={`btn btn--solid btn--lg${!isScheduleValid || isScheduleSubmitting ? ` ${styles.submitDisabled}` : ''}`}
                  disabled={!isScheduleValid || isScheduleSubmitting}
                >{isScheduleSubmitting ? s.btnSending : s.btn}</button>
                <span className="eform__note">
                  {s.preferToTalk}{' '}
                  <a href={`tel:${PHONE_TEL}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>{PHONE_DISPLAY}</a>
                </span>
              </div>
            </form>
          </div>

          <div className={`${styles.panel}${activeTab === 'quote' ? ` ${styles.isActive}` : ''}`}
            id="panel-quote" role="tabpanel" aria-labelledby="tab-quote">
            <p className={styles.intro}>{q.intro}</p>
            <form onSubmit={handleQuoteSubmit} noValidate>
              <div className="fgrid">
                <div className={`field${quoteErrors.name ? ' has-error' : ''}`}>
                  <label htmlFor="q-name">{q.labelName} <span className="req">*</span></label>
                  <input type="text" id="q-name" name="name" autoComplete="name" placeholder={q.placeholderName}
                    ref={qNameRef} onChange={(e) => { clearQuoteError('name'); setQuoteFill('name', e.target.value) }} />
                  <span className="field__err" role="alert">{q.errName}</span>
                </div>
                <div className={`field${quoteErrors.phone ? ' has-error' : ''}`}>
                  <label htmlFor="q-phone">{q.labelPhone} <span className="req">*</span></label>
                  <input type="tel" id="q-phone" name="phone" autoComplete="tel" placeholder={q.placeholderPhone}
                    ref={qPhoneRef} onChange={(e) => { clearQuoteError('phone'); setQuoteFill('phone', e.target.value) }} />
                  <span className="field__err" role="alert">{q.errPhone}</span>
                </div>
                <div className={`field${quoteErrors.email ? ' has-error' : ''}`}>
                  <label htmlFor="q-email">{q.labelEmail} <span className="req">*</span></label>
                  <input type="email" id="q-email" name="email" autoComplete="email" placeholder={q.placeholderEmail}
                    ref={qEmailRef} onChange={(e) => { clearQuoteError('email'); setQuoteFill('email', e.target.value) }} />
                  <span className="field__err" role="alert">{q.errEmail}</span>
                </div>
                <div className="field">
                  <label htmlFor="q-service">{q.labelService} <span style={{ color: 'var(--gray)' }}>{q.optional}</span></label>
                  <select id="q-service" name="service" defaultValue="">
                    <option value="">{q.placeholderService}</option>
                    {dict.serviceOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className={`field field--full${quoteErrors.message ? ' has-error' : ''}`}>
                  <label htmlFor="q-msg">{q.labelMsg} <span className="req">*</span></label>
                  <textarea id="q-msg" name="message" placeholder={q.placeholderMsg}
                    ref={qMsgRef} onChange={(e) => { clearQuoteError('message'); setQuoteFill('message', e.target.value) }}></textarea>
                  <span className="field__err" role="alert">{q.errMsg}</span>
                </div>
                <div className="field field--full">
                  <div id="tc-q-recaptcha"></div>
                  {showQuoteRecapErr && (
                    <span className={styles.recapErr} role="alert">{q.errRecaptcha}</span>
                  )}
                  {showQuoteSubmitErr && (
                    <span className={styles.recapErr} role="alert">{q.errSubmit}</span>
                  )}
                </div>
              </div>
              <div className="eform__actions">
                <button
                  type="submit"
                  className={`btn btn--solid btn--lg${!isQuoteValid || isQuoteSubmitting ? ` ${styles.submitDisabled}` : ''}`}
                  disabled={!isQuoteValid || isQuoteSubmitting}
                >{isQuoteSubmitting ? q.btnSending : q.btn}</button>
                <span className="eform__note">
                  {q.orMessage}{' '}
                  <a href={WA_URL} target="_blank" rel="noopener" style={{ color: 'var(--blue)', fontWeight: 600 }}>WhatsApp</a>
                </span>
              </div>
            </form>
          </div>
        </>
      )}

      {isSuccess && (
        <div className={styles.success} aria-live="polite">
          <button className={styles.successClose} onClick={handleCloseSuccess} aria-label="Close">✕</button>
          <div className={styles.check}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>{successTitle}</h3>
          <p>{successText}</p>
          <a className={styles.callLine} href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
          <p className={styles.meta}>{dict.avgResponse}</p>
        </div>
      )}
    </div>
  )
}
