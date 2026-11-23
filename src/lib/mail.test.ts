import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sellerNotice, soldOutNotice } from './mail.ts';

test('seller notice lists the order and how to reach the buyer', () => {
  const { subject, text } = sellerNotice({
    seller: { name: 'Ana Zarzalejos', email: 'ana@gmail.com' },
    buyer: { name: 'Blanca Pérez', phone: '600111222' },
    notes: 'El segundo por la izquierda',
    total: 3000,
    items: [{ product: 'Calcetines largos', variant: 'Granate', qty: 2 }, { product: 'Fajín', variant: null, qty: 1 }],
    panelUrl: 'https://roma-recoletos.vercel.app/panel',
  });
  assert.equal(subject, 'Nuevo pedido de Blanca Pérez · 30 €');
  for (const part of ['¡Hola, Ana!', '2 × Calcetines largos (Granate)', '1 × Fajín\n', 'Móvil: 600111222', 'Comentario: El segundo', '/panel']) {
    assert.ok(text.includes(part), part);
  }
});

test('sold-out notice names each variant and where to restock', () => {
  const { subject, text } = soldOutNotice([{ product: 'Fajín', variant: 'Flores azules' }], 'https://x/admin/productos');
  assert.equal(subject, 'Agotado: Fajín (Flores azules)');
  assert.ok(text.includes('· Fajín (Flores azules)'));
  assert.ok(text.includes('https://x/admin/productos'));
});
