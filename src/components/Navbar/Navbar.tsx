'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { NavDict } from '@/app/[lang]/dictionaries'
import styles from './Navbar.module.css'

const PHONE_DISPLAY = '(954) 555-0199'
const PHONE_TEL = '+19545550199'

interface Props { lang: string; dict: NavDict }

export default function Navbar({ lang, dict }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isContactPage = pathname.split('/')[2] === 'contact'

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setDrawerOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const switchLang = (targetLang: string) => {
    // Replace the locale segment: /en/contact → /es/contact
    const segments = pathname.split('/')
    segments[1] = targetLang
    router.push(segments.join('/') || `/${targetLang}`)
  }

  return (
    <>
      <header
        className={`${styles.nav}${isScrolled ? ` ${styles.isScrolled}` : ''}`}
        id="nav"
      >
        <div className={`wrap ${styles.inner}`}>
          <Link className="brand" href={`/${lang}`} aria-label="TD United Plumbing home">
            <span className="brand__mark">TD</span>
            <span className="brand__name">
              United<span>Plumbing</span>
            </span>
          </Link>

          <nav className={styles.links} aria-label="Primary">
            <Link href={`/${lang}`} aria-current={!isContactPage ? 'page' : undefined}>{dict.home}</Link>
            <Link href={`/${lang}#services`}>{dict.services}</Link>
            <Link href={`/${lang}#service-area`}>{dict.serviceArea}</Link>
            <Link href={`/${lang}/contact`} aria-current={isContactPage ? 'page' : undefined}>{dict.contact}</Link>
          </nav>

          <div className={styles.right}>
            <a className={styles.call} href={`tel:${PHONE_TEL}`}>
              <span className="mono">● {dict.call}</span>
              <strong>{PHONE_DISPLAY}</strong>
            </a>

            <div className={styles.lang} role="group" aria-label={dict.langLabel}>
              <button
                className={`${styles.langBtn}${lang === 'en' ? ` ${styles.isActive}` : ''}`}
                type="button"
                onClick={() => switchLang('en')}
              >
                EN
              </button>
              <button
                className={`${styles.langBtn}${lang === 'es' ? ` ${styles.isActive}` : ''}`}
                type="button"
                onClick={() => switchLang('es')}
              >
                ES
              </button>
            </div>

            <button
              className={`${styles.hamburger}${drawerOpen ? ` ${styles.isOpen}` : ''}`}
              type="button"
              id="hamburger"
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`${styles.scrim}${drawerOpen ? ` ${styles.isOpen}` : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      ></div>

      <aside
        className={`${styles.drawer}${drawerOpen ? ` ${styles.isOpen}` : ''}`}
        id="mobile-drawer"
        aria-hidden={!drawerOpen}
        aria-label="Mobile navigation"
      >
        <div className={styles.drawerTop}>
          <span className="brand__name" style={{ color: '#fff' }}>
            United<span>Plumbing</span>
          </span>
          <button
            className={styles.drawerClose}
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            ×
          </button>
        </div>
        <Link className={styles.drawerLink} href={`/${lang}`} onClick={() => setDrawerOpen(false)}>{dict.home}</Link>
        <Link className={styles.drawerLink} href={`/${lang}#services`} onClick={() => setDrawerOpen(false)}>{dict.services}</Link>
        <Link className={styles.drawerLink} href={`/${lang}#service-area`} onClick={() => setDrawerOpen(false)}>{dict.serviceArea}</Link>
        <Link className={styles.drawerLink} href={`/${lang}/contact`} onClick={() => setDrawerOpen(false)}>{dict.contact}</Link>
        <a className={styles.drawerCall} href={`tel:${PHONE_TEL}`} onClick={() => setDrawerOpen(false)}>
          <span className="mono">● {dict.call}</span>
          <strong>{PHONE_DISPLAY}</strong>
        </a>
      </aside>
    </>
  )
}
