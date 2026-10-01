import { getLeadsSmsEnv } from '@/lib/env'
import { toE164 } from '@/lib/phone'
import type { Lead } from './types'

// Plain ASCII on purpose: emojis/accents switch SMS to UCS-2 (70 chars per segment instead of 160).
const INTERNAL_LABELS: Record<Lead['type'], string> = {
  emergency: 'EMERGENCY',
  schedule: 'Schedule',
  quote: 'Quote',
}

const CONFIRMATION_COPY: Record<'en' | 'es', string> = {
  en: 'TD United Plumbing: We received your request and will contact you shortly. Reply STOP to opt out.',
  es: 'TD United Plumbing: Recibimos tu solicitud y te contactaremos pronto. Responde STOP para no recibir mas mensajes.',
}

const MAX_MESSAGE_PREVIEW = 80

async function sendSms(to: string, body: string) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, SMS_FROM_NUMBER } = getLeadsSmsEnv()

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: SMS_FROM_NUMBER, Body: body }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Twilio error ${data.code ?? res.status}: ${data.message ?? 'unknown error'}`)
  }
  return data as { sid: string; status: string }
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text
}

function buildInternalBody(lead: Lead): string {
  const lines = [`New ${INTERNAL_LABELS[lead.type]} lead`, `${lead.name} - ${lead.phone}`]

  switch (lead.type) {
    case 'emergency':
      lines.push(lead.emergencyType, lead.address)
      break
    case 'schedule':
      lines.push(lead.service, `${lead.date} ${lead.time}`, lead.address)
      break
    case 'quote':
      if (lead.service) lines.push(lead.service)
      lines.push(truncate(lead.message, MAX_MESSAGE_PREVIEW))
      break
  }

  return lines.join('\n')
}

export async function sendInternalSms(lead: Lead) {
  const { INTERNAL_ALERT_PHONE_NUMBER } = getLeadsSmsEnv()
  const body = buildInternalBody(lead)

  return Promise.all(INTERNAL_ALERT_PHONE_NUMBER.map((to) => sendSms(to, body)))
}

export async function sendConfirmationSms(lead: Lead) {
  const { ENABLE_CUSTOMER_SMS_CONFIRMATION } = getLeadsSmsEnv()
  if (!ENABLE_CUSTOMER_SMS_CONFIRMATION) return null

  const to = toE164(lead.phone)
  if (!to) {
    throw new Error(`Cannot convert customer phone to E.164: ${lead.phone}`)
  }

  return sendSms(to, CONFIRMATION_COPY[lead.lang])
}
