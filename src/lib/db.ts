import pg from 'pg';

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

export async function q<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await pool.query(sql, params)).rows;
}

export async function one<T = any>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(sql, params))[0];
}

export async function tx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('begin');
    const r = await fn(c);
    await c.query('commit');
    return r;
  } catch (e) {
    await c.query('rollback');
    throw e;
  } finally {
    c.release();
  }
}

export type Person = { id: number; name: string; email: string | null; role: 'seller' | 'admin'; active: boolean; sells: boolean };
export type Product = {
  id: number; name: string; description: string; tiers: { qty: number; cents: number }[];
  cost_cents: number; variants: string[]; images: string[]; variant_images: Record<string, string>; position: number; active: boolean;
};

export const setting = async (key: string) => (await one<{ value: string }>('select value from settings where key = $1', [key]))?.value ?? '';
