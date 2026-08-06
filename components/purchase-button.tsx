"use client";

import { useActionState } from "react";
import type { CheckoutState } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/format";

type Props = {
  action: (prev: CheckoutState, formData: FormData) => Promise<CheckoutState>;
  price: number;
};

export function PurchaseButton({ action, price }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    error: undefined,
  });

  return (
    <form action={formAction}>
      <p className="font-medium">
        {formatPrice(price)} · One-time payment
      </p>
      <p className="mt-1 text-sm text-muted">
        Pay securely with a card. You&apos;ll get instant access.
      </p>

      {state.error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Opening checkout…" : `Buy for ${formatPrice(price)}`}
      </button>
    </form>
  );
}
