import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { HScroll, ProductCard } from '../components'
import { categories, formatMoney, products } from '../mocks'
import styles from './Screens.module.css'

export function CatalogScreen() {
  const navigate = useNavigate()
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? '')
  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0]
  const visibleProducts = useMemo(
    () => products.filter((product) => product.categoryId === activeCategory?.id),
    [activeCategory?.id],
  )

  return (
    <section className={styles.screen} aria-labelledby="catalog-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Меню</p>
        <h1 className={styles.title} id="catalog-title">
          Каталог
        </h1>
      </header>

      <HScroll aria-label="Категории">
        <div className={styles.categoryRail} role="tablist" aria-label="Product categories">
          {categories.map((category) => {
            const isActive = category.id === activeCategory?.id

            return (
              <button
                aria-controls="catalog-products"
                aria-selected={isActive}
                className={`${styles.categoryTab} ${isActive ? styles.activeCategoryTab : ''}`}
                id={`catalog-tab-${category.id}`}
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                role="tab"
                type="button"
              >
                {category.title}
              </button>
            )
          })}
        </div>
      </HScroll>

      <p className={styles.categorySubtitle}>{activeCategory?.subtitle}</p>

      <div
        aria-labelledby={activeCategory ? `catalog-tab-${activeCategory.id}` : undefined}
        className={styles.grid}
        id="catalog-products"
        role="tabpanel"
      >
        {visibleProducts.map((product) => (
          <ProductCard
            {...(product.badge ? { badge: product.badge } : {})}
            aria-label={`Open ${product.title}`}
            className={styles.productCard}
            imageAlt={product.imageAlt}
            imageSrc={product.imageSrc}
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            price={formatMoney(product.price)}
            title={product.title}
          />
        ))}
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
