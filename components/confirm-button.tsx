"use client";

import type { ReactNode } from "react";

type Props = {
  action: () => void;
  children: ReactNode;
  message: string;
  className?: string;
};

export function ConfirmButton({ action, children, message, className }: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        // confirm() blocks until the teacher answers; only fire the
        // server action if they actually confirmed.
        if (window.confirm(message)) {
          action();
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
