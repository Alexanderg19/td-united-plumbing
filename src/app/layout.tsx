import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { headers } from 'next/headers'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TD United Plumbing — 24/7 Emergency Plumbing · South Florida',
    template: '%s | TD United Plumbing',
  },
  description:
    'Certified 24/7 emergency plumbing & facility services in Fort Lauderdale, FL. Serving Miami-Dade & Broward County.',
  keywords: ['plumbing', 'emergency plumbing', 'Fort Lauderdale', 'Miami-Dade', 'Broward', '24/7 plumber'],
  openGraph: {
    title: 'TD United Plumbing — 24/7 Emergency Plumbing · South Florida',
    description: 'Certified 24/7 emergency plumbing & facility services in Fort Lauderdale, FL.',
    type: 'website',
    locale: 'en_US',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/'
  const langSegment = pathname.split('/')[1]
  const htmlLang = ['en', 'es'].includes(langSegment) ? langSegment : 'en'

  return (
    <html lang={htmlLang} className={`${archivo.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
