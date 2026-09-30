export default function ProductLogo({ product, size = 56 }) {
  const style = { width: size, height: size };
  if (product.logoUrl) {
    return <img src={product.logoUrl} alt="" style={style} className="shrink-0 rounded-xl border border-line bg-white object-cover" />;
  }
  return (
    <div
      style={{ ...style, fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-xl bg-peacock-soft font-display font-bold text-peacock"
    >
      {product.name[0]?.toUpperCase()}
    </div>
  );
}
