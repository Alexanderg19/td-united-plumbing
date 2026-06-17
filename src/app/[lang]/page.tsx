import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from './dictionaries'
import Hero from '@/components/Hero'
import TrustBar from '@/components/TrustBar'
import ServicesGrid from '@/components/ServicesGrid'
import ServiceArea from '@/components/ServiceArea'
import CtaBanner from '@/components/CtaBanner'

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const isEs = lang === 'es'
  return {
    title: isEs
      ? 'TD United Plumbing — Plomería de Emergencia 24/7 · Sur de Florida'
      : 'TD United Plumbing — 24/7 Emergency Plumbing · South Florida',
    alternates: {
      canonical: `/${lang}`,
      languages: { en: '/en', es: '/es' },
    },
    openGraph: {
      locale: isEs ? 'es_US' : 'en_US',
      alternateLocale: isEs ? 'en_US' : 'es_US',
    },
  }
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <main>
      <Hero lang={lang} dict={dict.hero} formDict={dict.form} />
      <TrustBar dict={dict.trust} />
      <ServicesGrid lang={lang} dict={dict.services} />
      <ServiceArea dict={dict.serviceArea} />
      <CtaBanner dict={dict.cta} />
    </main>
  )
}
