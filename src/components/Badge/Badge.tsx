import type { HTMLAttributes, ReactNode } from 'react'

import { classNames } from '../classNames'
import styles from './Badge.module.css'

export type BadgeTone = 'blue' | 'green' | 'orange' | 'muted'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
  children: ReactNode
}

export function Badge({ tone = 'blue', className, children, ...props }: BadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[tone], className)} {...props}>
      {children}
    </span>
  )
}
