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

// Sends through the Recoletos Gmail account; without credentials (local dev) it does nothing.
export async function notifySeller(o: NewOrder) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  if (!user || !pass || !o.seller.email) return;
  try {
    const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass }, connectionTimeout: 8000 });
    await transport.sendMail({ from: `"¡Rumbo a Roma!" <${user}>`, to: o.seller.email, ...sellerNotice(o) });
  } catch (e) {
    // A failed notice must never lose the order, which is already saved.
    console.error('No se pudo enviar el aviso a la vendedora', e);
  }
}
