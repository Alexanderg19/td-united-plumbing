import type { FloatingWaDict } from '@/app/[lang]/dictionaries'
import styles from './FloatingWhatsApp.module.css'

const WA_URL = 'https://wa.me/19545550199'

interface Props { dict: FloatingWaDict }

export default function FloatingWhatsApp({ dict }: Props) {
  return (
    <a
      className={styles.wa_float}
      href={WA_URL}
      target="_blank"
      rel="noopener"
      aria-label={dict.ariaLabel}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20zm4.5-5.9c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-3-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-1 2.2A5.2 5.2 0 009 12.5a11.7 11.7 0 004.5 4 5 5 0 002.3.4 2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.6-.3z" />
      </svg>
      <span className={styles.txt}>
        {dict.label}
        <small>{dict.sub}</small>
      </span>
    </a>
  )
}
