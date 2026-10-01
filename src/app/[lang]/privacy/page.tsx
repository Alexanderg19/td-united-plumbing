import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../dictionaries'
import PageHero from '@/components/PageHero'
import styles from './privacy.module.css'

const PHONE_DISPLAY = '(954) 555-0199'
const PHONE_TEL = '+19545550199'
const WA_URL = 'https://wa.me/19545550199'

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const isEs = lang === 'es'
  return {
    title: isEs ? 'Política de Privacidad' : 'Privacy Policy',
    description: isEs
      ? 'Cómo TD United Plumbing recopila, usa y protege su información.'
      : 'How TD United Plumbing collects, uses and protects your information.',
    alternates: {
      canonical: `/${lang}/privacy`,
      languages: { en: '/en/privacy', es: '/es/privacy' },
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const { privacy } = await getDictionary(lang)

  return (
    <main>
      <PageHero dict={privacy.hero} />
      <section className="section">
        <div className="wrap">
          <article className={styles.doc}>
            <p className={styles.updated}>
              {privacy.updatedLabel}: {privacy.updated}
            </p>

            {privacy.sections.map((section, i) => (
              <section key={section.title} className={styles.block}>
                <h2 className={styles.heading}>
                  <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                  {section.title}
                </h2>
                {section.paragraphs.map((text) => <p key={text}>{text}</p>)}
                {section.items.length > 0 && (
                  <ul className={styles.list}>
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
                {section.after.map((text) => <p key={text}>{text}</p>)}
                {section.links.length > 0 && (
                  <p className={styles.links}>
                    {section.links.map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label} ↗
                      </a>
                    ))}
                  </p>
                )}
              </section>
            ))}

            <section className={`${styles.block} ${styles.contact}`}>
              <h2 className={styles.heading}>{privacy.contactTitle}</h2>
              <p>{privacy.contactText}</p>
              <p className={styles.links}>
                <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
                <a href={WA_URL} target="_blank" rel="noopener">WhatsApp ↗</a>
              </p>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}
