import Link from 'next/link'
import type { FooterDict } from '@/app/[lang]/dictionaries'
import styles from './Footer.module.css'

const PHONE_DISPLAY = '(954) 555-0199'
const PHONE_TEL = '+19545550199'
const WA_URL = 'https://wa.me/19545550199'

interface Props { lang: string; dict: FooterDict }

export default function Footer({ lang, dict }: Props) {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link className="brand" href={`/${lang}`} aria-label="TD United Plumbing home">
              <span className="brand__mark">TD</span>
              <span className="brand__name" style={{ color: '#fff' }}>
                United<span>Plumbing</span>
              </span>
            </Link>
            <p className={styles.tag}>{dict.tag}</p>
          </div>

          <div className={styles.col}>
            <h4>{dict.navigate}</h4>
            <Link href={`/${lang}`}>{dict.home}</Link>
            <Link href={`/${lang}#services`}>{dict.services}</Link>
            <Link href={`/${lang}#service-area`}>{dict.serviceArea}</Link>
            <Link href={`/${lang}/contact`}>{dict.contact}</Link>
          </div>

          <div className={`${styles.col} ${styles.call}`}>
            <h4>{dict.contactTitle}</h4>
            <a href={`tel:${PHONE_TEL}`}>
              <span className="mono">● {dict.call}</span>
              <strong>{PHONE_DISPLAY}</strong>
            </a>
            <a href={WA_URL} target="_blank" rel="noopener" style={{ marginTop: '14px' }}>
              {dict.whatsapp}
            </a>
            <p style={{ color: 'rgba(255,255,255,0.55)' }}>{dict.location}</p>
          </div>

          <div className={styles.col}>
            <h4>{dict.serviceAreaTitle}</h4>
            <div className={styles.cities}>
              {dict.cities.map((city) => (
                <span key={city}>{city}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>{dict.copyright}</p>
          <p>{dict.legal}</p>
        </div>
      </div>
    </footer>
  )
}
