import { Product, ProductVariantItem, ProductColor } from '../types';

/**
 * Finds the best matching variant from a product's variant matrix
 * based on selected size and color.
 */
export function findMatchingVariant(
  product: Product,
  selectedSize?: string,
  selectedColor?: string
): ProductVariantItem | undefined {
  if (!product.variants || product.variants.length === 0) {
    return undefined;
  }

  const normSize = (selectedSize || '').trim().toLowerCase();
  const normColor = (selectedColor || '').trim().toLowerCase();

  // 1. Exact match on both size and color
  if (normSize && normColor) {
    const exact = product.variants.find(
      (v) =>
        v.size?.trim().toLowerCase() === normSize &&
        v.color?.trim().toLowerCase() === normColor
    );
    if (exact) return exact;
  }

  // 2. If product has only 1 color or only 1 size, match by the dominant attribute
  if (normSize) {
    const bySize = product.variants.find(
      (v) => v.size?.trim().toLowerCase() === normSize
    );
    if (bySize) return bySize;
  }

  if (normColor) {
    const byColor = product.variants.find(
      (v) => v.color?.trim().toLowerCase() === normColor
    );
    if (byColor) return byColor;
  }

  // 3. Fallback to first available active variant
  return product.variants.find((v) => v.active) || product.variants[0];
}

/**
 * Returns the effective price for a variant or the base product.
 */
export function getVariantPrice(
  product: Product,
  variant?: ProductVariantItem
): number {
  if (variant && typeof variant.price === 'number' && variant.price > 0) {
    return variant.price;
  }
  return product.price;
}

/**
 * Calculates the crossed-out reference price (ancien prix) for a variant.
 * If the variant has an explicit oldPrice higher than its price, uses it.
 * Otherwise, if the base product has a discount ratio, computes the proportional oldPrice.
 */
export function getVariantOldPrice(
  product: Product,
  variant?: ProductVariantItem
): number | undefined {
  const currentPrice = getVariantPrice(product, variant);

  // 1. Explicit oldPrice on variant
  if (variant?.oldPrice && variant.oldPrice > currentPrice) {
    return variant.oldPrice;
  }

  // 2. Proportional oldPrice derived from product discount ratio
  if (product.oldPrice && product.oldPrice > product.price && product.price > 0) {
    const ratio = product.oldPrice / product.price;
    const computed = Math.round((currentPrice * ratio) / 500) * 500;
    return Math.max(computed, currentPrice + 1000);
  }

  return undefined;
}

/**
 * Computes discount percentage and monetary savings.
 */
export function calculateVariantSavings(
  price: number,
  oldPrice?: number
): {
  hasDiscount: boolean;
  discountPct: number;
  savingsAmount: number;
} {
  if (oldPrice && oldPrice > price) {
    const discountPct = Math.round(((oldPrice - price) / oldPrice) * 100);
    const savingsAmount = oldPrice - price;
    return {
      hasDiscount: true,
      discountPct,
      savingsAmount,
    };
  }
  return {
    hasDiscount: false,
    discountPct: 0,
    savingsAmount: 0,
  };
}

/**
 * Resolves the display image for a specific color or variant with fallbacks.
 */
export function getVariantImage(
  product: Product,
  selectedColor?: string,
  variant?: ProductVariantItem
): string {
  // 1. Image explicitly attached to the matched variant
  if (variant?.image) {
    return variant.image;
  }

  // 2. Image explicitly attached to the selected color
  if (selectedColor && product.colors && product.colors.length > 0) {
    const normColor = selectedColor.trim().toLowerCase();
    const colorObj = product.colors.find(
      (c) => c.name?.trim().toLowerCase() === normColor
    );
    if (colorObj?.image) {
      return colorObj.image;
    }
  }

  // 3. Image from any variant of the same color
  if (selectedColor && product.variants && product.variants.length > 0) {
    const normColor = selectedColor.trim().toLowerCase();
    const siblingVariant = product.variants.find(
      (v) => v.color?.trim().toLowerCase() === normColor && Boolean(v.image)
    );
    if (siblingVariant?.image) {
      return siblingVariant.image;
    }
  }

  // 4. Default first image from product gallery
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }

  return '/src/assets/images/marketplace_hero_banner_1791237117872.jpg';
}

/**
 * Gathers all unique images across the product gallery, colors, and variants.
 */
export function getAllVariantImages(product: Product): string[] {
  const set = new Set<string>();

  // Base gallery images
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img) set.add(img);
    });
  }

  // Color specific images
  if (Array.isArray(product.colors)) {
    product.colors.forEach((col) => {
      if (col?.image) set.add(col.image);
    });
  }

  // Variant specific images
  if (Array.isArray(product.variants)) {
    product.variants.forEach((v) => {
      if (v?.image) set.add(v.image);
    });
  }

  return Array.from(set).filter(Boolean);
}
