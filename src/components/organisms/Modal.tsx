import React, { FC, useState } from 'react'
import styles from '../../styles/organisms/Modal.module.scss'

// AiOutlineMail

type Props = {
  isActive: boolean,
  handleActive: (isActive: boolean) => void,
}

const Modal: FC<Props> = ({ isActive, handleActive, children }) => {

  return (
    <div className={`${styles.modal} ${isActive ? styles.modal_active : ''}`}>
      <div className={styles.modal_container}>
        {children}
      </div>
      <div className={styles.modal_back} onClick={() => handleActive(false)}></div>
    </div>
  )
}

export default Modal