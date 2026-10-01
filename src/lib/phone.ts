import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'

// Phone helpers shared by the forms (client) and lead validation (server).
// Numbers arrive in international format ("+1 954 555 0199") from <PhoneField>.

export function isValidPhone(input: string): boolean {
  return isValidPhoneNumber(input)
}

// Display format for emails and SMS, e.g. "+1 954 555 0199".
export function formatPhone(input: string): string {
  return parsePhoneNumberFromString(input)?.formatInternational() ?? input
}

export function toE164(input: string): string | null {
  const parsed = parsePhoneNumberFromString(input)
  return parsed?.isValid() ? parsed.number : null
}
