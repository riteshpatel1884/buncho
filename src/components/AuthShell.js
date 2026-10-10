import Logo from "./Logo";

export default function AuthShell({ title, blurb, children }) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="hidden flex-col justify-between gap-10 bg-navy p-10 text-white lg:flex">
        <Logo />
        <div>
          <h2 className="font-display text-4xl leading-[1.08]">{title}</h2>
          <p className="mt-3 text-on-navy">{blurb}</p>
        </div>
        <ul className="space-y-2 text-sm text-on-navy">
          <li className="flex gap-2"><span className="text-brand">✓</span>Seniors and professionals who have done it</li>
          <li className="flex gap-2"><span className="text-brand">✓</span>Checked by Buncho, not just self-declared</li>
          <li className="flex gap-2"><span className="text-brand">✓</span>Book a session in a minute</li>
        </ul>
      </div>
      <div className="flex items-center justify-center p-3 sm:p-10">{children}</div>
    </div>
  );
}