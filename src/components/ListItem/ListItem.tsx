import type { HTMLAttributes } from 'react'

import { classNames } from '../classNames'
import styles from './ListItem.module.css'

export type ListItemProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  address: string
  time: string
  marker?: boolean
  markerLabel?: string
}

export function ListItem({
  title,
  address,
  time,
  marker = false,
  markerLabel = 'selected',
  className,
  ...props
}: ListItemProps) {
  return (
    <div className={classNames(styles.item, className)} {...props}>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.meta}>{address}</p>
        <p className={styles.meta}>{time}</p>
      </div>
      {marker ? <span className={styles.marker} aria-label={markerLabel} role="img" /> : null}
    </div>
  )
}
