import { apiDelete, apiGet, apiPost } from './client'

export type PaymentProvider = 'STRIPE' | 'KASPI'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export type SavedCard = {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export type PaymentTransaction = {
  id: number
  orderId: number
  provider: PaymentProvider
  status: PaymentStatus
  amount: number
  externalId: string
  createdAt: string
  updatedAt: string
  /** Present only when initiating a Stripe payment for a new card. */
  clientSecret: string | null
}

export type InitiatePaymentRequest = {
  provider: PaymentProvider
  /** Charge a previously saved card; omit to collect a new card on the client. */
  paymentMethodId?: string
}

export function initiatePayment(orderId: number, request: InitiatePaymentRequest) {
  return apiPost<PaymentTransaction>(`/orders/${orderId}/pay`, request, true)
}

export function getSavedCards() {
  return apiGet<SavedCard[]>('/payment-methods')
}

export function deleteSavedCard(paymentMethodId: string) {
  return apiDelete<void>(`/payment-methods/${paymentMethodId}`)
}
