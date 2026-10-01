import type { Locale } from '@/app/[lang]/dictionaries'

interface LeadBase {
  token: string
  lang: Locale
}

export interface EmergencyLead extends LeadBase {
  type: 'emergency'
  name: string
  phone: string
  email?: string
  emergencyType: string
  address: string
}

export interface ScheduleLead extends LeadBase {
  type: 'schedule'
  name: string
  phone: string
  email: string
  service: string
  address: string
  date: string
  time: string
  message?: string
}

export interface QuoteLead extends LeadBase {
  type: 'quote'
  name: string
  phone: string
  email: string
  service?: string
  message: string
}

export type Lead = EmergencyLead | ScheduleLead | QuoteLead
