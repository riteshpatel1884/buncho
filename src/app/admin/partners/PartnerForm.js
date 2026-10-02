"use client";
import { useActionState, useEffect, useRef, startTransition } from "react";
import Spinner from "@/components/Spinner";
import { createPartner, updatePartner } from "./actions";
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

// Used to add a partner (no `partner` prop) or to edit one (pass the partner).
export default function PartnerForm({ partner }) {
  const editing = !!partner;
  const [state, action, pending] = useActionState(editing ? updatePartner : createPartner, null);
  const formRef = useRef(null);

  // After adding, clear the form. After editing, keep the values. After an error, keep what was typed.
  useEffect(() => {
    if (state?.ok && !editing) formRef.current?.reset();
  }, [state, editing]);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={editing ? "space-y-4" : "card space-y-4 p-5 sm:p-6"}
    >
      {!editing && <h2 className="font-display text-xl font-bold">Add a partner</h2>}
      {editing && <input type="hidden" name="id" value={partner.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" required maxLength={60} defaultValue={partner?.name} className="input" />
        </Field>
        <Field label="Category">
          <select name="category" required defaultValue={partner?.category ?? ""} className="input">
            <option value="" disabled>Choose one</option>
            {PARTNER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Tagline">
        <input name="tagline" required maxLength={140} defaultValue={partner?.tagline} className="input" />
      </Field>
      <Field label="Offer (optional)" hint="For example: ₹5,000 credit for Buncho founders">
        <input name="offer" maxLength={120} defaultValue={partner?.offer ?? ""} className="input" />
      </Field>
      <Field label="Link" hint="Your affiliate or tracking link. Visitors go here after we count the click.">
        <input name="linkUrl" type="url" required placeholder="https://" defaultValue={partner?.linkUrl} className="input" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Logo URL (optional)">
          <input name="logoUrl" type="url" defaultValue={partner?.logoUrl ?? ""} className="input" />
        </Field>
        <Field label="Type">
          <select name="kind" defaultValue={partner?.kind ?? "AFFILIATE"} className="input">
            <option value="AFFILIATE">Affiliate link (labelled "Affiliate")</option>
            <option value="SPONSOR">Paid sponsor (labelled "Sponsored")</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Order" hint="Lower shows first">
          <input name="sortOrder" type="number" defaultValue={partner?.sortOrder ?? 0} className="input" />
        </Field>
        <Field label="Starts (optional)">
          <input name="startsAt" type="date" defaultValue={partner?.startsAt ?? ""} className="input" />
        </Field>
        <Field label="Ends (optional)">
          <input name="endsAt" type="date" defaultValue={partner?.endsAt ?? ""} className="input" />
        </Field>
      </div>

      {state?.error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>}
      {state?.ok && !pending && (
        <p role="status" className="rounded-xl bg-mint-soft p-3 text-sm text-mint">{editing ? "Changes saved." : "Partner added."}</p>
      )}
      <button disabled={pending} className="btn-primary">
        {pending ? (<><Spinner />Saving</>) : editing ? "Save changes" : "Add partner"}
      </button>
    </form>
  );
}