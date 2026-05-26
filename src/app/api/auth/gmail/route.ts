import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ''
const REDIRECT_URI  = 'http://localhost:3000/api/auth/gmail'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
].join(' ')

// GET /api/auth/gmail          → Redirect to Google consent screen
// GET /api/auth/gmail?code=... → Exchange code for refresh token
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  // Step 1: No code yet → redirect user to Google OAuth
  if (!code) {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', CLIENT_ID)
    url.searchParams.set('redirect_uri', REDIRECT_URI)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', SCOPES)
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('prompt', 'consent')
    return NextResponse.redirect(url.toString())
  }

  // Step 2: Exchange code for tokens
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  })

  const tokens = await res.json()

  if (!res.ok || !tokens.refresh_token) {
    return NextResponse.json(
      { error: 'Token exchange failed', detail: tokens },
      { status: 400 }
    )
  }

  // Return refresh token — user copies it into .env.local
  return new NextResponse(
    `<html><body style="font-family:monospace;padding:32px;background:#0d0d0d;color:#e5e5e5">
      <h2 style="color:#4ade80">✓ Gmail verbunden</h2>
      <p>Kopiere diesen Refresh Token in deine <code>.env.local</code>:</p>
      <pre style="background:#1a1a1a;padding:16px;border-radius:8px;word-break:break-all;color:#fbbf24">${tokens.refresh_token}</pre>
      <p style="color:#888">GOOGLE_REFRESH_TOKEN=<strong style="color:#fbbf24">${tokens.refresh_token}</strong></p>
      <p style="color:#888;margin-top:24px">Danach: Dev-Server neu starten → Gmail ist aktiv.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
