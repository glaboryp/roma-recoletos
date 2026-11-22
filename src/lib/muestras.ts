import type { ImageMetadata } from 'astro';

const files = import.meta.glob<ImageMetadata>('../assets/muestras/*.webp', { eager: true, import: 'default' });

export const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, '-');

const bySlug = Object.fromEntries(Object.entries(files).map(([path, img]) => [path.split('/').pop()!.replace('.webp', ''), img.src]));

// Variants without their own close-up fall back to the product's first photo.
export const specimen = (variant: string | null, fallback: string) => (variant && bySlug[slug(variant)]) || fallback;

export const allSpecimens = Object.entries(bySlug).map(([name, src]) => ({ name, src }));
