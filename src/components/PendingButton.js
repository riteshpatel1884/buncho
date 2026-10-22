'use client';

import { useFormStatus } from 'react-dom';
import Spinner from './Spinner';

// Submit button for <form action={serverAction}>. Shows a spinner and disables itself while the action runs.
export default function PendingButton({ children, pendingLabel, className = '', ...rest }) {
  const { pending } = useFormStatus();
  return (
    <button
      {...rest}
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {pending && <Spinner size={14} />}
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}