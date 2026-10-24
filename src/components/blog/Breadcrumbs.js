import Link from 'next/link';
import { ChevronRight } from '@/components/icons';

// items: [{ name, href? }]; the last item is the current page and is not a link
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight width={12} height={12} aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-ink hover:underline">{item.name}</Link>
            ) : (
              <span aria-current="page" className="max-w-[16rem] truncate text-ink sm:max-w-md">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
