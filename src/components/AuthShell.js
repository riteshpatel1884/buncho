export default function AuthShell({ title, blurb, children }) {
  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-2">
      <div
        className="hidden flex-col justify-between bg-navy p-10 text-white lg:flex"
        style={{ backgroundImage: "radial-gradient(circle at 90% 5%, rgba(52,214,123,0.22), transparent 45%)" }}
      >
        <p className="font-display text-xl font-bold">buncho<span className="text-brand">.</span></p>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">{title}</h2>
          <p className="mt-3 text-on-navy">{blurb}</p>
        </div>
        <ul className="space-y-2 text-sm text-on-navy">
          <li>Upvote products you like</li>
          <li>Launch your own in a few minutes</li>
          <li>See who visits and clicks</li>
        </ul>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">{children}</div>
    </div>
  );
}