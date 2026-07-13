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
  const selectedSize =
    product.sizes.find((size) => size.price === product.price) ?? product.sizes.at(-1) ?? product.sizes[0]
  const selectedPrice = selectedSize?.price ?? product.price

  return (
    <section className={`${styles.screen} ${styles.productScreen}`} aria-labelledby="product-title">
      <div className={styles.productHero}>
        <img className={styles.productHeroImage} src={product.imageSrc} alt={product.imageAlt} draggable={false} />
        <div className={styles.productHeroShade} aria-hidden="true" />

        <div className={styles.productTopControls}>
          <button className={styles.productIconButton} type="button" aria-label="Добавить в избранное">
            ♡
          </button>
          <h1 className={styles.productTopTitle} id="product-title">
            {product.title}
          </h1>
          <Link className={styles.productIconButton} to="/catalog" aria-label="Закрыть карточку товара">
            ×
          </Link>
        </div>

        <div className={styles.productHeroCopy}>
          <p className={styles.productPrice}>{formatMoney(selectedPrice)}</p>
          <p className={styles.productDescription}>{product.description}</p>
        </div>
      </div>

      <div className={styles.productContent}>
        <div className={styles.productNutritionBlock}>
          <NutritionRow
            calories={product.nutrition.calories}
            carbs={product.nutrition.carbs}
            fats={product.nutrition.fats}
            proteins={product.nutrition.proteins}
          />
          <button className={styles.productDetailsButton} type="button" aria-expanded="false">
            подробнее <span aria-hidden="true">∨</span>
          </button>
        </div>

        <HScroll className={styles.productModifierScroll} aria-label="Конструктор модификаторов">
          <div className={styles.productModifierRail}>
            {productModifiers.map((modifier) => {
              const selectedOption = modifier.options.find((option) => option.selected) ?? modifier.options[0]
              const isToggle = modifier.type === 'toggle'

              return (
                <button
                  className={styles.productModifierCard}
                  key={modifier.id}
                  type="button"
                  aria-pressed={isToggle ? selectedOption?.selected === true : undefined}
                >
                  <span className={styles.productModifierTitle}>{modifier.title}</span>
                  <span className={styles.productModifierFooter}>
                    {isToggle ? (
                      <span className={styles.productModifierToggle} aria-hidden="true">
                        <span />
                      </span>
                    ) : (
                      <span className={styles.productModifierHint}>{selectedOption?.title ?? 'Выбрать'}</span>
                    )}
                    {!isToggle && selectedOption?.priceDelta ? (
                      <span className={styles.productModifierPrice}>+ {formatMoney(selectedOption.priceDelta)}</span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </HScroll>
      </div>

      <div className={styles.productBottomBar}>
        <button className={styles.productSizePill} type="button" aria-label="Выбрать объем">
          <span>{selectedSize?.label ?? '400 мл'}</span>
          <span aria-hidden="true">⌄</span>
        </button>
        <Link className={styles.productAddButton} to="/cart" aria-label={`Добавить ${product.title} в корзину`}>
          + {formatMoney(selectedPrice)}
        </Link>
      </div>
    </section>
  )
}
