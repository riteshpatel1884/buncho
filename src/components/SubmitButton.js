"use client";
import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";


export default function SubmitButton({ children, pendingText = "Working", className, name, value }) {
  const { pending, data } = useFormStatus();
  const active = pending && (!name || data?.get(name) === value);
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={className}>
      {active ? (<><Spinner />{pendingText}</>) : children}
    </button>
  );
}
