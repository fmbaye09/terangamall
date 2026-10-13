/**
 * Helpers pour servir les images via Netlify Image CDN (/.netlify/images).
 * Le CDN redimensionne à la volée et négocie automatiquement le format
 * (AVIF / WebP) selon le navigateur, puis met le résultat en cache à l'edge.
 */

const RESPONSIVE_WIDTHS = [160, 320, 480, 640, 960, 1280, 1920];

// Le CDN n'est disponible que sur Netlify (build de prod ou `netlify dev`).
const CDN_ENABLED = import.meta.env.PROD;

/** Seules les images du site (chemins absolus locaux) passent par le CDN. */
function isOptimizable(src: string): boolean {
  return CDN_ENABLED && src.startsWith('/') && !src.startsWith('//') && !src.startsWith('/.netlify/');
}

export function cdnImageUrl(src: string, width: number, quality = 75): string {
  if (!isOptimizable(src)) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/** Construit un srcset limité à `maxWidth` (évite de générer des tailles inutiles). */
export function cdnSrcSet(src: string, maxWidth = 1920): string | undefined {
  if (!isOptimizable(src)) return undefined;
  const widths = RESPONSIVE_WIDTHS.filter((w) => w <= maxWidth);
  if (widths.length === 0) widths.push(maxWidth);
  return widths.map((w) => `${cdnImageUrl(src, w)} ${w}w`).join(', ');
}
