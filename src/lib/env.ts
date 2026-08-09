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
