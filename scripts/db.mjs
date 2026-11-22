// Crea las tablas, aplica las migraciones de Better Auth y, si la base está vacía,
// carga los productos y, si existe scripts/pedidos-formulario.json, las vendedoras y los pedidos del formulario.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { getMigrations } from 'better-auth/db/migration';
import { pool } from '../src/lib/db.ts';
import { auth } from '../src/lib/auth.ts';
import { orderTotals } from '../src/lib/pricing.ts';

const SOCK_COLORS = ['Negro', 'Granate', 'Marrón', 'Gris', 'Azul'];
const socks = [{ qty: 1, cents: 900 }, { qty: 2, cents: 1600 }];

const PRODUCTS = [
  {
    name: 'Fajín',
    description: 'Fajín de tela estampada. Hay más estampados: pregunta a quien te lo vende.',
    tiers: [{ qty: 1, cents: 1400 }], cost_cents: 500,
    variants: ['Flores azules', 'Flores crema', 'Geométrico rosa', 'Cachemir verde', 'Cachemir granate'],
    images: ['/products/0008.webp', '/products/0012.webp', '/products/0013.webp'],
  },
  {
    name: 'Calcetines largos',
    description: 'Calcetines altos de canalé con hilo brillante y puño rizado.',
    tiers: socks, cost_cents: 150, variants: SOCK_COLORS,
    images: ['/products/0011.webp', '/products/0005.webp', '/products/0007.webp', '/products/0009.webp', '/products/0004.webp'],
  },
  {
    name: 'Calcetines cortos',
    description: 'Los mismos calcetines brillantes, en corto.',
    tiers: socks, cost_cents: 150, variants: SOCK_COLORS,
    images: ['/products/0014.webp', '/products/0010.webp', '/products/0006.webp'],
  },
  {
    name: 'Pack chico (3 pares)',
    description: 'Tres pares de calcetines de chico con dibujos.',
    tiers: [{ qty: 1, cents: 2500 }], cost_cents: 600, variants: [],
    images: ['/products/0001.webp', '/products/0002.webp', '/products/0003.webp'],
  },
];

// Vendedoras y pedidos del formulario de Google: datos personales, fuera del repo.
// { sellers: [nombre], orders: [{ date, email, name, phone, seller, lines: [[producto, variante, cantidad]], notes }] }
const LEGACY_FILE = new URL('./pedidos-formulario.json', import.meta.url);
const legacy = existsSync(LEGACY_FILE) ? JSON.parse(await readFile(LEGACY_FILE, 'utf8')) : { sellers: [], orders: [] };

await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
const { runMigrations } = await getMigrations(auth.options);
await runMigrations();

if (process.env.ADMIN_EMAIL) {
  await pool.query(
    `insert into people (name, email, role) values ($1, lower($2), 'admin')
     on conflict (email) do update set role = 'admin', active = true`,
    [process.env.ADMIN_NAME || 'Admin', process.env.ADMIN_EMAIL],
  );
}

const { rows: [{ n }] } = await pool.query('select count(*)::int n from products');
if (n === 0) {
  const c = await pool.connect();
  try {
    await c.query('begin');
    const products = [];
    for (const [i, p] of PRODUCTS.entries()) {
      const { rows: [row] } = await c.query(
        `insert into products (name, description, tiers, cost_cents, variants, images, position)
         values ($1, $2, $3, $4, $5, $6, $7) returning id, tiers, cost_cents`,
        [p.name, p.description, JSON.stringify(p.tiers), p.cost_cents, p.variants, p.images, i],
      );
      products.push(row);
    }
    const sellers = {};
    for (const name of legacy.sellers) {
      sellers[name] = (await c.query('insert into people (name) values ($1) returning id', [name])).rows[0].id;
    }
    const byName = Object.fromEntries(PRODUCTS.map((p, i) => [p.name, products[i].id]));
    for (const { date, email, name, phone, seller, lines, notes } of legacy.orders) {
      const items = lines.map(([product, variant, qty]) => ({ product_id: byName[product], variant, qty }));
      if (items.some((it) => !it.product_id)) throw new Error(`Producto desconocido en el pedido de ${name}`);
      const { total, cost } = orderTotals(products, items);
      const { rows: [o] } = await c.query(
        `insert into orders (seller_id, buyer_name, buyer_email, buyer_phone, notes, total_cents, cost_cents, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8::timestamp at time zone 'Europe/Madrid') returning id`,
        [sellers[seller], name, email, phone, notes ?? null, total, cost, date],
      );
      for (const it of items) {
        await c.query('insert into order_items (order_id, product_id, variant, qty) values ($1, $2, $3, $4)', [o.id, it.product_id, it.variant, it.qty]);
      }
    }
    await c.query(`insert into settings (key, value) values ('bizum', '') on conflict do nothing`);
    await c.query('commit');
    console.log(`Cargados ${PRODUCTS.length} productos, ${legacy.sellers.length} vendedoras y ${legacy.orders.length} pedidos.`);
  } catch (e) {
    await c.query('rollback');
    throw e;
  } finally {
    c.release();
  }
} else {
  console.log('La base ya tenía datos: no se ha vuelto a cargar nada.');
}
await pool.end();
