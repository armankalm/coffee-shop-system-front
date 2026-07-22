import { loadStripe, type Stripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

// Single shared Stripe.js instance for the whole app (loadStripe is memoized per key).
let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) {
    return Promise.resolve(null)
  }
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

export const isStripeConfigured = Boolean(publishableKey)
