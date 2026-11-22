# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (SSR, Vercel adapter) + Neon Postgres + Better Auth (Google) + Vercel Blob for uploaded product photos. pnpm.

## Users

- **Compradores**: familia y amigos de las universitarias. Llegan desde un enlace de WhatsApp en el móvil, eligen productos, dejan sus datos, dicen de parte de quién vienen y pagan por Bizum.
- **Vendedoras**: las universitarias del centro Recoletos que viajan. Entran con su Gmail para ver qué han vendido y cuánto les queda limpio (venta − coste).
- **Gestión/compras**: las que compran el material. Entran con su Gmail (rol admin), dan de alta vendedoras, editan productos, costes y el número de Bizum, y marcan qué pedidos ya han pagado.

## Product Purpose

Sustituir el formulario de Google con el que venden fajines y calcetines para pagar el viaje a Roma en Semana Santa 2027 (conocer al Santo Padre). Éxito: pedidos claros, total calculado con los packs, cada venta atribuida a una vendedora y control de cobros.

## Operating Context

- El Bizum va a un único número común (ajuste editable por admin).
- Las vendedoras no pagan nada a gestión; su panel muestra vendido, coste y lo que les queda.
- Sin envíos ni dirección: entrega en mano.
- Precios por cantidad: calcetines 1 × 9 €, 2 × 16 €; pack chico 3 × 25 €; fajín 14 €. Costes: fajín 5 €, calcetín 1,5 €/par, pack chico 2 €/par. Todo editable.

## Brand Commitments

El cartel "¡RUMBO A ROMA!" (UNIV.pdf): fondo crema, titular granate en palo seco condensado muy grueso, textos en azul marino, precios rotulados a mano, cierre "Con tu compra colaboras con nuestro viaje. ¡Muchas gracias por tu ayuda!" y firma "recoletos — centro universitario —".

## Evidence on Hand

14 fotos propias de los productos (`img/`), el cartel PDF y 14 pedidos del formulario de Google. No hay testimonios ni cifras: no inventarlos.

## Product Principles

1. Pedir desde el móvil en menos de un minuto.
2. El total y el número de Bizum siempre visibles y sin ambigüedad.
3. Cada venta tiene dueña.
4. Gestión edita todo sin tocar código.
