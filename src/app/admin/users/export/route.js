import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { buildWhere, loadUsers, parseUserParams, planOf } from '@/lib/admin-users';

export const dynamic = 'force-dynamic';

const MAX_ROWS = 5000;

// Quote every cell. Names and emails come from users, so a value that starts with = + - or @ is
// prefixed with an apostrophe, which stops Excel or Sheets from running it as a formula.
function cell(value) {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request) {
  const me = await getOrCreateUser();
  if (!isAdmin(me)) return new Response('Not found', { status: 404 });

  const params = parseUserParams(Object.fromEntries(new URL(request.url).searchParams));
  const now = new Date();
  const rows = await loadUsers({ where: buildWhere(params, now), sort: params.sort, take: MAX_ROWS });

  const header = ['Name', 'Email', 'Joined (ISO)', 'Plan', 'Pro until (ISO)', 'Problems solved', 'Problems tried', 'Last active (ISO)', 'Paid orders', 'Total paid (INR)', 'Roles', 'Mock attempts'];
  const lines = [header.map(cell).join(',')];
  for (const u of rows) {
    lines.push(
      [
        u.name ?? '',
        u.email ?? '',
        u.joinedAt.toISOString(),
        planOf(u.proUntil, now),
        u.proUntil ? u.proUntil.toISOString() : '',
        u.solved,
        u.attempted,
        u.lastActive ? u.lastActive.toISOString() : '',
        u.paidOrders,
        (u.paidPaise / 100).toFixed(2),
        u.roles,
        u.mocks,
      ]
        .map(cell)
        .join(','),
    );
  }

  const day = now.toISOString().slice(0, 10);
  return new Response(`\uFEFF${lines.join('\r\n')}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="buncho-users-${day}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}