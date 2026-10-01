import type { ServiceAreaDict } from '@/app/[lang]/dictionaries'
import styles from './ServiceArea.module.css'

interface Props { dict: ServiceAreaDict }

// Keyless Google Maps embed centered between Miami-Dade and Broward.
const MAP_SRC = 'https://maps.google.com/maps?q=Miami-Dade+County,+FL&z=10&output=embed'

export default function ServiceArea({ dict }: Props) {
  return (
    <section className={`section ${styles.area}`} id="service-area">
      <div className="wrap">
        <div className={styles.layout}>
          <div>
            <p className="eyebrow eyebrow--light">{dict.eyebrow}</p>
            <h2 className={styles.title}>
              {dict.title1}
              <br />
              {dict.title2}
            </h2>
            <p className={styles.lead}>{dict.lead}</p>
            <ul className={styles.cities}>
              {dict.cities.map((city, i) => (
                <li key={city} className={styles.city}>
                  <span className={styles.cityIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                  </span>
                  <span className={styles.cityName}>{city}</span>
                  <span className={styles.cityIndex} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                </li>
              ))}
            </ul>
            <p className={styles.counties}>{dict.counties}</p>
          </div>
          <div className={styles.map}>
            <iframe
              className={styles.mapFrame}
              src={MAP_SRC}
              title={dict.mapAlt}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span className={styles.mapTag}>{dict.mapAlt}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
