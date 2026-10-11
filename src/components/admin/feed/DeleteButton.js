"use client";
import { useFormStatus } from "react-dom";
import Spinner from "../../Spinner";

// Use inside a <form>. Asks for confirmation before the form is submitted.
export default function DeleteButton({ message = "Delete this? This can't be undone.", label = "Delete" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}
      className="btn-outline !px-3.5 !py-1.5 !text-danger hover:!border-danger"
    >
      {pending ? (<><Spinner />Deleting</>) : label}
    </button>
  );
}