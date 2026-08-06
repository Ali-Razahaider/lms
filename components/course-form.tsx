"use client";

import { useActionState } from "react";
import type { CourseFormState } from "@/lib/actions/teacher";

export type CategoryOption = { id: string; name: string };

type Props = {
  action: (prev: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  categories: CategoryOption[];
  initialValues?: {
    title: string;
    description: string;
    priceDollars: string;
    categoryId: string;
    published: boolean;
  };
};

export function CourseForm({ action, categories, initialValues }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    error: undefined,
    values: initialValues,
  });

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm"
    >
      {state.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={state.values?.title}
          placeholder="e.g. Advanced TypeScript"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={state.values?.description}
          placeholder="What will students learn in this course?"
          className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="price" className="block text-sm font-medium">
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            defaultValue={state.values?.priceDollars ?? "0"}
            placeholder="0.00"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-muted">
            Leave at 0 to offer the course free.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={state.values?.categoryId ?? ""}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="published"
          defaultChecked={state.values?.published}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Publish immediately
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save course"}
      </button>
    </form>
  );
}
