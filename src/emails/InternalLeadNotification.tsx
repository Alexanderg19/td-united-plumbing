import { Heading, Text } from '@react-email/components'
import type { Lead } from '@/lib/leads/types'
import EmailLayout from './components/EmailLayout'
import LeadDetailsTable, { type LeadDetailRow } from './components/LeadDetailsTable'

const TITLES: Record<Lead['type'], string> = {
  emergency: '🚨 New Emergency Request',
  schedule: '📅 New Schedule Request',
  quote: '💬 New Quote Request',
}

export function getInternalSubject(lead: Lead): string {
  return `${TITLES[lead.type]} — ${lead.name}`
}

function leadToRows(lead: Lead): LeadDetailRow[] {
  const base: LeadDetailRow[] = [
    { label: 'Name', value: lead.name },
    { label: 'Phone', value: lead.phone },
  ]

  switch (lead.type) {
    case 'emergency':
      return [
        ...base,
        { label: 'Issue type', value: lead.emergencyType },
        { label: 'Address', value: lead.address },
      ]
    case 'schedule':
      return [
        ...base,
        { label: 'Email', value: lead.email },
        { label: 'Service', value: lead.service },
        { label: 'Address', value: lead.address },
        { label: 'Date', value: lead.date },
        { label: 'Time', value: lead.time },
        ...(lead.message ? [{ label: 'Message', value: lead.message }] : []),
      ]
    case 'quote':
      return [
        ...base,
        { label: 'Email', value: lead.email },
        ...(lead.service ? [{ label: 'Service', value: lead.service }] : []),
        { label: 'Message', value: lead.message },
      ]
  }
}

interface InternalLeadNotificationProps {
  lead: Lead
}

export default function InternalLeadNotification({ lead }: InternalLeadNotificationProps) {
  return (
    <EmailLayout previewText={getInternalSubject(lead)}>
      <Heading style={{ fontSize: 18, margin: '0 0 16px' }}>{TITLES[lead.type]}</Heading>
      <Text style={{ color: '#374151', fontSize: 14, margin: '0 0 16px' }}>
        A new lead came in through the website form. Details below.
      </Text>
      <LeadDetailsTable rows={leadToRows(lead)} />
    </EmailLayout>
  )
}
