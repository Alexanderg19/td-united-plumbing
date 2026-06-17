import type { TrustDict } from '@/app/[lang]/dictionaries'
import styles from './TrustBar.module.css'

interface Props { dict: TrustDict }

const GLYPHS: Record<string, React.ReactNode> = {
  '24/7': (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  '100%': (
    <>
      <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M8 14l-1.5 7 5.5-3 5.5 3L18 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  '10+': (
    <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  ),
  '#1': (
    <path d="M12 2C7 8 5 11 5 15a7 7 0 0014 0c0-4-2-7-7-13z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  ),
}

export default function TrustBar({ dict }: Props) {
  return (
    <section className={styles.trust} aria-label="Why choose us">
      <div className="wrap">
        <div className={styles.trust__grid}>
          {dict.items.map((item, i) => (
            <div key={i} className={styles.trust__item}>
              <svg className={styles.trust__glyph} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {GLYPHS[item.num]}
              </svg>
              <div className={styles.trust__num}>{item.num}</div>
              <div className={styles.trust__label}>{item.label}</div>
              <div className={styles.trust__sub}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
