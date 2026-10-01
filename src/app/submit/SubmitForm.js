"use client";
import { useActionState, useState, startTransition } from "react";
import { submitProduct } from "./actions";
import Spinner from "@/components/Spinner";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export default function SubmitForm({ categories }) {
  const [state, action, pending] = useActionState(submitProduct, null);
  const [tagline, setTagline] = useState("");
  const [logo, setLogo] = useState("");
  const validLogo = /^https?:\/\//.test(logo);
  const [filled, setFilled] = useState(0);
  const REQUIRED = ["name", "tagline", "description", "websiteUrl", "categoryId"];

  function onChange(e) {
    const fd = new FormData(e.currentTarget);
    setFilled(REQUIRED.filter((k) => String(fd.get(k) || "").trim()).length);
  }

  // Submitting through a transition keeps what the founder typed if validation fails.
  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} onChange={onChange} className="card space-y-8 p-5 sm:p-8">
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted">
          <span>{filled === REQUIRED.length ? "Ready to submit" : "Listing strength"}</span>
          <span>{filled} of {REQUIRED.length} required fields</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${(filled / REQUIRED.length) * 100}%` }} />
        </div>
      </div>
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">The basics</h2>
        <Field label="Product name">
          <input name="name" required maxLength={60} className="input" />
        </Field>
        <Field label="Tagline" hint={`${tagline.length}/100. One line on what it does.`}>
          <input name="tagline" required maxLength={100} value={tagline} onChange={(e) => setTagline(e.target.value)} className="input" />
        </Field>
        <Field label="Description" hint="At least 30 characters. Who is it for, and what problem does it solve?">
          <textarea name="description" required rows={6} className="input" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category">
            <select name="categoryId" required defaultValue="" className="input">
              <option value="" disabled>Choose one</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Pricing">
            <input name="pricing" list="pricing-options" placeholder="Free, or ₹299/month" className="input" />
            <datalist id="pricing-options">
              <option value="Free" />
              <option value="Freemium" />
              <option value="Paid" />
            </datalist>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Links and images</h2>
        <Field label="Website URL">
          <input name="websiteUrl" type="url" required placeholder="https://" className="input" />
        </Field>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Field label="Logo image URL" hint="Optional. Direct link to a square image.">
              <input name="logoUrl" type="url" value={logo} onChange={(e) => setLogo(e.target.value)} className="input" />
            </Field>
          </div>
          {validLogo && <img src={logo} alt="Logo preview" className="h-12 w-12 rounded-xl border border-line object-cover" />}
        </div>
        <Field label="Screenshot URLs" hint="Optional. One link per line, up to 5.">
          <textarea name="screenshots" rows={3} className="input" />
        </Field>
      </section>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>
      )}

      <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">You can have up to 3 products in review at a time.</p>
        <button disabled={pending} className="btn-primary w-full sm:w-auto">{pending ? (<><Spinner />Submitting</>) : "Submit for review"}</button>
      </div>
    </form>
  );
}