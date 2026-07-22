// @vitest-environment jsdom

import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanupDocument, clickElement, renderIntoDocument, waitFor } from '../testUtils/dom'
import { PaymentScreen } from './PaymentScreen'

const mockOrdersApi = vi.hoisted(() => ({
  getOrderById: vi.fn(),
  cancelOrder: vi.fn(),
  getUserOrders: vi.fn(),
  createOrder: vi.fn(),
}))

const mockPaymentsApi = vi.hoisted(() => ({
  initiatePayment: vi.fn(),
  getSavedCards: vi.fn(),
  deleteSavedCard: vi.fn(),
}))

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('../api/orders', () => mockOrdersApi)
vi.mock('../api/payments', () => mockPaymentsApi)
vi.mock('../api/stripe', () => ({
  getStripe: () => Promise.resolve(null),
  isStripeConfigured: true,
}))

// Render the Stripe Elements/PaymentElement as inert placeholders so no real Stripe.js is needed.
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => null,
  useElements: () => null,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderScreen() {
  return renderIntoDocument(
    <MemoryRouter initialEntries={['/order/500/pay']}>
      <Routes>
        <Route path="/order/:orderId/pay" element={<PaymentScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

const pendingOrder = {
  id: 500,
  shopName: 'Mega Park',
  total: 2600,
  status: 'PENDING_PAYMENT',
  statusNameRu: 'Ожидает оплаты',
  items: [],
}

describe('PaymentScreen', () => {
  beforeEach(() => {
    mockOrdersApi.getOrderById.mockReset()
    mockPaymentsApi.initiatePayment.mockReset()
    mockPaymentsApi.getSavedCards.mockReset()
    mockPaymentsApi.deleteSavedCard.mockReset()
    mockNavigate.mockReset()
  })

  afterEach(async () => {
    await cleanupDocument()
  })

  it('lists saved cards and pays with the selected one, then navigates to the order', async () => {
    mockOrdersApi.getOrderById
      .mockResolvedValueOnce(pendingOrder) // initial load
      .mockResolvedValueOnce({ ...pendingOrder, status: 'NEW' }) // poll after payment
    mockPaymentsApi.getSavedCards.mockResolvedValue([
      { id: 'pm_1', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2030 },
    ])
    mockPaymentsApi.initiatePayment.mockResolvedValue({
      id: 1,
      orderId: 500,
      provider: 'STRIPE',
      status: 'PENDING',
      amount: 2600,
      externalId: 'pi_x',
      createdAt: '',
      updatedAt: '',
      clientSecret: null,
    })

    const { container } = await renderScreen()

    await waitFor(() => {
      expect(container.textContent).toContain('•••• 4242')
    })

    const payButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Оплатить'),
    )
    expect(payButton).not.toBeUndefined()
    await clickElement(payButton!)

    await waitFor(() => {
      expect(mockPaymentsApi.initiatePayment).toHaveBeenCalledWith(500, {
        provider: 'STRIPE',
        paymentMethodId: 'pm_1',
      })
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/order/500')
    })
  })

  it('prepares a client secret and renders the Payment Element for a new card', async () => {
    mockOrdersApi.getOrderById.mockResolvedValue(pendingOrder)
    mockPaymentsApi.getSavedCards.mockResolvedValue([]) // no saved cards -> defaults to new card
    mockPaymentsApi.initiatePayment.mockResolvedValue({
      id: 2,
      orderId: 500,
      provider: 'STRIPE',
      status: 'PENDING',
      amount: 2600,
      externalId: 'pi_y',
      createdAt: '',
      updatedAt: '',
      clientSecret: 'pi_y_secret_abc',
    })

    const { container } = await renderScreen()

    await waitFor(() => {
      expect(container.querySelector('[data-testid="payment-element"]')).not.toBeNull()
    })

    expect(mockPaymentsApi.initiatePayment).toHaveBeenCalledWith(500, { provider: 'STRIPE' })
  })

  it('shows an error state when the order fails to load', async () => {
    mockOrdersApi.getOrderById.mockRejectedValue(new Error('boom'))
    mockPaymentsApi.getSavedCards.mockResolvedValue([])

    const { container } = await renderScreen()

    await waitFor(() => {
      expect(container.textContent).toContain('Не удалось загрузить заказ')
    })
  })
})
