export type Tier = { qty: number; cents: number };
export type PricedProduct = { id: number; tiers: Tier[]; cost_cents: number };
export type Line = { product_id: number; variant: string | null; qty: number };

export function priceFor(tiers: Tier[], qty: number): number {
  const best = [0];
  for (let n = 1; n <= qty; n++) {
    best[n] = Infinity;
    for (const t of tiers) if (t.qty <= n) best[n] = Math.min(best[n], best[n - t.qty] + t.cents);
  }
  return best[qty];
}

export function orderTotals(products: PricedProduct[], lines: Line[]) {
  let total = 0;
  let cost = 0;
  for (const p of products) {
    const qty = lines.filter((l) => l.product_id === p.id).reduce((s, l) => s + l.qty, 0);
    if (!qty) continue;
    total += priceFor(p.tiers, qty);
    cost += p.cost_cents * qty;
  }
  return { total, cost };
}

export function parseTiers(text: string): Tier[] | null {
  const tiers = [...text.matchAll(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d{1,2})?)/gi)].map((m) => ({
    qty: Number(m[1]),
    cents: Math.round(Number(m[2].replace(',', '.')) * 100),
  }));
  if (!tiers.some((t) => t.qty === 1) || tiers.some((t) => t.qty < 1)) return null;
  return tiers.sort((a, b) => a.qty - b.qty);
}

export const euros = (cents: number) =>
  (cents / 100).toLocaleString('es-ES', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';

export const formatTiers = (tiers: Tier[]) =>
  tiers.length === 1 ? euros(tiers[0].cents) : tiers.map((t) => `${t.qty} × ${euros(t.cents)}`).join(' · ');

export const parseEuros = (text: string) => {
  const n = Number(String(text).trim().replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};
