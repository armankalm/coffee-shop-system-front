import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'

import { ApiError } from '../api/client'
import { getOrderById, type OrderDto } from '../api/orders'
import {
  deleteSavedCard,
  getSavedCards,
  initiatePayment,
  type SavedCard,
} from '../api/payments'
import { getStripe, isStripeConfigured } from '../api/stripe'
import styles from './Screens.module.css'

const POLL_INTERVAL_MS = 2_000
const POLL_TIMEOUT_MS = 90_000

function formatMoney(amount: number) {
  return `${amount.toLocaleString('ru-RU')} ₸`
}

function formatCardLabel(card: SavedCard) {
  const brand = card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : 'Карта'
  const exp = `${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`
  return `${brand} •••• ${card.last4} · ${exp}`
}

const stripePromise = getStripe()

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; order: OrderDto; cards: SavedCard[] }

/** Selection is either a saved card id, or the sentinel for entering a new card. */
const NEW_CARD = 'new-card'

export function PaymentScreen() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const id = Number(orderId)

  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [selected, setSelected] = useState<string>(NEW_CARD)
  const [reloadKey, setReloadKey] = useState(0)

  // Bumping reloadKey re-runs the loader effect (used by the retry button and after card deletion).
  const reload = useCallback(async () => {
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!orderId || Number.isNaN(id)) {
        setState({ status: 'error', message: 'Некорректный заказ.' })
        return
      }
      try {
        const order = await getOrderById(id)
        // Saved cards are best-effort: a failure here must not block paying with a new card.
        let cards: SavedCard[] = []
        try {
          cards = await getSavedCards()
        } catch {
          cards = []
        }
        if (cancelled) return
        setState({ status: 'ready', order, cards })
        setSelected(cards[0]?.id ?? NEW_CARD)
      } catch (err) {
        if (cancelled) return
        setState({
          status: 'error',
          message: err instanceof ApiError ? err.message : 'Не удалось загрузить заказ.',
        })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [orderId, id, reloadKey])

  if (!isStripeConfigured) {
    return (
      <PaymentShell>
        <p className={styles.muted}>
          Оплата картой недоступна: не задан ключ Stripe (VITE_STRIPE_PUBLISHABLE_KEY).
        </p>
      </PaymentShell>
    )
  }

  if (state.status === 'loading') {
    return (
      <PaymentShell>
        <p className={styles.muted}>Загружаем заказ…</p>
      </PaymentShell>
    )
  }

  if (state.status === 'error') {
    return (
      <PaymentShell>
        <p className={styles.muted}>{state.message}</p>
        <button className={styles.ghostButton} type="button" onClick={() => void reload()}>
          Повторить
        </button>
      </PaymentShell>
    )
  }

  return (
    <PaymentContent
      order={state.order}
      cards={state.cards}
      selected={selected}
      onSelect={setSelected}
      onCardsChanged={reload}
      onPaid={() => navigate(`/order/${state.order.id}`)}
    />
  )
}

function PaymentShell({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.screen} aria-labelledby="payment-title">
      <header className={styles.profileHeader}>
        <Link className={styles.roundIconButton} to="/cart" aria-label="Назад">
          <span aria-hidden="true">‹</span>
        </Link>
        <h1 className={styles.title} id="payment-title">
          Оплата
        </h1>
        <span className={styles.roundIconButton} aria-hidden="true" />
      </header>
      {children}
    </section>
  )
}

type PaymentContentProps = {
  order: OrderDto
  cards: SavedCard[]
  selected: string
  onSelect: (value: string) => void
  onCardsChanged: () => Promise<void>
  onPaid: () => void
}

function PaymentContent({ order, cards, selected, onSelect, onCardsChanged, onPaid }: PaymentContentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usingNewCard = selected === NEW_CARD

  // When switching to "new card", request a PaymentIntent so the Payment Element can mount.
  useEffect(() => {
    let cancelled = false

    async function prepare() {
      if (!usingNewCard) {
        setClientSecret(null)
        return
      }
      setIsPreparing(true)
      setError(null)
      try {
        const tx = await initiatePayment(order.id, { provider: 'STRIPE' })
        if (cancelled) return
        setClientSecret(tx.clientSecret)
        if (!tx.clientSecret) {
          setError('Не удалось подготовить оплату. Попробуйте ещё раз.')
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Не удалось подготовить оплату.')
      } finally {
        if (!cancelled) setIsPreparing(false)
      }
    }

    void prepare()
    return () => {
      cancelled = true
    }
  }, [usingNewCard, order.id])

  async function handleSavedCardPay() {
    setIsPaying(true)
    setError(null)
    try {
      await initiatePayment(order.id, { provider: 'STRIPE', paymentMethodId: selected })
      // Backend confirms server-side and the webhook promotes the order — poll until it flips.
      await pollUntilPaid(order.id)
      onPaid()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Оплата не прошла. Попробуйте другую карту.')
      setIsPaying(false)
    }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      await deleteSavedCard(cardId)
      await onCardsChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось удалить карту.')
    }
  }

  const elementsOptions = useMemo<StripeElementsOptions | null>(
    () => (clientSecret ? { clientSecret, appearance: { theme: 'stripe' } } : null),
    [clientSecret],
  )

  return (
    <PaymentShell>
      <article className={styles.orderSummaryCard}>
        <p className={styles.eyebrow}>{order.shopName}</p>
        <p className={styles.price}>{formatMoney(order.total)}</p>
        <p className={styles.muted}>Заказ №{order.id}</p>
      </article>

      <div className={styles.list} role="radiogroup" aria-label="Способ оплаты">
        {cards.map((card) => (
          <label className={styles.cartCard} key={card.id}>
            <input
              type="radio"
              name="payment-method"
              value={card.id}
              checked={selected === card.id}
              onChange={() => onSelect(card.id)}
            />
            <span className={styles.cardTitle}>{formatCardLabel(card)}</span>
            <button
              className={styles.roundIconButton}
              type="button"
              aria-label="Удалить карту"
              onClick={() => void handleDeleteCard(card.id)}
            >
              🗑
            </button>
          </label>
        ))}

        <label className={styles.cartCard}>
          <input
            type="radio"
            name="payment-method"
            value={NEW_CARD}
            checked={usingNewCard}
            onChange={() => onSelect(NEW_CARD)}
          />
          <span className={styles.cardTitle}>Новая карта</span>
        </label>
      </div>

      {error ? <p className={styles.muted}>{error}</p> : null}

      {usingNewCard ? (
        isPreparing ? (
          <p className={styles.muted}>Подготавливаем форму оплаты…</p>
        ) : elementsOptions ? (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <NewCardForm
              orderId={order.id}
              amountLabel={formatMoney(order.total)}
              onPaid={onPaid}
              onError={setError}
            />
          </Elements>
        ) : null
      ) : (
        <button
          className={styles.payButton}
          type="button"
          disabled={isPaying}
          onClick={() => void handleSavedCardPay()}
        >
          {isPaying ? 'Оплачиваем…' : `Оплатить ${formatMoney(order.total)}`}
        </button>
      )}
    </PaymentShell>
  )
}

type NewCardFormProps = {
  orderId: number
  amountLabel: string
  onPaid: () => void
  onError: (message: string) => void
}

function NewCardForm({ orderId, amountLabel, onPaid, onError }: NewCardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isPaying, setIsPaying] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!stripe || !elements) return

    setIsPaying(true)
    onError('')

    const { error: submitError } = await elements.submit()
    if (submitError) {
      onError(submitError.message ?? 'Проверьте данные карты.')
      setIsPaying(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}`,
      },
    })

    if (error) {
      onError(error.message ?? 'Оплата не прошла. Попробуйте ещё раз.')
      setIsPaying(false)
      return
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      // The webhook promotes the order; poll until it leaves PENDING_PAYMENT.
      try {
        await pollUntilPaid(orderId)
      } catch (pollErr) {
        onError(pollErr instanceof ApiError ? pollErr.message : 'Оплата обрабатывается, обновите позже.')
        setIsPaying(false)
        return
      }
      onPaid()
      return
    }

    setIsPaying(false)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.list}>
      <PaymentElement />
      <button className={styles.payButton} type="submit" disabled={!stripe || isPaying}>
        {isPaying ? 'Оплачиваем…' : `Оплатить ${amountLabel}`}
      </button>
    </form>
  )
}

/** Polls the order until it leaves PENDING_PAYMENT (paid) or times out. */
async function pollUntilPaid(orderId: number): Promise<OrderDto> {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  for (;;) {
    const order = await getOrderById(orderId)
    if (order.status !== 'PENDING_PAYMENT') {
      return order
    }
    if (Date.now() > deadline) {
      throw new ApiError(408, 'Оплата обрабатывается дольше обычного. Проверьте статус заказа позже.')
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}
