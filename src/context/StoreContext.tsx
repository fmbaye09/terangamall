import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  buildVariantsMatrix,
  INITIAL_ADDRESSES,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_FLOCAGE_PRICING,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
} from '../data/initialData';
import { getPaymentProvider } from '../services/payment';
import {
  CartItem,
  CategoryItem,
  Coupon,
  Customer,
  CustomerAddress,
  FlocageConfiguration,
  FlocagePricingConfig,
  Order,
  OrderStatusType,
  PaymentMethodType,
  PaymentStatusType,
  Product,
  ProductVariantItem,
  QuoteRequest,
  RouteView,
  findMatchingVariant,
  getVariantImage,
  getVariantOldPrice,
  getVariantPrice,
  normalizeCategorySlug,
} from '../types';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextValue {
  // Navigation
  currentView: RouteView;
  selectedProductSlug: string;
  selectedCategorySlug: string;
  selectedOrderId: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  navigateTo: (
    view: RouteView,
    options?: { productSlug?: string; categorySlug?: string; orderId?: string }
  ) => void;

  // Theme & Neumorphism
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;

  // Catalog & Variants
  products: Product[];
  categories: CategoryItem[];
  addProduct: (p: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  bulkUpdateProductsStock: (ids: string[], delta: number) => void;
  bulkUpdateProductsStatus: (ids: string[], status: Product['status']) => void;

  // Flocage Pricing (Database-driven, zero hardcoded prices in UI)
  flocagePricing: FlocagePricingConfig;
  updateFlocagePricing: (updates: Partial<FlocagePricingConfig>) => void;
  calculateVolumeDiscountPct: (qty: number) => number;

  // Cart & Wishlist
  cart: CartItem[];
  wishlistIds: string[];
  couponCode: string;
  discountPct: number;
  applyCoupon: (code: string) => boolean;
  addToCartProduct: (product: Product, size: string, color: string, quantity?: number) => void;
  addToCartFlocage: (config: FlocageConfiguration) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeCartItem: (itemId: string) => void;
  toggleSaveForLater: (itemId: string) => void;
  toggleWishlist: (productId: string) => void;
  clearCart: () => void;

  // Orders, Fulfillment & Webhooks
  orders: Order[];
  createOrderWithPayment: (input: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    street: string;
    city: string;
    region: string;
    instructions?: string;
    deliveryMethod: 'LIVRAISON_DOMICILE' | 'RETRAIT_ATELIER';
    paymentMethod: PaymentMethodType;
  }) => Promise<Order>;
  confirmOrderPaymentWebhook: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatusType) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatusType) => void;
  updateOrderTracking: (
    orderId: string,
    trackingNumber: string,
    carrier: string,
    notes?: string
  ) => void;

  // Marketing & Coupons
  coupons: Coupon[];
  addCoupon: (c: Omit<Coupon, 'id' | 'usageCount'>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponStatus: (id: string) => void;

  // Customers & CRM
  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id' | 'ordersCount' | 'totalSpent' | 'lastOrderDate'>) => void;

  // Quotes (Devis 50+)
  quotes: QuoteRequest[];
  submitQuoteRequest: (q: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateQuoteStatus: (id: string, status: QuoteRequest['status']) => void;

  // Customer Account
  userProfile: {
    name: string;
    email: string;
    phone: string;
    city: string;
    memberSince: string;
  };
  updateUserProfile: (updates: Partial<StoreContextValue['userProfile']>) => void;
  addresses: CustomerAddress[];
  addAddress: (addr: Omit<CustomerAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;

  // UI Toasts & Search Drawer
  toasts: ToastMessage[];
  pushToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'tt_sn_products_v2',
  FLOCAGE_PRICING: 'tt_sn_flocage_pricing_v2',
  CART: 'tt_sn_cart_v2',
  WISHLIST: 'tt_sn_wishlist_v2',
  ORDERS: 'tt_sn_orders_v2',
  QUOTES: 'tt_sn_quotes_v2',
  COUPONS: 'tt_sn_coupons_v2',
  CUSTOMERS: 'tt_sn_customers_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<RouteView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('admin') || search.includes('admin')) {
        return 'admin';
      }
      if (hash.includes('cart')) return 'cart';
      if (hash.includes('checkout')) return 'checkout';
      if (hash.includes('account')) return 'account';
      if (hash.includes('tracking')) return 'order-tracking';
      if (hash.includes('shop')) return 'shop';
      if (hash.includes('flocage-seul')) return 'flocage-seul';
      if (hash.includes('flocage-lot')) return 'flocage-lot';
      if (hash.includes('flocage')) return 'flocage';
    }
    return 'home';
  });
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(INITIAL_PRODUCTS[0].slug);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(INITIAL_ORDERS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Mode Sombre Neumorphism
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('terangamall_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('terangamall_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark-neu');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      let list = INITIAL_PRODUCTS;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].variants) {
          list = parsed;
        }
      }
      // Assure que tous les produits ont leur slug normalisé, leurs variantes avec photos & prix barrés
      const normalizedList: Product[] = list.map((p): Product => {
        const catSlug = normalizeCategorySlug(p.categorySlug || p.category);
        const ratio = p.oldPrice && p.price ? p.oldPrice / p.price : 1;
        const variantsWithImagesAndOldPrice = p.variants?.map((v): ProductVariantItem => {
          const matchingColor = p.colors?.find((c) => c.name === v.color);
          const computedOld =
            v.oldPrice && v.oldPrice > v.price
              ? v.oldPrice
              : p.oldPrice && p.oldPrice > p.price
              ? Math.max(Math.round((v.price * ratio) / 500) * 500, v.price + 1000)
              : undefined;
          return {
            ...v,
            oldPrice: computedOld,
            image: v.image || matchingColor?.image,
          };
        });

        return {
          ...p,
          categorySlug: catSlug,
          variants: variantsWithImagesAndOldPrice,
        };
      });

      // S'assurer que les produits initiaux essentiels (ex: nouvelle enceinte) sont présents
      INITIAL_PRODUCTS.forEach((initProd) => {
        if (!normalizedList.some((p) => p.id === initProd.id)) {
          normalizedList.push(initProd);
        }
      });

      return normalizedList;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);

  const [flocagePricing, setFlocagePricing] = useState<FlocagePricingConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FLOCAGE_PRICING);
      return saved ? JSON.parse(saved) : INITIAL_FLOCAGE_PRICING;
    } catch {
      return INITIAL_FLOCAGE_PRICING;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-cart-1',
        type: 'PRODUCT',
        product: INITIAL_PRODUCTS[0],
        selectedSize: 'L',
        selectedColor: 'Vert Forêt',
        quantity: 1,
        unitPrice: INITIAL_PRODUCTS[0].price,
      },
    ];
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2', 'prod-3'];
    } catch {
      return ['prod-1', 'prod-2', 'prod-3'];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [quotes, setQuotes] = useState<QuoteRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      return saved ? JSON.parse(saved) : INITIAL_QUOTES;
    } catch {
      return INITIAL_QUOTES;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPct, setDiscountPct] = useState<number>(0);

  const [userProfile, setUserProfile] = useState({
    name: 'Ousmane Mbaye',
    email: 'ousmane.mbaye@dakarfoot.sn',
    phone: '+221 77 450 12 89',
    city: 'Dakar, Point E',
    memberSince: 'Janvier 2025',
  });

  const [addresses, setAddresses] = useState<CustomerAddress[]>(INITIAL_ADDRESSES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FLOCAGE_PRICING, JSON.stringify(flocagePricing));
    } catch {
      // ignore
    }
  }, [flocagePricing]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    } catch {
      // ignore
    }
  }, [quotes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    } catch {
      // ignore
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch {
      // ignore
    }
  }, [customers]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('admin') || search.includes('admin')) {
        setCurrentView('admin');
      } else if (hash.includes('cart')) {
        setCurrentView('cart');
      } else if (hash.includes('checkout')) {
        setCurrentView('checkout');
      } else if (hash.includes('account')) {
        setCurrentView('account');
      } else if (hash.includes('tracking')) {
        setCurrentView('order-tracking');
      } else if (hash.includes('shop')) {
        setCurrentView('shop');
      } else if (hash.includes('flocage-seul')) {
        setCurrentView('flocage-seul');
      } else if (hash.includes('flocage-lot')) {
        setCurrentView('flocage-lot');
      } else if (hash.includes('flocage')) {
        setCurrentView('flocage');
      } else if (hash === '' || hash === '#' || hash === '#/' || hash === '#home') {
        setCurrentView('home');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl+Shift+A or Alt+A anywhere in the page
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'A' || e.key === 'a'))
      ) {
        e.preventDefault();
        setCurrentView((prev) => {
          if (prev === 'admin') {
            try {
              window.history.replaceState(null, '', window.location.pathname);
            } catch {
              window.location.hash = '';
            }
            pushToast('Mode Administrateur fermé', 'Retour à la boutique client publique.');
            return 'home';
          } else {
            window.location.hash = '/admin-secret';
            pushToast('🔒 Accès Administrateur Déverrouillé', 'Panneau de gestion sécurisé TerangaMall.');
            return 'admin';
          }
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const pushToast = (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (
    view: RouteView,
    options?: { productSlug?: string; categorySlug?: string; orderId?: string }
  ) => {
    if (options?.productSlug) setSelectedProductSlug(options.productSlug);
    if (options?.categorySlug !== undefined) setSelectedCategorySlug(options.categorySlug);
    if (options?.orderId) setSelectedOrderId(options.orderId);
    setCurrentView(view);
    setIsSearchOpen(false);

    if (view === 'admin') {
      window.location.hash = '/admin-secret';
    } else {
      if (window.location.hash.toLowerCase().includes('admin')) {
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch {
          window.location.hash = '';
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Catalog CRUD & AliExpress-style operations
  const addProduct = (p: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => {
    const catSlug = normalizeCategorySlug(p.categorySlug || p.category);
    const newVariants =
      p.variants && p.variants.length > 0
        ? p.variants
        : buildVariantsMatrix(p.sku, p.price, p.sizes, p.colors, undefined, p.oldPrice);

    const newProd: Product = {
      ...p,
      categorySlug: catSlug,
      variants: newVariants,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
      reviews: [],
    };
    setProducts((prev) => [newProd, ...prev]);
    pushToast('Produit ajouté au catalogue', `${newProd.name} avec ${newVariants.length} variantes générées.`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        const catSlug = updates.category || updates.categorySlug
          ? normalizeCategorySlug(updates.categorySlug || updates.category || prod.categorySlug)
          : prod.categorySlug;
        const merged = { ...prod, ...updates, categorySlug: catSlug };
        // If price or sizes changed, update total stock or variants accordingly
        if (updates.variants) {
          merged.stock = updates.variants.reduce((sum, v) => sum + (v.active ? v.stock : 0), 0);
        }
        return merged;
      })
    );
    pushToast('Produit mis à jour', 'Les modifications ont été synchronisées.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
    pushToast('Produit supprimé', 'L’article a été retiré du catalogue.', 'info');
  };

  const duplicateProduct = (id: string) => {
    const original = products.find((p) => p.id === id);
    if (!original) return;
    const timestamp = Date.now().toString().slice(-4);
    const newSku = `${original.sku}-CPY${timestamp}`;
    const newName = `${original.name} (Copie)`;
    const newSlug = `${original.slug}-copie-${timestamp}`;
    const clonedVariants = original.variants?.map((v) => ({
      ...v,
      id: `var-${newSku}-${v.size}-${v.color}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: `${newSku}-${v.color.slice(0, 3).toUpperCase()}-${v.size}`,
    }));

    const copy: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      name: newName,
      sku: newSku,
      slug: newSlug,
      variants: clonedVariants,
      status: 'DRAFT',
      reviewCount: 0,
      reviews: [],
    };

    setProducts((prev) => [copy, ...prev]);
    pushToast('Produit dupliqué', `${newName} est enregistré en brouillon.`);
  };

  const bulkUpdateProductsStock = (ids: string[], delta: number) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (!ids.includes(prod.id)) return prod;
        const nextStock = Math.max(0, prod.stock + delta);
        const updatedVariants = prod.variants?.map((v) => ({
          ...v,
          stock: Math.max(0, v.stock + Math.round(delta / Math.max(1, prod.variants?.length || 1))),
        }));
        return {
          ...prod,
          stock: nextStock,
          variants: updatedVariants,
          status: nextStock === 0 ? 'OUT_OF_STOCK' : prod.status,
        };
      })
    );
    pushToast('Stock mis à jour en masse', `${ids.length} produit(s) ajustés de ${delta > 0 ? '+' : ''}${delta}.`);
  };

  const bulkUpdateProductsStatus = (ids: string[], status: Product['status']) => {
    setProducts((prev) =>
      prev.map((prod) => (ids.includes(prod.id) ? { ...prod, status } : prod))
    );
    pushToast('Statut mis à jour en masse', `${ids.length} produit(s) passés au statut ${status}.`);
  };

  // Flocage Pricing
  const updateFlocagePricing = (updates: Partial<FlocagePricingConfig>) => {
    setFlocagePricing((prev) => ({
      ...prev,
      ...updates,
      positionPrices: {
        ...prev.positionPrices,
        ...(updates.positionPrices || {}),
      },
      volumeDiscounts: {
        ...prev.volumeDiscounts,
        ...(updates.volumeDiscounts || {}),
      },
    }));
    pushToast(
      'Tarification Flocage mise à jour',
      'Tous les configurateurs utilisent désormais ces nouveaux tarifs.'
    );
  };

  const calculateVolumeDiscountPct = (qty: number): number => {
    const { tier1to4, tier5to9, tier10to19, tier20to49 } = flocagePricing.volumeDiscounts;
    if (qty >= 20) return tier20to49;
    if (qty >= 10) return tier10to19;
    if (qty >= 5) return tier5to9;
    return tier1to4;
  };

  // Cart & Wishlist
  const addToCartProduct = (product: Product, size: string, color: string, quantity = 1) => {
    // Check specific variant stock if available
    const matchedVariant = findMatchingVariant(product, size, color);
    const availableStock = matchedVariant !== undefined ? matchedVariant.stock : product.stock;

    if (availableStock <= 0 || product.status === 'OUT_OF_STOCK') {
      pushToast('Rupture de stock', `La variante (${size} · ${color}) est en rupture.`, 'error');
      return;
    }

    const variantImage = getVariantImage(product, color, matchedVariant);
    const unitPrice = getVariantPrice(product, matchedVariant);
    const oldUnitPrice = getVariantOldPrice(product, matchedVariant);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.type === 'PRODUCT' &&
          item.product?.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color &&
          !item.savedForLater
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          unitPrice,
          oldUnitPrice,
          selectedImage: variantImage,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: 'PRODUCT',
          product,
          selectedSize: size,
          selectedColor: color,
          selectedImage: variantImage,
          selectedSku: matchedVariant ? matchedVariant.sku : product.sku,
          quantity,
          unitPrice,
          oldUnitPrice,
        },
      ];
    });
    pushToast('Ajouté au panier', `${product.name} (${size} · ${color})`);
  };

  const addToCartFlocage = (config: FlocageConfiguration) => {
    setCart((prev) => [
      ...prev,
      {
        id: `cart-floc-${Date.now()}`,
        type: 'FLOCAGE',
        flocageConfig: config,
        quantity: config.quantity,
        unitPrice: Math.round(config.totalPrice / Math.max(1, config.quantity)),
      },
    ]);
    pushToast(
      config.mode === 'LOT' ? 'Flocage en lot ajouté au panier' : 'Prestation de flocage ajoutée',
      `${config.quantity} vêtement(s) · Total ${config.totalPrice.toLocaleString('fr-FR')} FCFA`
    );
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const removeCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    pushToast('Article retiré', 'Votre panier a été mis à jour.', 'info');
  };

  const toggleSaveForLater = (itemId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, savedForLater: !item.savedForLater } : item
      )
    );
    pushToast('Panier mis à jour', 'Préférence enregistrée pour cet article.', 'info');
  };

  const clearCart = () => {
    setCart((prev) => prev.filter((i) => i.savedForLater));
  };

  // Coupons
  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const matched = coupons.find((c) => c.code.toUpperCase() === clean && c.active);

    if (matched) {
      setCouponCode(matched.code);
      setDiscountPct(matched.discountPct);
      // Increment usage count
      setCoupons((prev) =>
        prev.map((c) => (c.id === matched.id ? { ...c, usageCount: c.usageCount + 1 } : c))
      );
      pushToast('Code promo appliqué', `-${matched.discountPct}% avec le coupon ${matched.code}`);
      return true;
    }

    pushToast('Code invalide ou expiré', 'Vérifiez le code promo ou contactez le support.', 'error');
    return false;
  };

  const addCoupon = (c: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoupon: Coupon = {
      ...c,
      id: `cp-${Date.now()}`,
      usageCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    pushToast('Coupon créé', `Code promo ${newCoupon.code} (-${newCoupon.discountPct}%) activé.`);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    pushToast('Coupon supprimé', 'Le code promo a été retiré.', 'info');
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    pushToast('Statut du coupon modifié', 'Mise à jour enregistrée.');
  };

  // Customers & CRM
  const addCustomer = (c: Omit<Customer, 'id' | 'ordersCount' | 'totalSpent' | 'lastOrderDate'>) => {
    const newCust: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
      ordersCount: 0,
      totalSpent: 0,
      lastOrderDate: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };
    setCustomers((prev) => [newCust, ...prev]);
    pushToast('Client ajouté', `${newCust.name} est enregistré dans le répertoire.`);
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      pushToast(
        exists ? 'Retiré des favoris' : 'Ajouté aux favoris',
        exists
          ? 'L’article a été retiré de votre liste de souhaits.'
          : 'Retrouvez cet article dans votre espace Favoris.',
        'info'
      );
      return next;
    });
  };

  // Order & Payment Flow
  const createOrderWithPayment: StoreContextValue['createOrderWithPayment'] = async (input) => {
    const activeItems = cart.filter((i) => !i.savedForLater);
    const subtotal = activeItems.reduce((acc, item) => {
      if (item.type === 'FLOCAGE' && item.flocageConfig) {
        return acc + item.flocageConfig.totalPrice;
      }
      return acc + item.unitPrice * item.quantity;
    }, 0);

    const deliveryFee =
      input.deliveryMethod === 'RETRAIT_ATELIER' ? 0 : subtotal >= 50000 ? 0 : 2500;
    const discount = Math.round((subtotal * discountPct) / 100);
    const total = Math.max(0, subtotal - discount + deliveryFee);

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `TT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const isFlocageOrder = activeItems.some((i) => i.type === 'FLOCAGE');

    const provider = getPaymentProvider(input.paymentMethod);
    const paymentInit = await provider.createPayment({
      orderId,
      amount: total,
      currency: 'XOF',
      method: input.paymentMethod,
      customerPhone: input.customerPhone,
      customerName: input.customerName,
    });

    let finalPaymentStatus: PaymentStatusType = paymentInit.status;
    let webhookConfirmedAt: string | undefined = undefined;
    let initialOrderStatus: OrderStatusType = 'CONFIRMED';

    if (input.paymentMethod !== 'CASH_ON_DELIVERY') {
      const webhookCheck = await provider.handleWebhook({
        event: 'payment.succeeded',
        transactionId: paymentInit.transactionId,
        providerReference: paymentInit.providerReference,
        orderId,
        amount: total,
        provider: input.paymentMethod,
        signature: paymentInit.webhookSignature,
        timestamp: new Date().toISOString(),
      });

      if (webhookCheck.valid && webhookCheck.newStatus === 'PAID') {
        finalPaymentStatus = 'PAID';
        initialOrderStatus = 'PAID';
        webhookConfirmedAt = new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }

    const paydunyaToken =
      input.paymentMethod === 'PAYDUNYA'
        ? `tok_sandbox_${orderNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${Date.now().toString().slice(-6)}`
        : undefined;
    const paydunyaReceiptUrl = paydunyaToken
      ? `https://app.paydunya.com/sandbox-receipt/pdf/${paydunyaToken}`
      : undefined;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      shippingAddress: {
        street: input.street,
        city: input.city,
        region: input.region,
        instructions: input.instructions,
      },
      deliveryMethod: input.deliveryMethod,
      carrier: input.deliveryMethod === 'RETRAIT_ATELIER' ? 'Retrait Showroom Point E' : 'Coursier Dakar Express',
      trackingNumber: `DKR-TRK-${orderNumber.slice(-4)}`,
      paymentMethod: input.paymentMethod,
      paymentStatus: finalPaymentStatus,
      paymentReference: paymentInit.providerReference,
      paydunyaToken,
      paydunyaReceiptUrl,
      webhookConfirmedAt,
      orderStatus: initialOrderStatus,
      isFlocageOrder,
      items: activeItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };

    // Update product and variant stock
    activeItems.forEach((item) => {
      if (item.type === 'PRODUCT' && item.product) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id !== item.product!.id) return p;
            const nextStock = Math.max(0, p.stock - item.quantity);
            const updatedVariants = p.variants?.map((v) => {
              if (v.size === item.selectedSize && v.color === item.selectedColor) {
                return { ...v, stock: Math.max(0, v.stock - item.quantity) };
              }
              return v;
            });
            return {
              ...p,
              stock: nextStock,
              variants: updatedVariants,
            };
          })
        );
      }
    });

    // Update customer stats
    setCustomers((prev) => {
      const existing = prev.find(
        (c) => c.phone === input.customerPhone || c.email === input.customerEmail
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                ordersCount: c.ordersCount + 1,
                totalSpent: c.totalSpent + total,
                lastOrderDate: 'Aujourd’hui',
                isVip: c.totalSpent + total > 200000,
              }
            : c
        );
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: input.customerName,
          email: input.customerEmail,
          phone: input.customerPhone,
          city: input.city,
          ordersCount: 1,
          totalSpent: total,
          lastOrderDate: 'Aujourd’hui',
          isVip: total > 200000,
        };
        return [newCust, ...prev];
      }
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setCouponCode('');
    setDiscountPct(0);

    pushToast(
      `Commande ${orderNumber} confirmée`,
      finalPaymentStatus === 'PAID'
        ? `Paiement ${input.paymentMethod} vérifié par Webhook (${paymentInit.providerReference}).`
        : `Commande enregistrée en paiement à la livraison.`
    );

    return newOrder;
  };

  const confirmOrderPaymentWebhook = async (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const provider = getPaymentProvider(target.paymentMethod);
    const verified = await provider.verifyPayment(target.paymentReference);
    if (verified.verified || target.paymentMethod === 'CASH_ON_DELIVERY') {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                paymentStatus: 'PAID',
                orderStatus: o.orderStatus === 'CONFIRMED' ? 'PAID' : o.orderStatus,
                webhookConfirmedAt: new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }
            : o
        )
      );
      pushToast(
        'Webhook Paiement Validé',
        `La commande ${target.orderNumber} est désormais marquée PAYÉE.`
      );
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatusType) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
    pushToast('Statut de commande mis à jour', `Nouveau statut : ${status}`);
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatusType) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o))
    );
    pushToast('Statut de paiement modifié', `Statut paiement : ${status}`);
  };

  const updateOrderTracking = (
    orderId: string,
    trackingNumber: string,
    carrier: string,
    notes?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              trackingNumber,
              carrier,
              notes: notes !== undefined ? notes : o.notes,
              orderStatus: o.orderStatus === 'PAID' || o.orderStatus === 'PREPARING' ? 'SHIPPED' : o.orderStatus,
            }
          : o
      )
    );
    pushToast('Expédition enregistrée', `Transporteur : ${carrier} · Suivi : ${trackingNumber}`);
  };

  const submitQuoteRequest: StoreContextValue['submitQuoteRequest'] = (q) => {
    const newQuote: QuoteRequest = {
      ...q,
      id: `qt-${Date.now()}`,
      status: 'EN_ATTENTE',
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };
    setQuotes((prev) => [newQuote, ...prev]);
    pushToast(
      'Demande de devis envoyée',
      `Notre équipe Grands Comptes à Dakar vous répond sous 2h ouvrées.`
    );
  };

  const updateQuoteStatus = (id: string, status: QuoteRequest['status']) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    pushToast('Devis mis à jour', `Nouveau statut du devis : ${status}`);
  };

  const updateUserProfile = (updates: Partial<StoreContextValue['userProfile']>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    pushToast('Profil mis à jour', 'Vos informations personnelles ont été enregistrées.');
  };

  const addAddress = (addr: Omit<CustomerAddress, 'id'>) => {
    const newAddr: CustomerAddress = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => [...prev, newAddr]);
    pushToast('Adresse ajoutée', `${addr.label} (${addr.city}) a été enregistrée.`);
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    pushToast('Adresse supprimée', 'L’adresse a été retirée de votre carnet.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        selectedProductSlug,
        selectedCategorySlug,
        selectedOrderId,
        searchQuery,
        setSearchQuery,
        navigateTo,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        bulkUpdateProductsStock,
        bulkUpdateProductsStatus,
        flocagePricing,
        updateFlocagePricing,
        calculateVolumeDiscountPct,
        cart,
        wishlistIds,
        couponCode,
        discountPct,
        applyCoupon,
        addToCartProduct,
        addToCartFlocage,
        updateCartQuantity,
        removeCartItem,
        toggleSaveForLater,
        toggleWishlist,
        clearCart,
        orders,
        createOrderWithPayment,
        confirmOrderPaymentWebhook,
        updateOrderStatus,
        updatePaymentStatus,
        updateOrderTracking,
        coupons,
        addCoupon,
        deleteCoupon,
        toggleCouponStatus,
        customers,
        addCustomer,
        quotes,
        submitQuoteRequest,
        updateQuoteStatus,
        userProfile,
        updateUserProfile,
        addresses,
        addAddress,
        deleteAddress,
        toasts,
        pushToast,
        dismissToast,
        isSearchOpen,
        setIsSearchOpen,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
