export async function POST(request: Request) {
  const { token } = await request.json()

  if (!token) {
    return Response.json({ success: false }, { status: 400 })
  }

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY!,
      response: token,
    }),
  })

  const data = await res.json()

  return Response.json({ success: data.success })
}
