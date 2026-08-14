export function inr(n: number, opts: { compact?: boolean } = {}) {
  if (opts.compact && n >= 100000) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    return `₹${(n / 100000).toFixed(2)} L`;
  }
  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
}

export function num(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function pct(n: number, digits = 0) {
  return `${n.toFixed(digits)}%`;
}
