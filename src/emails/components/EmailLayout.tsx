import { Body, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components'

const BUSINESS_NAME = 'TD United Plumbing'
const BRAND_BLUE = '#0b4f8a'

interface EmailLayoutProps {
  previewText: string
  children: React.ReactNode
}

export default function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#f4f5f7', fontFamily: 'Arial, sans-serif', margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 8, maxWidth: 560, padding: 32 }}>
          <Section>
            <Text style={{ color: BRAND_BLUE, fontSize: 20, fontWeight: 700, margin: 0 }}>
              {BUSINESS_NAME}
            </Text>
          </Section>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          {children}
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
          <Text style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>
            {BUSINESS_NAME} — this is an automated message.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
