'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-slate-800 text-stone-100 px-4 py-2 rounded hover:bg-slate-700 transition disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
}
