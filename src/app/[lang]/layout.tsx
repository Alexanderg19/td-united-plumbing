import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from './dictionaries'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }]
}

interface Props {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <>
      <TopBar dict={dict.topBar} />
      <Navbar lang={lang} dict={dict.nav} />
      {children}
      <Footer lang={lang} dict={dict.footer} />
      <FloatingWhatsApp dict={dict.floatingWa} />
    </>
  )
}
