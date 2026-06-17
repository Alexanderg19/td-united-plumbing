import type { ServiceAreaDict } from '@/app/[lang]/dictionaries'
import styles from './ServiceArea.module.css'

interface Props { dict: ServiceAreaDict }

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
            <div className="area__cities">
              {dict.cities.map((city) => (
                <span key={city} className="chip">{city}</span>
              ))}
            </div>
            <p className={styles.counties}>{dict.counties}</p>
          </div>
          <div
            className={`ph ph--dark ${styles.map}`}
            aria-label={dict.mapAlt}
          >
            <span className="ph__tag">{dict.mapAlt}</span>
            <span className={styles.pin} style={{ left: '32%', top: '30%' }} aria-hidden="true"></span>
            <span className={styles.pin} style={{ left: '58%', top: '44%' }} aria-hidden="true"></span>
            <span className={styles.pin} style={{ left: '44%', top: '62%' }} aria-hidden="true"></span>
            <span className={styles.pin} style={{ left: '70%', top: '70%' }} aria-hidden="true"></span>
            <span className={styles.crosshair} style={{ left: '50%', top: '50%' }} aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </section>
  )
}
