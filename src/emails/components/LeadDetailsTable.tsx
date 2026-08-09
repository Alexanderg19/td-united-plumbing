import { Row, Column, Section, Text } from '@react-email/components'

export interface LeadDetailRow {
  label: string
  value: string
}

interface LeadDetailsTableProps {
  rows: LeadDetailRow[]
}

export default function LeadDetailsTable({ rows }: LeadDetailsTableProps) {
  return (
    <Section>
      {rows.map((row) => (
        <Row key={row.label} style={{ padding: '6px 0', borderBottom: '1px solid #f1f2f4' }}>
          <Column style={{ width: 130 }}>
            <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, margin: 0 }}>
              {row.label}
            </Text>
          </Column>
          <Column>
            <Text style={{ color: '#111827', fontSize: 14, margin: 0 }}>{row.value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  )
}
