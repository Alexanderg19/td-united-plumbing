import { validateLead } from '@/lib/leads/validate'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { sendInternalEmail, sendConfirmationEmail } from '@/lib/leads/notify-email'

export async function POST(request: Request) {
  const payload = await request.json()

  const validation = validateLead(payload)
  if (!validation.success) {
    return Response.json({ success: false, error: 'validation' }, { status: 400 })
  }

  const lead = validation.data

  const recaptchaOk = await verifyRecaptcha(lead.token)
  if (!recaptchaOk) {
    return Response.json({ success: false, error: 'recaptcha' }, { status: 400 })
  }

  const results = await Promise.allSettled([sendInternalEmail(lead), sendConfirmationEmail(lead)])

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[LEAD_DELIVERY_FAILURE]', JSON.stringify(lead), result.reason)
    }
  }

  return Response.json({ success: true })
}
