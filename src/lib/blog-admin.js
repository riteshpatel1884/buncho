import { notFound } from 'next/navigation';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';

/** For admin pages: anyone who is not an admin gets a 404, so the area does not reveal that it exists. */
export async function requireAdminPage() {
  const user = await getOrCreateUser();
  if (!isAdmin(user)) notFound();
  return user;
}
