"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-md bg-ink text-white p-4 gap-3 !border-0 !shadow-none",
          description: "text-surface-3 text-body-sm",
          actionButton:
            "bg-primary text-on-primary font-semibold rounded-sm px-3 py-1.5 hover:bg-primary-active",
          cancelButton:
            "bg-ink-surface-2 text-white font-medium rounded-sm px-3 py-1.5 hover:bg-ink-surface-3",
        },
      }}
    />
  );
}
