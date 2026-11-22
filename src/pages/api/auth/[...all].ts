import type { APIRoute } from 'astro';
import { auth } from '../../../lib/auth.ts';

export const ALL: APIRoute = (ctx) => auth.handler(ctx.request);
