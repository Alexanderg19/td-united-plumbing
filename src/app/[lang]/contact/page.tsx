import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../dictionaries'
import PageHero from '@/components/PageHero'
import ContactTabCard from '@/components/ContactTabCard'
import InfoSidebar from '@/components/InfoSidebar'

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const isEs = lang === 'es'
  return {
    title: isEs
      ? 'Contacto — Programar Visita o Solicitar Cotización'
      : 'Contact — Schedule a Visit or Request a Quote',
    description: isEs
      ? 'Programe una visita de plomería o solicite una cotización gratuita. Atendemos Miami-Dade y Broward 24/7.'
      : 'Schedule a plumbing visit or request a free quote. We serve Miami-Dade & Broward County 24/7.',
    alternates: {
      canonical: `/${lang}/contact`,
      languages: { en: '/en/contact', es: '/es/contact' },
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <main>
      <PageHero dict={dict.pageHero} />
      <section className="section contact" id="contact-form">
        <div className="wrap">
          <div className="contact__layout">
            <ContactTabCard dict={dict.contactCard} />
            <InfoSidebar dict={dict.infoSidebar} />
          </div>
        </div>
      </section>
    </main>
  )
}
