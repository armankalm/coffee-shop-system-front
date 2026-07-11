import { Link, useParams } from 'react-router-dom'

import { HScroll, NutritionRow } from '../components'
import { formatMoney, modifiers, products } from '../mocks'
import styles from './Screens.module.css'

export function ProductScreen() {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId) ?? products[0]

  if (!product) {
    return null
  }

  const productModifiers = modifiers.filter((modifier) => product.modifierIds.includes(modifier.id))

  return (
    <section className={styles.screen} aria-labelledby="product-title">
      <img className={styles.heroImage} src={product.imageSrc} alt={product.imageAlt} draggable={false} />
      <header className={styles.header}>
        <p className={styles.eyebrow}>{formatMoney(product.price)}</p>
        <h1 className={styles.title} id="product-title">
          {product.title}
        </h1>
        <p className={styles.muted}>{product.description}</p>
      </header>

      <NutritionRow
        calories={product.nutrition.calories}
        carbs={product.nutrition.carbs}
        className={styles.nutrition}
        fats={product.nutrition.fats}
        proteins={product.nutrition.proteins}
      />

      <HScroll aria-label="Модификаторы">
        <div className={styles.modifierRail}>
          {productModifiers.map((modifier) => (
            <span className={styles.chip} key={modifier.id}>
              {modifier.title}
            </span>
          ))}
        </div>
      </HScroll>

      <div className={styles.actions}>
        <Link className={styles.ghostButton} to="/catalog">
          Каталог
        </Link>
        <Link className={styles.linkButton} to="/cart">
          Добавить {formatMoney(product.price)}
        </Link>
      </div>
    </section>
  )
}
