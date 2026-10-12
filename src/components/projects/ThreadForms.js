"use client";
import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import Field from "@/components/Field";
import Spinner from "@/components/Spinner";
import { submitProposal, sendThreadMessage } from "@/app/projects/actions";
import { PRICE_MAX } from "@/lib/projects";

// The expert's first move on a project: send an offer, or ask a question first.
export function ProposalForm({ projectId, defaultPrice }) {
  const [state, action, pending] = useActionState(submitProposal, null);
  const [which, setWhich] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const intent = e.nativeEvent.submitter?.value === "question" ? "question" : "offer";
    fd.set("intent", intent);
    setWhich(intent);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-6">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <h2 className="font-display text-xl">Send a proposal</h2>
        <p className="mt-1 text-sm text-muted">Say what the student gets for your price. If your price is higher than the budget, explain what the extra covers.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Your price (₹)"><input name="price" type="number" min={50} max={PRICE_MAX} defaultValue={defaultPrice ?? ""} className="input" /></Field>
        <Field label="Delivery (days)"><input name="days" type="number" min={1} max={90} defaultValue={3} className="input" /></Field>
      </div>
      <Field label="Your message" hint="For an offer: say exactly what the student gets for this price. To ask first: leave the price and ask your question.">
        <textarea name="body" required rows={5} minLength={20} maxLength={2000} className="input" />
      </Field>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      <div className="flex flex-wrap gap-2">
        <button name="intent" value="offer" disabled={pending} className="btn-primary">{pending && which === "offer" ? (<><Spinner />Sending</>) : "Send offer"}</button>
        <button name="intent" value="question" disabled={pending} className="btn-outline">{pending && which === "question" ? (<><Spinner />Sending</>) : "Ask a question first"}</button>
      </div>
    </form>
  );
}

// Messages, offers and deliveries inside a conversation.
export function ThreadComposer({ proposalId, canOffer, canDeliver, defaultPrice, defaultDays }) {
  const tabs = [["message", "Message"], ...(canOffer ? [["offer", "Make an offer"]] : []), ...(canDeliver ? [["delivery", "Deliver work"]] : [])];
  const [tab, setTab] = useState("message");
  const [state, action, pending] = useActionState(sendThreadMessage, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("intent", tab);
    startTransition(() => action(fd));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-4 p-5">
      <input type="hidden" name="proposalId" value={proposalId} />
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {tabs.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium ${tab === k ? "border-brand bg-brand-soft text-brand" : "border-line"}`}>{label}</button>
          ))}
        </div>
      )}
      {tab === "offer" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)"><input name="price" type="number" required min={50} max={PRICE_MAX} defaultValue={defaultPrice ?? ""} className="input" /></Field>
          <Field label="Delivery (days)"><input name="days" type="number" required min={1} max={90} defaultValue={defaultDays ?? 3} className="input" /></Field>
        </div>
      )}
      <Field
        label={tab === "offer" ? "What is included at this price" : tab === "delivery" ? "Your delivery" : "Your message"}
        hint="Don't include phone numbers, emails, links or social handles. Buncho monitors every conversation."
      >
        <textarea name="body" required rows={tab === "message" ? 3 : 5} minLength={tab === "message" ? 2 : 20} maxLength={2000} className="input" />
      </Field>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      {state?.ok && !pending && <p role="status" className="rounded-xl bg-brand-soft p-3 text-sm text-brand">Sent.</p>}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Sending</>) : tab === "offer" ? "Send offer" : tab === "delivery" ? "Send delivery" : "Send"}</button>
    </form>
  );
}