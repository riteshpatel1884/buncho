/** Minor units (paise or cents) to a display string: ₹99, $2.99 */
export function formatMoney(minor, currency = 'INR') {
  const n = (Number(minor) || 0) / 100;
  if (currency === 'USD') {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'INR') {
    return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  return `${currency} ${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}