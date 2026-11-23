create table if not exists people (
  id serial primary key,
  name text not null,
  email text unique check (email = lower(email)),
  role text not null default 'seller' check (role in ('seller', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table people add column if not exists sells boolean not null default true;

create table if not exists products (
  id serial primary key,
  name text not null,
  description text not null default '',
  tiers jsonb not null,
  cost_cents int not null default 0 check (cost_cents >= 0),
  variants text[] not null default '{}',
  images text[] not null default '{}',
  position int not null default 0,
  active boolean not null default true
);

alter table products add column if not exists variant_images jsonb not null default '{}';
-- Units left per variant name; a variant without a key has no limit.
alter table products add column if not exists variant_stock jsonb not null default '{}';

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  seller_id int not null references people(id),
  buyer_name text not null,
  buyer_email text,
  buyer_phone text,
  notes text,
  total_cents int not null,
  cost_cents int not null,
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id serial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id int not null references products(id),
  variant text,
  qty int not null check (qty > 0)
);

alter table orders add column if not exists delivered boolean not null default false;

create index if not exists orders_seller_idx on orders (seller_id);
create index if not exists order_items_order_idx on order_items (order_id);

create table if not exists settings (key text primary key, value text not null);
