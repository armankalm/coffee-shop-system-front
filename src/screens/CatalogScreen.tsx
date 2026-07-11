import { Link, useNavigate } from 'react-router-dom'

import { HScroll, ProductCard } from '../components'
import { categories, formatMoney, products } from '../mocks'
import styles from './Screens.module.css'

export function CatalogScreen() {
  const navigate = useNavigate()
  const activeCategory = categories[0]

  return (
    <section className={styles.screen} aria-labelledby="catalog-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Меню</p>
        <h1 className={styles.title} id="catalog-title">
          Каталог
        </h1>
        <p className={styles.muted}>{activeCategory?.subtitle}</p>
      </header>

      <HScroll aria-label="Категории">
        <div className={styles.categoryRail}>
          {categories.map((category) => (
            <span
              className={`${styles.chip} ${category.id === activeCategory?.id ? styles.activeChip : ''}`}
              key={category.id}
            >
              {category.title}
            </span>
          ))}
        </div>
      </HScroll>

      <div className={styles.grid}>
        {products.map((product) => {
          const badgeProps = product.badge ? { badge: product.badge } : {}

          return (
            <ProductCard
              {...badgeProps}
              className={styles.productCard}
              imageAlt={product.imageAlt}
              imageSrc={product.imageSrc}
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              price={formatMoney(product.price)}
              title={product.title}
            />
          )
        })}
      </div>

      <div className={styles.actions}>
        <Link className={styles.ghostButton} to="/locations">
          Адрес
        </Link>
        <Link className={styles.linkButton} to="/cart">
          Корзина
        </Link>
      </div>
    </section>
  )
}
