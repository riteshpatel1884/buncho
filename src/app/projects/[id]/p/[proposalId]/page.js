import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/user";
import { inr, fmtDateTime } from "@/lib/constants";
import { budgetLabel, days, feeSplit, THREAD_OPEN } from "@/lib/projects";
import { dodo } from "@/lib/dodo";
import { applyProjectPayment } from "@/lib/projectPayment";
import { acceptOffer, cancelProposal, startProjectPayment, confirmCompletion } from "@/app/projects/actions";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/admin/feed/DeleteButton";
import ReportButton from "@/components/ReportButton";
import { ProposalStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ThreadComposer } from "@/components/projects/ThreadForms";
import ChatPopup from "@/components/projects/ChatPopup";

export const dynamic = "force-dynamic";
export const metadata = { title: "Conversation | buncho" };

const Warning = () => (
  <div role="note" className="flex gap-2.5 rounded-xl bg-warn-soft p-3.5 text-xs font-medium leading-relaxed text-warn">
    <span aria-hidden="true">⚠️</span>
    <p>
      Buncho monitors every conversation. Do not share phone numbers, emails, links, social handles or payment details.
      If personal information is found, your account will be suspended.
    </p>
  </div>
);

export default async function ThreadPage({ params, searchParams }) {
  const { id, proposalId } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/projects/${id}/p/${proposalId}`);
  const admin = await isAdmin();

  // Back from checkout: confirm the payment with Dodo and save it. This works even when the
  // webhook can't reach the server (for example on localhost). It is safe to run twice.
  const paymentId = typeof sp.payment_id === "string" ? sp.payment_id : null;
  if (paymentId) {
    try {
      const payment = await dodo.payments.retrieve(paymentId);
      if (payment.metadata?.proposalId === proposalId) {
        const res = await applyProjectPayment(payment);
        console.log("[project payment] return sync", paymentId, res);
      } else {
        console.error("[project payment] payment does not belong to this proposal", paymentId);
      }
    } catch (e) {
      console.error("[project payment] return sync failed:", e?.message);
    }
  }

  const proposal = await prisma.projectProposal.findFirst({
    where: { id: proposalId, projectId: id },
    include: {
      project: { include: { student: { select: { name: true, username: true } } } },
      expert: { select: { userId: true, user: { select: { name: true, username: true } } } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!proposal) notFound();

  const { project, expert } = proposal;
  const isExpert = expert.userId === user.id;
  const isStudent = project.studentId === user.id;
  if (!isExpert && !isStudent && !admin) notFound();

  // Messages reach the other person as soon as they are sent. The student sees the thread
  // once the expert has sent the first message.
  const expertHasWritten = proposal.messages.some((m) => m.authorId === expert.userId);
  if (isStudent && !expertHasWritten) notFound();
  const messages = proposal.messages;
  const latestOffer = [...messages].reverse().find((m) => m.kind === "OFFER") ?? null;

  const party = isStudent || isExpert;
  const status = proposal.status;
  const canAccept = party && status === "ACTIVE" && project.status === "OPEN" && latestOffer && latestOffer.authorId !== user.id;
  const canPay = isStudent && status === "AGREED" && proposal.paymentStatus === "UNPAID";
  const canCancel = party && ["ACTIVE", "AGREED"].includes(status) && proposal.paymentStatus === "UNPAID";
  const canComplete = isStudent && status === "DELIVERED";
  const canOffer = status === "ACTIVE" && project.status === "OPEN";
  const canDeliver = isExpert && ["IN_PROGRESS", "DELIVERED"].includes(status);
  const canMessage = party && THREAD_OPEN.includes(status);

  const studentPerson = { name: project.student.name, username: project.student.username };
  const expertPerson = { name: expert.user.name, username: expert.user.username };
  const otherPerson = isStudent ? expertPerson : studentPerson;
  const authorOf = (m) => (m.authorId === expert.userId ? expertPerson : studentPerson);
  const handle = (p) => (p.username ? `@${p.username}` : "");
  const lastMessage = messages[messages.length - 1] ?? null;

  const payout = proposal.agreedPriceInr ? (proposal.payoutInr ?? feeSplit(proposal.agreedPriceInr).payoutInr) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/projects/${project.id}`} className="text-sm font-medium text-muted hover:text-ink">Back to project</Link>

      {sp.paid && status !== "IN_PROGRESS" && <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">Payment received. It can take a minute to show here. Refresh if it hasn't.</p>}
      {sp.error === "checkout" && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">We couldn't open the payment page. Please try again.</p>}

      <header className="card space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl">{project.title}</h1>
            <p className="text-sm text-muted">
              Student: {project.student.name || "A student"} {handle(studentPerson)} · Expert: {expert.user.name} {handle(expertPerson)} · Budget {budgetLabel(project)}
            </p>
          </div>
          <ProposalStatusBadge status={status} />
        </div>

        {proposal.agreedPriceInr && (
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-xs text-muted">Agreed terms</p>
            <p className="font-display text-3xl">{inr(proposal.agreedPriceInr)} <span className="text-base font-normal text-muted">in {days(proposal.agreedDays)}</span></p>
            <p className="mt-2 whitespace-pre-line break-words text-sm">{proposal.agreedScope}</p>
            {isExpert && <p className="mt-2 text-xs text-muted">You receive {inr(payout)} after Buncho's fee. Changing the price needs a new offer that both of you accept.</p>}
          </div>
        )}

        {canPay && (
          <form action={startProjectPayment} className="space-y-2 border-t border-line pt-4">
            <input type="hidden" name="proposalId" value={proposal.id} />
            <SubmitButton className="btn-primary" pendingText="Opening payment">Pay {inr(proposal.agreedPriceInr)}</SubmitButton>
            <p className="text-xs text-muted">You pay securely on the next page. Buncho releases the money to the expert only after you confirm the work is done.</p>
          </form>
        )}
        {status === "AGREED" && isExpert && <p className="border-t border-line pt-4 text-sm text-muted">Waiting for the student to pay. You'll get an email when you can start.</p>}
        {status === "IN_PROGRESS" && isStudent && <p className="border-t border-line pt-4 text-sm text-muted">Paid. {expert.user.name} is working on it. You'll be told when they deliver.</p>}
        {canComplete && (
          <form action={confirmCompletion} className="space-y-2 border-t border-line pt-4">
            <input type="hidden" name="proposalId" value={proposal.id} />
            <SubmitButton className="btn-primary" pendingText="Confirming">Confirm the work is done</SubmitButton>
            <p className="text-xs text-muted">Not what you asked for? Write to the expert in the chat before you confirm.</p>
          </form>
        )}
        {proposal.paymentStatus !== "UNPAID" && (
          <p className="border-t border-line pt-4 text-xs text-muted">
            Payment: {proposal.paymentStatus === "PAID" ? "received" : proposal.paymentStatus === "REFUNDED" ? "refunded" : "refund pending, Buncho will complete it"}.
            {" "}Problem with this project? <ReportButton kind="problem" label="Report it" className="font-medium text-brand underline" />
          </p>
        )}
      </header>

      {/* Chat card: opens the conversation in a pop-up */}
      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl">
            Chat with {otherPerson.name || "the other person"} <span className="text-base font-normal text-muted">{handle(otherPerson)}</span>
          </h2>
          <p className="mt-1 truncate text-sm text-muted">
            {lastMessage ? `${lastMessage.authorId === user.id ? "You" : authorOf(lastMessage).name || "Someone"}: ${lastMessage.body}` : "No messages yet."}
          </p>
        </div>

        <ChatPopup
          label="Open chat"
          count={messages.length}
          header={
            <div className="space-y-1 text-sm">
              <p className="font-display text-lg">{project.title}</p>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span><b>{studentPerson.name || "Student"}</b> <span className="text-muted">{handle(studentPerson)}</span> <span className="chip ml-1">Student</span></span>
                <span><b>{expertPerson.name || "Expert"}</b> <span className="text-muted">{handle(expertPerson)}</span> <span className="chip ml-1">Expert</span></span>
              </p>
            </div>
          }
          footer={
            <>
              {canMessage && (
                <ThreadComposer
                  proposalId={proposal.id}
                  canOffer={canOffer}
                  canDeliver={canDeliver}
                  defaultPrice={latestOffer?.priceInr}
                  defaultDays={latestOffer?.deliveryDays}
                />
              )}
              <Warning />
            </>
          }
        >
          {/* flex-col-reverse keeps the view pinned to the newest message, like WhatsApp */}
          <ul className="flex min-h-0 flex-1 flex-col-reverse gap-2 overflow-y-auto bg-surface-2 p-4">
            {messages.length === 0 && <li className="m-auto text-sm text-muted">No messages yet.</li>}
            {[...messages].reverse().map((m) => {
              const mine = m.authorId === user.id;
              const a = authorOf(m);
              return (
                <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[75%] ${
                      mine ? "rounded-br-sm bg-brand text-on-brand" : "rounded-bl-sm border border-line bg-surface"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${mine ? "opacity-90" : "text-brand"}`}>
                      {mine ? "You" : a.name || "Someone"}
                      {a.username && <span className="ml-1 font-normal opacity-75">@{a.username}</span>}
                    </p>

                    {m.kind === "DELIVERY" && <p className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-80">Delivery</p>}
                    {m.kind === "OFFER" && (
                      <p className="mt-1 font-display text-xl">
                        {inr(m.priceInr)} <span className="text-xs font-normal opacity-80">in {days(m.deliveryDays)}</span>
                      </p>
                    )}

                    <p className="mt-1 whitespace-pre-line break-words leading-relaxed">{m.body}</p>
                    <p className="mt-1 text-right text-[11px] opacity-70">{fmtDateTime(m.createdAt)}</p>

                    {canAccept && m.id === latestOffer.id && (
                      <form action={acceptOffer} className="mt-2 border-t border-line pt-2">
                        <input type="hidden" name="proposalId" value={proposal.id} />
                        <input type="hidden" name="messageId" value={m.id} />
                        <SubmitButton className="btn-primary !py-1.5" pendingText="Accepting">Accept {inr(m.priceInr)}</SubmitButton>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </ChatPopup>
      </section>

      {canCancel && (
        <form action={cancelProposal} className="flex justify-end">
          <input type="hidden" name="proposalId" value={proposal.id} />
          <DeleteButton label={status === "AGREED" ? "Cancel agreement" : isExpert ? "Withdraw" : "Decline"} message={status === "AGREED" ? "Cancel this agreement? Nothing has been charged." : "End this conversation?"} />
        </form>
      )}
    </div>
  );
}