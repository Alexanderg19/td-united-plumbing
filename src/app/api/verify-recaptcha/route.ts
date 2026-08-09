import { verifyRecaptcha } from '@/lib/recaptcha'

export async function POST(request: Request) {
  const { token } = await request.json()

  if (!token) {
    return Response.json({ success: false }, { status: 400 })
  }

  const success = await verifyRecaptcha(token)

  return Response.json({ success })
}
