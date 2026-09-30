"use client";
import { useActionState } from "react";
import { submitProduct } from "./actions";

const field = "w-full rounded-md border border-line bg-white px-3 py-2";

export default function SubmitForm({ categories }) {
  const [state, action, pending] = useActionState(submitProduct, null);
  return (
    <form action={action} className="max-w-xl space-y-4">
      <label className="block">Product name<input name="name" required className={field} /></label>
      <label className="block">Tagline<input name="tagline" required maxLength={100} className={field} /></label>
      <label className="block">Description<textarea name="description" required rows={5} className={field} /></label>
      <label className="block">Website URL<input name="websiteUrl" type="url" required placeholder="https://" className={field} /></label>
      <label className="block">Category
        <select name="categoryId" required className={field} defaultValue="">
          <option value="" disabled>Select</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="block">Pricing (for example: Free, ₹299/month)<input name="pricing" className={field} /></label>
      <label className="block">Logo image URL<input name="logoUrl" type="url" className={field} /></label>
      <label className="block">Screenshot URLs, one per line (max 5)<textarea name="screenshots" rows={3} className={field} /></label>
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded-md bg-accent px-5 py-2 font-medium text-white disabled:opacity-60">
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
