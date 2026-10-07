import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import Avatar from "@/components/Avatar";
import SubmitButton from "@/components/SubmitButton";
import StatusBadge from "@/components/StatusBadge";
import { setExpertStatus, toggleVerification } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | buncho" };

const TABS = [["PENDING", "To review"], ["ACTIVE", "Live"], ["SUSPENDED", "Suspended"]];

export default async function Admin({ searchParams }) {
  if (!(await isAdmin())) notFound();
  const { status: raw } = await searchParams;
  const status = TABS.some(([s]) => s === raw) ? raw : "PENDING";

  const [experts, grouped, students, bookings] = await Promise.all([
    prisma.expertProfile.findMany({
      where: { status },
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      include: { user: { select: { name: true, email: true, avatarUrl: true } }, _count: { select: { services: true, bookings: true } } },
    }),
    prisma.expertProfile.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.booking.count(),
  ]);
  const count = (s) => grouped.find((g) => g.status === s)?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Admin</h1>
        <p className="mt-1 text-muted">Check each expert's LinkedIn, education and employment before approving. {students} students, {bookings} bookings so far.</p>
      </div>

      <div className="no-scrollbar flex w-full max-w-full overflow-x-auto rounded-full border border-line bg-surface p-1 text-sm font-medium sm:w-fit">
        {TABS.map(([s, label]) => (
          <Link key={s} href={`/admin?status=${s}`} className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 sm:px-4 ${status === s ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}>
            {label} ({count(s)})
          </Link>
        ))}
      </div>

      {experts.length === 0 ? (
        <div className="card border-dashed p-10 text-center text-muted">Nothing in this list.</div>
      ) : (
        <ul className="space-y-4">
          {experts.map((e) => (
            <li key={e.id} className="card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Avatar name={e.user.name} src={e.user.avatarUrl} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/experts/${e.slug}`} className="font-display text-xl font-bold hover:underline">{e.user.name}</Link>
                    <StatusBadge status={e.status === "PENDING" ? "REVIEW" : e.status} />
                  </div>
                  <p className="text-sm text-muted">{e.user.email}</p>
                  <p className="mt-2 text-sm">{e.jobTitle} at {e.company}, {e.experienceYears} yrs</p>
                  <p className="text-sm text-muted">{e.college}, {e.branch}, class of {e.graduationYear}</p>
                  <p className="mt-2 whitespace-pre-line break-words text-sm">{e.bio}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <a href={e.linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">LinkedIn</a>
                    {e.githubUrl && <a href={e.githubUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">GitHub</a>}
                    <span className="text-muted">{e._count.services} services, {e._count.bookings} bookings</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                {["educationVerified", "employmentVerified"].map((field) => (
                  <form key={field} action={toggleVerification}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="field" value={field} />
                    <SubmitButton className={e[field] ? "btn-primary" : "btn-outline"} pendingText="Saving">
                      {e[field] ? "✓ " : ""}{field === "educationVerified" ? "Education verified" : "Employment verified"}
                    </SubmitButton>
                  </form>
                ))}
                <form action={setExpertStatus} className="ml-auto flex gap-2">
                  <input type="hidden" name="id" value={e.id} />
                  {e.status !== "ACTIVE" && <SubmitButton name="status" value="ACTIVE" className="btn-primary" pendingText="Approving">Approve</SubmitButton>}
                  {e.status !== "SUSPENDED" && <SubmitButton name="status" value="SUSPENDED" className="btn-outline" pendingText="Saving">Suspend</SubmitButton>}
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
