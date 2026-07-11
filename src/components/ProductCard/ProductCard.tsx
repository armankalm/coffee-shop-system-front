import type { ButtonHTMLAttributes } from 'react'

import { Badge, type BadgeTone } from '../Badge'
import { classNames } from '../classNames'
import styles from './ProductCard.module.css'

export type ProductCardBadge = {
  label: string
  tone?: BadgeTone
}

export type ProductCardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  imageAlt: string
  imageSrc: string
  title: string
  price: string
  badge?: ProductCardBadge
}

export function ProductCard({
  imageAlt,
  imageSrc,
  title,
  price,
  badge,
  className,
  type = 'button',
  ...props
}: ProductCardProps) {
  return (
    <button className={classNames(styles.card, className)} type={type} {...props}>
      <span className={styles.imageFrame}>
        <img className={styles.image} src={imageSrc} alt={imageAlt} draggable={false} />
        {badge ? (
          <Badge className={styles.badge} tone={badge.tone ?? 'blue'}>
            {badge.label}
          </Badge>
        ) : null}
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.footer}>
        <span className={styles.price}>{price}</span>
        <span className={styles.arrow} aria-hidden="true">
          &gt;
        </span>
      </span>
    </button>
  )
}
