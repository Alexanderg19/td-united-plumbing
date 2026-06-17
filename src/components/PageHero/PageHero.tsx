import type { PageHeroDict } from '@/app/[lang]/dictionaries'
import styles from './PageHero.module.css'

const PHONE_DISPLAY = '(954) 555-0199'
const PHONE_TEL = '+19545550199'

interface Props { dict: PageHeroDict }

export default function PageHero({ dict }: Props) {
  return (
    <section className={styles.page_hero}>
      <div className={styles.grid} aria-hidden="true"></div>
      <div className={`wrap ${styles.inner}`}>
        <p className="eyebrow eyebrow--light">{dict.eyebrow}</p>
        <h1 className={styles.title}>
          {dict.title} <em>{dict.titleEm}</em>
        </h1>
        <p className={styles.sub}>{dict.sub}</p>
        <a className={styles.call} href={`tel:${PHONE_TEL}`}>
          <span className="mono">● {dict.callLabel}</span>
          <strong>{PHONE_DISPLAY}</strong>
        </a>
      </div>
    </section>
  )
}
