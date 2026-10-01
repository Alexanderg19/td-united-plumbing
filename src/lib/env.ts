function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getLeadsEmailEnv() {
  return {
    RESEND_API_KEY: requireEnv('RESEND_API_KEY'),
    RESEND_FROM_EMAIL: requireEnv('RESEND_FROM_EMAIL'),
    INTERNAL_NOTIFICATION_EMAIL: requireEnv('INTERNAL_NOTIFICATION_EMAIL')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean),
  }
}

export function getLeadsSmsEnv() {
  return {
    TWILIO_ACCOUNT_SID: requireEnv('TWILIO_ACCOUNT_SID'),
    TWILIO_AUTH_TOKEN: requireEnv('TWILIO_AUTH_TOKEN'),
    SMS_FROM_NUMBER: requireEnv('SMS_FROM_NUMBER'),
    INTERNAL_ALERT_PHONE_NUMBER: requireEnv('INTERNAL_ALERT_PHONE_NUMBER')
      .split(',')
      .map((phone) => phone.trim())
      .filter(Boolean),
    ENABLE_CUSTOMER_SMS_CONFIRMATION: process.env.ENABLE_CUSTOMER_SMS_CONFIRMATION === 'true',
  }
}
