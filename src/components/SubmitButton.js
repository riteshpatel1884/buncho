"use client";
import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";

// Use inside a <form>. Shows a spinner on the clicked button and disables the form's buttons while pending.
export default function SubmitButton({ children, pendingText = "Working", className, name, value }) {
  const { pending, data } = useFormStatus();
  const active = pending && (!name || data?.get(name) === value);
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={className}>
      {active ? (<><Spinner />{pendingText}</>) : children}
    </button>
  );
}
