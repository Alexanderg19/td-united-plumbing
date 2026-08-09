import { Heading, Text } from '@react-email/components'
import type { Lead } from '@/lib/leads/types'
import EmailLayout from './components/EmailLayout'

const COPY: Record<'en' | 'es', Record<Lead['type'], { subject: string; title: string; body: string }>> = {
  en: {
    emergency: {
      subject: 'We received your emergency request',
      title: 'We got your emergency request',
      body: "Thanks for reaching out. Our team has been notified and will call you shortly to confirm details and dispatch a plumber.",
    },
    schedule: {
      subject: 'Your appointment request was received',
      title: 'Thanks for scheduling with us',
      body: "We received your appointment request and will contact you shortly to confirm the date and time.",
    },
    quote: {
      subject: 'We received your quote request',
      title: 'Thanks for requesting a quote',
      body: "We received your request and one of our team members will get back to you with a quote soon.",
    },
  },
  es: {
    emergency: {
      subject: 'Recibimos tu solicitud de emergencia',
      title: 'Recibimos tu solicitud de emergencia',
      body: 'Gracias por contactarnos. Nuestro equipo ya fue notificado y te llamará en breve para confirmar los detalles y enviar un plomero.',
    },
    schedule: {
      subject: 'Recibimos tu solicitud de cita',
      title: 'Gracias por agendar con nosotros',
      body: 'Recibimos tu solicitud de cita y te contactaremos pronto para confirmar la fecha y hora.',
    },
    quote: {
      subject: 'Recibimos tu solicitud de cotización',
      title: 'Gracias por solicitar una cotización',
      body: 'Recibimos tu solicitud y un miembro de nuestro equipo se pondrá en contacto contigo pronto con una cotización.',
    },
  },
}

export function getConfirmationSubject(lead: Lead): string {
  return COPY[lead.lang][lead.type].subject
}

interface CustomerConfirmationProps {
  lead: Lead
}

export default function CustomerConfirmation({ lead }: CustomerConfirmationProps) {
  const copy = COPY[lead.lang][lead.type]

  return (
    <EmailLayout previewText={copy.subject}>
      <Heading style={{ fontSize: 18, margin: '0 0 16px' }}>{copy.title}</Heading>
      <Text style={{ color: '#374151', fontSize: 14, margin: 0 }}>
        {lead.lang === 'es' ? `Hola ${lead.name},` : `Hi ${lead.name},`}
      </Text>
      <Text style={{ color: '#374151', fontSize: 14, margin: '8px 0 0' }}>{copy.body}</Text>
    </EmailLayout>
  )
}
