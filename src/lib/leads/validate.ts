import { z } from 'zod'
import { locales, type Locale } from '@/app/[lang]/dictionaries'
import { formatPhone, isValidPhone } from '@/lib/phone'

const langSchema = z.enum(locales as [Locale, ...Locale[]])
const phoneSchema = z.string().refine(isValidPhone, { message: 'Invalid phone number' }).transform(formatPhone)
const nonEmpty = z.string().trim().min(1)
const emailSchema = z.email().trim()

const emergencyLeadSchema = z.object({
  type: z.literal('emergency'),
  token: nonEmpty,
  lang: langSchema,
  name: nonEmpty,
  phone: phoneSchema,
  email: emailSchema.optional(),
  emergencyType: nonEmpty,
  address: nonEmpty,
})

const scheduleLeadSchema = z.object({
  type: z.literal('schedule'),
  token: nonEmpty,
  lang: langSchema,
  name: nonEmpty,
  phone: phoneSchema,
  email: emailSchema,
  service: nonEmpty,
  address: nonEmpty,
  date: nonEmpty,
  time: nonEmpty,
  message: z.string().trim().optional(),
})

const quoteLeadSchema = z.object({
  type: z.literal('quote'),
  token: nonEmpty,
  lang: langSchema,
  name: nonEmpty,
  phone: phoneSchema,
  email: emailSchema,
  service: z.string().trim().optional(),
  message: z.string().trim().min(4),
})

export const leadSchema = z.discriminatedUnion('type', [
  emergencyLeadSchema,
  scheduleLeadSchema,
  quoteLeadSchema,
])

export type LeadValidationResult =
  | { success: true; data: z.infer<typeof leadSchema> }
  | { success: false; error: z.ZodError }

export function validateLead(payload: unknown): LeadValidationResult {
  const result = leadSchema.safeParse(payload)
  if (!result.success) return { success: false, error: result.error }
  return { success: true, data: result.data }
}
