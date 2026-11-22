import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceFor, orderTotals, parseTiers, euros, formatTiers } from './pricing.ts';

const socks = [{ qty: 1, cents: 900 }, { qty: 2, cents: 1600 }];

test('pack pricing picks the cheapest combination', () => {
  assert.equal(priceFor(socks, 0), 0);
  assert.equal(priceFor(socks, 1), 900);
  assert.equal(priceFor(socks, 2), 1600);
  assert.equal(priceFor(socks, 3), 2500);
  assert.equal(priceFor(socks, 4), 3200);
});

test('order totals add packs across variants of one product', () => {
  const products = [
    { id: 1, tiers: socks, cost_cents: 150 },
    { id: 2, tiers: [{ qty: 1, cents: 1400 }], cost_cents: 500 },
  ];
  const r = orderTotals(products, [
    { product_id: 1, variant: 'Granate', qty: 1 },
    { product_id: 1, variant: 'Marrón', qty: 1 },
    { product_id: 2, variant: null, qty: 4 },
  ]);
  assert.deepEqual(r, { total: 1600 + 5600, cost: 300 + 2000 });
});

test('tier text parses and requires a single-unit price', () => {
  assert.deepEqual(parseTiers('2x16, 1 × 9'), [{ qty: 1, cents: 900 }, { qty: 2, cents: 1600 }]);
  assert.deepEqual(parseTiers('1x12,50'), [{ qty: 1, cents: 1250 }]);
  assert.equal(parseTiers('2x16'), null);
  assert.equal(parseTiers('nada'), null);
});

test('euros formats in Spanish', () => {
  assert.equal(euros(1600), '16 €');
  assert.equal(euros(150), '1,50 €');
});

test('tiers read like the poster', () => {
  assert.equal(formatTiers([{ qty: 1, cents: 1400 }]), '14 €');
  assert.equal(formatTiers([{ qty: 1, cents: 900 }, { qty: 2, cents: 1600 }]), '1 × 9 € · 2 × 16 €');
});
