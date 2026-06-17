import type { TopBarDict } from '@/app/[lang]/dictionaries'
import styles from './TopBar.module.css'

const PHONE_DISPLAY = '(954) 555-0199'
const PHONE_TEL = '+19545550199'

interface Props { dict: TopBarDict }

export default function TopBar({ dict }: Props) {
  return (
    <div className={styles.topbar}>
      <div className={`wrap ${styles.inner}`}>
        <span className={styles.mono}>
          <span className={styles.pulse} aria-hidden="true"></span>
          {dict.dispatch}
        </span>
        <span className={styles.sep} aria-hidden="true">/</span>
        <span className={styles.meta}>{dict.location}</span>
        <a className={styles.call} href={`tel:${PHONE_TEL}`}>
          ▸ {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  )
}
