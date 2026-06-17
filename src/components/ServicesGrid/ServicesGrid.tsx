import Link from 'next/link'
import type { ServicesDict } from '@/app/[lang]/dictionaries'
import styles from './ServicesGrid.module.css'

interface Props { lang: string; dict: ServicesDict }

export default function ServicesGrid({ lang, dict }: Props) {
  return (
    <section className={`section ${styles.services}`} id="services">
      <div className="wrap">
        <div className={styles.head}>
          <div className="section__head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">{dict.eyebrow}</p>
            <h2 className="section__title">{dict.title}</h2>
          </div>
          <p className="section__lead">{dict.lead}</p>
        </div>

        <div className={styles.grid}>
          {dict.items.map((svc) => (
            <Link key={svc.num} className={styles.svc} href={`/${lang}/contact`}>
              <div className={`ph ${styles.img}`}>
                <span className="ph__tag">{svc.img}</span>
              </div>
              <div className={styles.body}>
                <span className={styles.num}>{svc.num}</span>
                <h3>{svc.title}</h3>
                <p>{svc.desc}</p>
                <span className={styles.more}>{dict.learnMore}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
