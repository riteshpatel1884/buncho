import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrCreateUser } from '@/lib/user';
import JobForm from '@/components/jobs/JobForm';

export const metadata = { title: 'Add a role' };

export default async function NewJobPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <Link href="/jobs" className="text-sm text-muted hover:text-ink">← Job preparation</Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Add a role</h1>
      <p className="mt-2 text-sm text-muted">
        We look for AI and ML skills in the text and match them to questions already in the bank. Skills the bank cannot test yet are shown as gaps, not padded with unrelated questions.
      </p>
      <div className="mt-6"><JobForm /></div>
    </div>
  );
}