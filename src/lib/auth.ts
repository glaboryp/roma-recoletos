import { betterAuth } from 'better-auth';
import { pool, one } from './db.ts';

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      prompt: 'select_account',
    },
  },
  onAPIError: { errorURL: '/entrar' },
  databaseHooks: {
    user: {
      create: {
        // Only emails an admin registered in `people` may create an account.
        before: async (user) => {
          const known = await one('select 1 from people where email = lower($1) and active', [user.email]);
          return known ? { data: user } : false;
        },
      },
    },
  },
});
