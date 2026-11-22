import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth.ts';
import { one, type Person } from './lib/db.ts';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname;
  ctx.locals.person = null;
  if (path.startsWith('/panel') || path.startsWith('/admin') || path === '/entrar') {
    const session = await auth.api.getSession({ headers: ctx.request.headers });
    if (session) {
      ctx.locals.person = (await one<Person>('select * from people where email = lower($1) and active', [session.user.email])) ?? null;
    }
    const person = ctx.locals.person;
    if (path.startsWith('/panel') && !person) return ctx.redirect('/entrar');
    if (path.startsWith('/admin') && person?.role !== 'admin') return ctx.redirect(person ? '/panel' : '/entrar');
  }
  return next();
});
