import React, { FC } from 'react'
import Link from 'next/link'
import { AiOutlineUser, AiOutlineHome } from 'react-icons/ai'
import styles from '../../styles/organisms/Navigation.module.scss'

// AiOutlineMail

const Navigation: FC = () => {
  return (
    <nav className={styles.navigation}>
      <div className={styles.navigation_head}>
        <Link href="/">Logo</Link>
      </div>
      <div className={styles.navigation_body}>
        <ul className={styles.icons}>
          <li className={styles.icon}><Link href="/">Home</Link></li>
          <li className={styles.icon}><Link href="/profile">Profile</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation