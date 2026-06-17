'use client'

import { useState } from 'react'
import Link from 'next/link'
import EmergencyForm from '@/components/EmergencyForm'
import type { HeroDict, FormDict } from '@/app/[lang]/dictionaries'
import styles from './Hero.module.css'

interface Props {
  lang: string
  dict: HeroDict
  formDict: FormDict
}

export default function Hero({ lang, dict, formDict }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className={styles.hero} id="top">
      <div className={`ph ph--dark ${styles.bg}`} aria-hidden="true">
        <span className="ph__tag">Hero image — cinematic pipework / plumber on site</span>
      </div>
      <div className={styles.grid} aria-hidden="true"></div>

      <div className={`wrap ${styles.inner}`}>
        <p className="eyebrow eyebrow--light">{dict.eyebrow}</p>
        <h1 className={styles.title}>
          {dict.title} <em>{dict.titleEm}</em>
        </h1>
        <p className={styles.sub}>{dict.sub}</p>

        <div className={styles.cta}>
          <button
            className="btn btn--emergency"
            type="button"
            aria-expanded={isOpen}
            aria-controls="emergencyForm"
            onClick={() => setIsOpen((v) => !v)}
          >
            <span className="btn__dot" aria-hidden="true"></span>
            {dict.btnEmergency}
          </button>
          <Link className="btn btn--ghost" href={`/${lang}/contact`}>
            {dict.btnSchedule}
          </Link>
        </div>

        <EmergencyForm isOpen={isOpen} onClose={() => setIsOpen(false)} dict={formDict} />

        <dl className={styles.meta}>
          {dict.meta.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
