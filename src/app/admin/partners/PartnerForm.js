"use client";
import { useActionState, useEffect, useRef, startTransition } from "react";
import Spinner from "@/components/Spinner";
import { createPartner } from "./actions";
import { PARTNER_CATEGORIES } from "@/lib/partners-shared";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export default function PartnerForm() {
  const [state, action, pending] = useActionState(createPartner, null);
  const formRef = useRef(null);

  // clear the form after a successful save, but keep what was typed if validation failed
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">Add a partner</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name"><input name="name" required maxLength={60} className="input" /></Field>
        <Field label="Category">
          <select name="category" required defaultValue="" className="input">
            <option value="" disabled>Choose one</option>
            {PARTNER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Tagline"><input name="tagline" required maxLength={140} className="input" /></Field>
      <Field label="Offer (optional)" hint="For example: ₹5,000 credit for Buncho founders">
        <input name="offer" maxLength={120} className="input" />
      </Field>
      <Field label="Link" hint="Your affiliate or tracking link. Visitors go here after we count the click.">
        <input name="linkUrl" type="url" required placeholder="https://" className="input" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Logo URL (optional)"><input name="logoUrl" type="url" className="input" /></Field>
        <Field label="Type">
          <select name="kind" defaultValue="AFFILIATE" className="input">
            <option value="AFFILIATE">Affiliate link (labelled "Affiliate")</option>
            <option value="SPONSOR">Paid sponsor (labelled "Sponsored")</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Order" hint="Lower shows first"><input name="sortOrder" type="number" defaultValue={0} className="input" /></Field>
        <Field label="Starts (optional)"><input name="startsAt" type="date" className="input" /></Field>
        <Field label="Ends (optional)"><input name="endsAt" type="date" className="input" /></Field>
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>}
      {state?.ok && !pending && <p role="status" className="rounded-xl bg-mint-soft p-3 text-sm text-mint">Partner added.</p>}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Saving</>) : "Add partner"}</button>
    </form>
  );
}