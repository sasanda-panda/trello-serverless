import React, { FC } from 'react'
import Link from 'next/link'
import styles from '../../styles/organisms/Navigation.module.scss'

const Navigation: FC = () => {
  return (
    <nav className={styles.navigation}>
      <div className={styles.navigation_head}>
        <Link href="/">Logo</Link>
      </div>
      <div className={styles.navigation_body}>
        <ul className={styles.icons}>
          <li className={styles.icon}><Link href="/">Icon Home</Link></li>
          <li className={styles.icon}><Link href="/profile">Icon Profile</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation