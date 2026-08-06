import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
  }
  return stripe;
}

/**
 * The absolute URL of the app, used for Stripe success/cancel URLs.
 * Required because Stripe redirects the browser back to a public URL.
 */
export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
