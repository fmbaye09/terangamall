export type RouteView =
  | 'home'
  | 'shop'
  | 'product'
  | 'flocage'
  | 'flocage-seul'
  | 'flocage-lot'
  | 'cart'
  | 'checkout'
  | 'account'
  | 'order-tracking'
  | 'admin';

export type PaymentMethodType = 'WAVE' | 'ORANGE_MONEY' | 'CARD' | 'CASH_ON_DELIVERY' | 'PAYDUNYA';

export type PaymentStatusType =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderStatusType =
  | 'CONFIRMED'
  | 'PAID'
  | 'RECEIVING_GARMENT'
  | 'DESIGN_VALIDATED'
  | 'FLOCAGE_IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ProductVariantItem {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  price: number;
  oldPrice?: number;
  stock: number;
  image?: string;
  active: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface TieredDiscount {
  minQty: number;
  discountPct: number;
}

export interface ProductReview {
  id: string;
  author: string;
  role: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  price: number; // FCFA
  oldPrice?: number; // FCFA
  stock: number;
  sku: string;
  category: string;
  categorySlug: string;
  brand: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  variants?: ProductVariantItem[];
  tieredDiscounts?: TieredDiscount[];
  weightKg?: number;
  badge?: 'New' | 'Bestseller' | 'Promo';
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  flocageEligible?: boolean;
  rating: number;
  reviewCount: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK' | 'DRAFT';
  reviews: ProductReview[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  productCount: number;
  image: string;
  accentColor: string;
}

export interface FlocagePricingConfig {
  namePrice: number;        // ex: 2000 FCFA
  numberPrice: number;      // ex: 1500 FCFA
  logoPrice: number;        // ex: 2000 FCFA
  sponsorPrice: number;     // ex: 2500 FCFA
  pickupDeliveryFee: number;// ex: 2000 FCFA
  positionPrices: {
    dos: number;
    poitrine: number;
    manche: number;
    autre: number;
  };
  volumeDiscounts: {
    tier1to4: number;       // 0%
    tier5to9: number;       // 5%
    tier10to19: number;     // 10%
    tier20to49: number;     // 15%
    quoteMinQty: number;    // 50
  };
  availableFonts: string[];
  availableColors: { name: string; hex: string }[];
  availablePositions: string[];
}

export interface PlayerCustomizationRow {
  id: string;
  name: string;
  number: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  font: string;
  error?: string;
}

export interface FlocageConfiguration {
  id: string;
  mode: 'SEUL' | 'LOT';
  garmentType: 'Maillot' | 'T-shirt' | 'Autre';
  // For SEUL mode:
  customName?: string;
  customNumber?: string;
  fontStyle: string;
  textColor: string;
  textColorHex: string;
  position: 'Dos' | 'Poitrine' | 'Manche' | 'Autre';
  hasLogo: boolean;
  logoDataUrl?: string;
  logoName?: string;
  hasSponsor?: boolean;
  sponsorDataUrl?: string;
  sponsorName?: string;
  logoPosition?: 'Poitrine' | 'Manche' | 'Dos' | 'Autre';
  depositMode: 'DEPOT_ATELIER' | 'RECUPERATION_LIVRAISON';
  quantity: number;
  // For LOT mode:
  players?: PlayerCustomizationRow[];
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  type: 'PRODUCT' | 'FLOCAGE';
  product?: Product;
  selectedSize?: string;
  selectedColor?: string;
  selectedImage?: string;
  selectedSku?: string;
  flocageConfig?: FlocageConfiguration;
  quantity: number;
  unitPrice: number;
  oldUnitPrice?: number;
  savedForLater?: boolean;
}

export interface CustomerAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  instructions?: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    region: string;
    instructions?: string;
  };
  deliveryMethod: 'LIVRAISON_DOMICILE' | 'RETRAIT_ATELIER';
  carrier?: string;
  trackingNumber?: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatusType;
  paymentReference: string;
  paydunyaToken?: string;
  paydunyaReceiptUrl?: string;
  webhookConfirmedAt?: string;
  orderStatus: OrderStatusType;
  isFlocageOrder: boolean;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  createdAt: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPct: number;
  active: boolean;
  minSpend?: number;
  expiresAt: string;
  usageCount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  isVip?: boolean;
}

export interface QuoteRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  quantity: number;
  garmentType: string;
  message: string;
  logoName?: string;
  excelFileName?: string;
  status: 'EN_ATTENTE' | 'ETUDE_EN_COURS' | 'DEVIS_ENVOYE' | 'VALIDE';
  createdAt: string;
}

/**
 * Normalise les catégories et slugs pour garantir que les filtres
 * fonctionnent parfaitement avec ou sans accents, majuscules et variantes d'écriture.
 */
export function normalizeCategorySlug(val?: string): string {
  if (!val || val === 'all') return 'all';
  const clean = val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (
    clean.includes('electr') ||
    clean.includes('tech') ||
    clean.includes('phone') ||
    clean.includes('audio') ||
    clean.includes('watch') ||
    clean.includes('gadget')
  ) {
    return 'electronique';
  }
  if (clean.includes('maison') || clean.includes('electrom') || clean.includes('cuisin')) {
    return 'maison';
  }
  if (clean.includes('mode') || clean.includes('habit') || clean.includes('vetement') || clean.includes('textile')) {
    return 'mode';
  }
  if (clean.includes('sport') || clean.includes('fit') || clean.includes('basket') || clean.includes('sneaker')) {
    return 'sport';
  }
  if (clean.includes('beaut') || clean.includes('sant') || clean.includes('soin')) {
    return 'beaute';
  }
  if (clean.includes('auto') || clean.includes('brico') || clean.includes('energ') || clean.includes('solair')) {
    return 'auto';
  }
  if (clean.includes('floc') || clean.includes('personnalis')) {
    return 'flocage';
  }
  return clean.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export * from '../utils/variantHelpers';
