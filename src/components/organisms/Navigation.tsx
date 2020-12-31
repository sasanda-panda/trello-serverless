import React, { FC } from 'react'
import Link from 'next/link'
import { AiOutlineHome, AiOutlineUser } from 'react-icons/ai'
import styles from '../../styles/organisms/Navigation.module.scss'

// AiOutlineMail

const Navigation: FC = () => {
  return (
    <nav className={styles.navigation}>
      <div className={styles.navigation_head}>
        <Link href="/">Trello Clone</Link>
      </div>
      <div className={styles.navigation_body}>
        <ul className={styles.icons}>
          <li className={styles.icon}><Link href="/"><div><AiOutlineHome /></div></Link></li>
          <li className={styles.icon}><Link href="/profile"><div><AiOutlineUser /></div></Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation