import nodemailer from 'nodemailer';
import { euros } from './pricing.ts';

type NewOrder = {
  seller: { name: string; email: string | null };
  buyer: { name: string; phone: string };
  notes: string | null;
  total: number;
  items: { product: string; variant: string | null; qty: number }[];
  panelUrl: string;
};

export function sellerNotice(o: NewOrder) {
  const lines = o.items.map((i) => `· ${i.qty} × ${i.product}${i.variant ? ` (${i.variant})` : ''}`);
  return {
    subject: `Nuevo pedido de ${o.buyer.name} · ${euros(o.total)}`,
    text: [
      `¡Hola, ${o.seller.name.split(' ')[0]}!`,
      '',
      `${o.buyer.name} ha hecho un pedido de tu parte:`,
      '',
      ...lines,
      '',
      `Total: ${euros(o.total)}`,
      `Móvil: ${o.buyer.phone}`,
      ...(o.notes ? [`Comentario: ${o.notes}`] : []),
      '',
      `Lo tienes en tus ventas: ${o.panelUrl}`,
      '',
      '¡Rumbo a Roma!',
    ].join('\n'),
  };
}

export function soldOutNotice(items: { product: string; variant: string }[], adminUrl: string) {
  const names = items.map((i) => `${i.product} (${i.variant})`);
  return {
    subject: `Agotado: ${names.join(', ')}`,
    text: [
      'Se acaba de agotar:',
      '',
      ...names.map((n) => `· ${n}`),
      '',
      `En la tienda ya sale como «No disponible». Si llegan más, cambia las existencias en ${adminUrl}`,
    ].join('\n'),
  };
}

// Sends through the Recoletos Gmail account; without credentials (local dev) it does nothing.
async function send(to: string[], mail: { subject: string; text: string }, what: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  if (!user || !pass || !to.length) return;
  try {
    const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass }, connectionTimeout: 8000 });
    await transport.sendMail({ from: `"¡Rumbo a Roma!" <${user}>`, to, ...mail });
  } catch (e) {
    // A failed notice must never lose the order, which is already saved.
    console.error(`No se pudo enviar ${what}`, e);
  }
}

export const notifySeller = (o: NewOrder) =>
  send(o.seller.email ? [o.seller.email] : [], sellerNotice(o), 'el aviso a la vendedora');

export const notifySoldOut = (to: string[], items: { product: string; variant: string }[], adminUrl: string) =>
  send(to, soldOutNotice(items, adminUrl), 'el aviso de agotado');
