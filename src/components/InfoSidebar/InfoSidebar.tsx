import type { InfoSidebarDict } from '@/app/[lang]/dictionaries'
import styles from './InfoSidebar.module.css'

const PHONE_DISPLAY = '(954) 555-0199'
const PHONE_TEL = '+19545550199'
const WA_URL = 'https://wa.me/19545550199'

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20zm4.5-5.9c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-3-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-1 2.2A5.2 5.2 0 009 12.5a11.7 11.7 0 004.5 4 5 5 0 002.3.4 2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.6-.3z" />
  </svg>
)

interface Props { dict: InfoSidebarDict }

export default function InfoSidebar({ dict }: Props) {
  return (
    <aside className={styles.infoside} aria-label="Contact information">
      <div className={`${styles.infocard} ${styles.accent}`}>
        <p className={styles.label}>{dict.callLabel}</p>
        <a className={styles.num} href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
        <div className={styles.accentActions}>
          <a className={`btn btn--lg ${styles.btn_call}`} href={`tel:${PHONE_TEL}`}>
            <span className="btn__dot" aria-hidden="true"></span>
            {dict.callNow}
          </a>
          <a className="btn btn--wa" href={WA_URL} target="_blank" rel="noopener">
            {WA_ICON}
            {dict.whatsapp}
          </a>
        </div>
      </div>

      <div className={`${styles.infocard} ${styles.plain}`}>
        <h4>{dict.glanceTitle}</h4>
        <dl style={{ margin: '14px 0 0' }}>
          {dict.glance.map((row) => (
            <div key={row.dt} className={styles.row}>
              <dt>{row.dt}</dt>
              <dd>{row.dd}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={`${styles.infocard} ${styles.plain}`}>
        <h4>{dict.serviceAreaTitle}</h4>
        <div className="area__cities">
          {dict.cities.map((city) => (
            <span key={city} className="chip chip--ink">{city}</span>
          ))}
        </div>
      </div>
    </aside>
  )
}
