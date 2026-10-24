import PostEditor from '@/components/blog/admin/PostEditor';
import { requireAdminPage } from '@/lib/blog-admin';

export const metadata = { title: 'New article' };
export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  await requireAdminPage();
  return <PostEditor initial={null} />;
}
