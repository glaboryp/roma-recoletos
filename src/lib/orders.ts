import { q } from './db.ts';

export type OrderRow = {
  id: string; seller_id: number; seller_name: string; buyer_name: string; buyer_email: string | null;
  buyer_phone: string | null; notes: string | null; total_cents: number; cost_cents: number; paid: boolean; delivered: boolean;
  created_at: Date; items: { product: string; variant: string | null; qty: number }[];
};

export const listOrders = (where = '', params: unknown[] = []) =>
  q<OrderRow>(
    `select o.*, p.name seller_name,
       coalesce(json_agg(json_build_object('product', pr.name, 'variant', i.variant, 'qty', i.qty) order by i.id)
         filter (where i.id is not null), '[]') items
     from orders o
     join people p on p.id = o.seller_id
     left join order_items i on i.order_id = o.id
     left join products pr on pr.id = i.product_id
     ${where}
     group by o.id, p.name
     order by o.created_at desc`,
    params,
  );

export const describe = (items: OrderRow['items']) =>
  items.map((i) => `${i.qty} × ${i.product}${i.variant ? ` ${i.variant.toLowerCase()}` : ''}`).join(', ');

export const shortDate = (d: Date) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' }).format(d);

export const isUuid = (s: string | undefined) => !!s && /^[0-9a-f-]{36}$/i.test(s);
