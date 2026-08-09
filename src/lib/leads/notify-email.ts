import { Resend } from 'resend'
import { getLeadsEmailEnv } from '@/lib/env'
import type { Lead } from './types'
import InternalLeadNotification, { getInternalSubject } from '@/emails/InternalLeadNotification'
import CustomerConfirmation, { getConfirmationSubject } from '@/emails/CustomerConfirmation'

function getResendClient() {
  const { RESEND_API_KEY } = getLeadsEmailEnv()
  return new Resend(RESEND_API_KEY)
}

export async function sendInternalEmail(lead: Lead) {
  const { RESEND_FROM_EMAIL, INTERNAL_NOTIFICATION_EMAIL } = getLeadsEmailEnv()
  const resend = getResendClient()

  return resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: INTERNAL_NOTIFICATION_EMAIL,
    subject: getInternalSubject(lead),
    react: InternalLeadNotification({ lead }),
  })
}

export async function sendConfirmationEmail(lead: Lead) {
  const { RESEND_FROM_EMAIL } = getLeadsEmailEnv()
  const resend = getResendClient()
  const to = lead.type === 'emergency' ? undefined : lead.email

  if (!to) {
    return null;
  }

  return resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to,
    subject: getConfirmationSubject(lead),
    react: CustomerConfirmation({ lead }),
  })
}
