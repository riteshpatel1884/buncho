export default function AuthShell({ title, blurb, children }) {
  return (
    <div className="card mx-auto grid max-w-4xl grid-cols-1 overflow-hidden lg:grid-cols-2">
      <div
        className="hidden flex-col justify-between bg-navy p-10 text-white lg:flex"
        style={{ backgroundImage: "radial-gradient(circle at 90% 5%, rgba(52,214,123,0.25), transparent 45%)" }}
      >
        <p className="font-display text-xl font-bold">buncho<span className="text-[#34d67b]">.</span></p>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">{title}</h2>
          <p className="mt-3 text-on-navy">{blurb}</p>
        </div>
        <ul className="space-y-2 text-sm text-on-navy">
          <li>Seniors and professionals who have done it</li>
          <li>Verified by Buncho, not just self-declared</li>
          <li>Book a session in a minute</li>
        </ul>
      </div>
      <div className="flex items-center justify-center p-3 sm:p-10">{children}</div>
    </div>
  );
}
