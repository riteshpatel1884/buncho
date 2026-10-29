import Link from 'next/link';
import PostEditor from '@/components/blog/admin/PostEditor';
import { requireAdminPage } from '@/lib/blog-admin';
import { getTopicNotes } from '@/lib/notes';
import { categoriesFor } from '@/lib/blog-constants';

export const metadata = { title: 'New article' };
export const dynamic = 'force-dynamic';

const CHOICES = [
  {
    type: 'blog',
    icon: '✎',
    title: 'Blog article',
    text: 'Long-form writing for readers and search: guides, explainers and opinion.',
    points: ['Rich text with headings, images and tables', 'FAQ blocks and practice questions', 'Full SEO checklist'],
  },
  {
    type: 'coding',
    icon: '</>',
    title: 'Coding notes',
    text: 'Code-first notes for Python, SQL and more, built for snippets and quick reference.',
    points: ['File names, line numbers and highlighted lines', 'Output and terminal blocks', 'Templates, outline and focus mode'],
  },
];

/* The chooser is plain server-rendered links, so it costs no JavaScript. The editor only loads once a type is picked. */
export default async function NewPostPage({ searchParams }) {
  await requireAdminPage();
  const { type, category } = await searchParams;
  if (type === 'blog' || type === 'coding') {
    const coding = type === 'coding';
    const topicNotes = coding ? await getTopicNotes() : {};
    // ?category=python-notes opens the editor already inside that topic folder ("Add another note")
    const preset = coding && categoriesFor('CODING').some((c) => c.slug === category) ? category : '';
    return <PostEditor initial={null} kind={coding ? 'CODING' : 'BLOG'} newCategory={preset} topicNotes={topicNotes} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/admin/blog" className="text-sm text-muted hover:text-ink">← All articles</Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">What are you writing?</h1>
      <p className="mt-2 text-muted">Pick a type. The editor and its tools adapt to it.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CHOICES.map((c) => (
          <Link key={c.type} href={`/admin/blog/new?type=${c.type}`} prefetch={false} className="group flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent hover:bg-accent-soft/40">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-accent-soft font-mono text-lg font-bold text-accent" aria-hidden="true">{c.icon}</span>
            <h2 className="mt-4 text-xl font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{c.text}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {c.points.map((x) => <li key={x} className="flex gap-2"><span className="text-accent" aria-hidden="true">✓</span>{x}</li>)}
            </ul>
            <span className="mt-6 text-sm font-semibold text-accent group-hover:underline">Start writing →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}