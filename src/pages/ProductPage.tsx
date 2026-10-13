import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Eye,
  Heart,
  Maximize2,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../services/payment';
import { ProductCard } from '../components/ui/ProductCard';
import { SafeImage } from '../components/ui/SafeImage';
import {
  calculateVariantSavings,
  findMatchingVariant,
  getAllVariantImages,
  getVariantImage,
  getVariantOldPrice,
  getVariantPrice,
} from '../types';

export const ProductPage: React.FC = () => {
  const {
    products,
    selectedProductSlug,
    navigateTo,
    addToCartProduct,
    wishlistIds,
    toggleWishlist,
    updateProduct,
  } = useStore();

  const product =
    products.find((p) => p.slug === selectedProductSlug) || products[0];

  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0] || product.variants?.[0]?.size || 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.name || product.variants?.[0]?.color || 'Standard'
  );
  const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'livraison' | 'avis'>('description');
  const [selectedShippingRegion, setSelectedShippingRegion] = useState('Dakar');
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewCity, setReviewCity] = useState('Dakar');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Sync state whenever the selected product changes
  useEffect(() => {
    setSelectedSize(product.sizes[0] || product.variants?.[0]?.size || 'Standard');
    setSelectedColor(product.colors[0]?.name || product.variants?.[0]?.color || 'Standard');
    setUserSelectedImage(null);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const isWishlisted = wishlistIds.includes(product.id);

  // All photos available for this product including variants and colors
  const galleryImages = useMemo(() => getAllVariantImages(product), [product]);

  // Exact matching variant for current size and color
  const matchedVariant = useMemo(
    () => findMatchingVariant(product, selectedSize, selectedColor),
    [product, selectedSize, selectedColor]
  );

  // Synchronized price calculations
  const currentVariantPrice = useMemo(
    () => getVariantPrice(product, matchedVariant),
    [product, matchedVariant]
  );

  const currentVariantOldPrice = useMemo(
    () => getVariantOldPrice(product, matchedVariant),
    [product, matchedVariant]
  );

  const { hasDiscount, discountPct, savingsAmount } = useMemo(
    () => calculateVariantSavings(currentVariantPrice, currentVariantOldPrice),
    [currentVariantPrice, currentVariantOldPrice]
  );

  const currentVariantStock =
    matchedVariant !== undefined ? matchedVariant.stock : product.stock;
  const isOutOfStock = currentVariantStock <= 0 || product.status === 'OUT_OF_STOCK';

  // Synchronized photo for the current variation
  const variantDefaultPhoto = useMemo(
    () => getVariantImage(product, selectedColor, matchedVariant),
    [product, selectedColor, matchedVariant]
  );

  // Displayed image: user clicked thumbnail or the exact variation photo
  const activeDisplayImage = userSelectedImage || variantDefaultPhoto;

  const handleSelectColor = (colName: string) => {
    setSelectedColor(colName);
    // Immediately display the photo associated with this color/variant
    const targetPhoto = getVariantImage(
      product,
      colName,
      product.variants?.find((v) => v.color === colName && v.size === selectedSize)
    );
    setUserSelectedImage(targetPhoto);
  };

  const handleSelectSize = (sz: string) => {
    setSelectedSize(sz);
    // If the variant for this size and color has a specific photo, update to it
    const newVariant = findMatchingVariant(product, sz, selectedColor);
    if (newVariant?.image) {
      setUserSelectedImage(newVariant.image);
    }
  };

  const handleSelectThumbnail = (img: string) => {
    setUserSelectedImage(img);
    // If this thumbnail matches a specific color, sync selectedColor
    const matchingCol = product.colors.find((c) => c.image === img);
    if (matchingCol) {
      setSelectedColor(matchingCol.name);
      return;
    }
    const matchingVar = product.variants?.find((v) => v.image === img);
    if (matchingVar && matchingVar.color) {
      setSelectedColor(matchingVar.color);
    }
  };

  const handleOrderOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour TerangaMall ! Je souhaite commander cet article :\n\n• Produit : ${product.name}\n• Couleur : ${selectedColor}\n• Taille/Option : ${selectedSize}\n• Quantité : ${quantity}\n• Prix unitaire : ${formatFCFA(currentVariantPrice)}\n• Total : ${formatFCFA(currentVariantPrice * quantity)}\n\nMerci de m'indiquer comment finaliser la livraison à Dakar !`
    );
    window.open(`https://wa.me/221774501289?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const similarProducts = products
    .filter((p) => p.id !== product.id && p.status === 'ACTIVE')
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCartProduct(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCartProduct(product, selectedSize, selectedColor, quantity);
    navigateTo('checkout');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    const newReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor,
      role: 'Client vérifié',
      city: reviewCity,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };

    const updatedReviews = [newReview, ...product.reviews];
    updateProduct(product.id, {
      reviews: updatedReviews,
      reviewCount: product.reviewCount + 1,
    });
    setReviewAuthor('');
    setReviewComment('');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb & Merchant Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#777777]">
        <nav aria-label="Fil d’Ariane" className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="hover:text-[#111111]"
          >
            Accueil
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            type="button"
            onClick={() => navigateTo('shop', { categorySlug: product.categorySlug })}
            className="hover:text-[#111111]"
          >
            {product.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#111111] font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Layout (AliExpress-style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Product Image Gallery + Lightbox zoom */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
          <div className="relative aspect-square rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] overflow-hidden group cursor-zoom-in">
            <SafeImage
              src={activeDisplayImage}
              alt={`${product.name} - ${selectedColor}`}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            />
            {discountPct > 0 && (
              <span className="absolute top-4 left-4 bg-[#FF5A1F] text-white text-xs font-bold px-3 py-1 rounded-md tabular-nums shadow-sm">
                -{discountPct}%
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              aria-label="Agrandir la photo"
              className="absolute bottom-4 right-4 p-2 rounded-xl bg-white/90 text-[#111111] hover:bg-white transition-colors shadow-sm"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnails strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => {
                const isCurrentActive = activeDisplayImage === img;
                const matchingCol = product.colors.find((c) => c.image === img);

                return (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => handleSelectThumbnail(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      isCurrentActive
                        ? 'border-[#FF5A1F] ring-2 ring-[#FFE8DE] scale-102 shadow-sm'
                        : 'border-[#E5E5E5] opacity-70 hover:opacity-100 hover:border-zinc-400'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} vue ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {matchingCol && (
                      <span
                        title={matchingCol.name}
                        className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: matchingCol.hex }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#777777] mb-2 flex-wrap">
              <span className="font-semibold text-[#111111]">{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px]">
                SKU : {matchedVariant ? matchedVariant.sku : product.sku}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-semibold ${
                  currentVariantStock > 5
                    ? 'text-emerald-700'
                    : currentVariantStock > 0
                    ? 'text-[#FF5A1F]'
                    : 'text-red-600'
                }`}
              >
                {currentVariantStock > 5
                  ? `En stock (${currentVariantStock} pcs)`
                  : currentVariantStock > 0
                  ? `Plus que ${currentVariantStock} en stock !`
                  : 'Rupture pour cette variante'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] leading-tight">
              {product.name}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-3 mt-3 text-xs flex-wrap">
              <div className="flex items-center gap-0.5 text-[#FF5A1F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FF5A1F]" />
                ))}
              </div>
              <span className="font-bold text-[#111111] tabular-nums">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[#777777] tabular-nums">
                ({product.reviewCount} avis vérifiés)
              </span>
              <span className="text-white/40" aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">
                Expédition directe Dakar 24h
              </span>
            </div>
          </div>

          {/* Price & Reassurance Box */}
          <div className="bg-[#FAF9F7] rounded-2xl border border-zinc-200/90 p-5 space-y-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black text-zinc-950 tabular-nums">
                {formatFCFA(currentVariantPrice)}
              </span>
              {hasDiscount && currentVariantOldPrice && (
                <>
                  <span className="text-base text-zinc-400 line-through tabular-nums font-semibold">
                    {formatFCFA(currentVariantOldPrice)}
                  </span>
                  <span className="text-xs font-bold text-white bg-[#FF5A1F] px-2.5 py-0.5 rounded-full tabular-nums shadow-2xs">
                    -{discountPct}% ({formatFCFA(savingsAmount)} d'économie)
                  </span>
                </>
              )}
            </div>

            {/* Reassurance points */}
            <div className="pt-2 border-t border-zinc-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 font-medium">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <span>Livraison 24h à Dakar & Régions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Paiement Wave, OM ou Espèces</span>
              </div>
            </div>
          </div>

          {/* AliExpress-style Color Variants WITH Image Thumbnails */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111111]">
                  Couleur : <strong className="text-[#FF5A1F]">{selectedColor}</strong>
                </span>
                <span className="text-[#777777]">{product.colors.length} options</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  const colPhoto = getVariantImage(product, c.name);

                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleSelectColor(c.name)}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FF5A1F] ring-2 ring-[#FFE8DE] bg-white text-[#111111] shadow-2xs'
                          : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111] hover:border-[#111111]'
                      }`}
                    >
                      {/* Visual thumbnail or color dot */}
                      {colPhoto ? (
                        <img
                          src={colPhoto}
                          alt={c.name}
                          className="w-7 h-7 rounded-lg object-cover border border-[#E5E5E5] shrink-0"
                        />
                      ) : (
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                      )}
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size / Option Variants */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111111]">
                  {product.categorySlug === 'electronique'
                    ? 'Capacité / Stockage :'
                    : product.categorySlug === 'maison'
                    ? 'Capacité / Format :'
                    : product.categorySlug === 'sport' && !product.sizes[0]?.includes('Boîtier')
                    ? 'Pointure / Taille :'
                    : 'Option / Taille :'}{' '}
                  <strong className="text-[#111111]">{selectedSize}</strong>
                </span>
                <span className="text-[#777777]">Disponible sous 24h</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  const szVariant = findMatchingVariant(product, sz, selectedColor);
                  const szStock = szVariant !== undefined ? szVariant.stock : product.stock;
                  const isSzOutOfStock = szStock <= 0;

                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={isSzOutOfStock}
                      onClick={() => handleSelectSize(sz)}
                      className={`min-w-14 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all relative flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                          : isSzOutOfStock
                          ? 'border-[#E5E5E5] bg-[#F7F7F5] text-zinc-400 line-through cursor-not-allowed opacity-50'
                          : 'border-[#E5E5E5] bg-white text-[#111111] hover:border-[#111111]'
                      }`}
                    >
                      <span>{sz}</span>
                      {szVariant && szVariant.price !== product.price && (
                        <span
                          className={`text-[10px] font-semibold tabular-nums ${
                            isSelected ? 'text-[#FFE8DE]' : 'text-zinc-500'
                          }`}
                        >
                          {formatFCFA(szVariant.price)}
                        </span>
                      )}
                      {szVariant && szVariant.stock > 0 && szVariant.stock <= 3 && !isSelected && (
                        <span
                          title={`Plus que ${szVariant.stock} en stock !`}
                          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF5A1F] ring-2 ring-white"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-[#E5E5E5] rounded-xl bg-[#F7F7F5] h-12 px-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Diminuer la quantité"
                  className="w-8 h-8 flex items-center justify-center text-[#111111] hover:text-[#FF5A1F]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-[#111111] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= currentVariantStock}
                  onClick={() => setQuantity((q) => Math.min(currentVariantStock, q + 1))}
                  aria-label="Augmenter la quantité"
                  className="w-8 h-8 flex items-center justify-center text-[#111111] hover:text-[#FF5A1F] disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 h-12 px-6 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] disabled:bg-[#E5E5E5] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>AJOUTER AU PANIER</span>
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Ajouter aux favoris"
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                  isWishlisted
                    ? 'border-[#FF5A1F] bg-[#FFE8DE] text-[#FF5A1F]'
                    : 'border-[#E5E5E5] text-[#111111] hover:border-[#111111]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#FF5A1F]' : ''}`} />
              </button>
            </div>

            {/* Buy Now CTA */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="w-full h-12 rounded-xl bg-[#FF5A1F] hover:bg-zinc-950 disabled:bg-zinc-200 text-white text-sm font-bold transition-colors cursor-pointer active:scale-98"
            >
              COMMANDER MAINTENANT · PAIEMENT WAVE / OM / LIVRAISON
            </button>

            {/* Direct WhatsApp Order Button */}
            <button
              type="button"
              onClick={handleOrderOnWhatsApp}
              className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-zinc-950 text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Commander directement sur WhatsApp</span>
            </button>
          </div>

          {/* Regional Shipping Estimator */}
          <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#FF5A1F]" />
                <span>Estimation de livraison</span>
              </span>
              <select
                value={selectedShippingRegion}
                onChange={(e) => setSelectedShippingRegion(e.target.value)}
                className="px-2 py-1 rounded border border-[#E5E5E5] bg-white text-xs font-medium"
              >
                <option value="Dakar">Dakar & Banlieue</option>
                <option value="Thiès">Thiès / Mbour / Saly</option>
                <option value="Régions">Saint-Louis / Touba / Ziguinchor</option>
              </select>
            </div>

            <div className="text-xs text-[#777777] flex items-center justify-between">
              <span>
                {selectedShippingRegion === 'Dakar'
                  ? 'Livraison express par coursier sous 3h à 24h'
                  : selectedShippingRegion === 'Thiès'
                  ? 'Livraison relais express sous 24h à 48h'
                  : 'Expédition par GP / Chrono sous 48h à 72h'}
              </span>
              <span className="font-bold text-[#111111]">
                {product.price >= 50000 ? 'Gratuite' : '2 500 FCFA'}
              </span>
            </div>
          </div>

          {/* Flocage Callout if eligible */}
          {product.flocageEligible && (
            <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFE8DE] text-[#FF5A1F] flex items-center justify-center shrink-0">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111111]">
                    Personnaliser ce maillot avec Nom & Numéro
                  </div>
                  <div className="text-[11px] text-[#777777]">
                    Atelier thermique à Dakar · Dès 2 000 FCFA
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('flocage-seul')}
                className="px-3.5 py-2 rounded-lg bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                Floquer ce modèle
              </button>
            </div>
          )}

          {/* Buyer Protection Guarantee (AliExpress style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#777777]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF5A1F] shrink-0" />
              <span>Garantie 100% TerangaTrust</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#FF5A1F] shrink-0" />
              <span>Retours 14j en boutique</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Paiement sécurisé Wave</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Caractéristiques, Livraison & Avis Clients */}
      <div className="border-t border-[#E5E5E5] pt-10">
        <div className="flex items-center gap-6 border-b border-[#E5E5E5] mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'description'
                ? 'border-[#FF5A1F] text-[#111111]'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            Description & Caractéristiques
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('livraison')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'livraison'
                ? 'border-[#FF5A1F] text-[#111111]'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            Livraison & Retours au Sénégal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avis')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'avis'
                ? 'border-[#FF5A1F] text-[#111111]'
                : 'border-transparent text-[#777777] hover:text-[#111111]'
            }`}
          >
            Avis Clients ({product.reviews.length})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#111111]">À propos de cet article</h3>
              <p className="text-sm text-[#777777] leading-relaxed">{product.description}</p>
              {product.weightKg && (
                <div className="text-xs text-[#777777]">
                  Poids net estimé : <strong className="text-[#111111]">{product.weightKg * 1000}g</strong>
                </div>
              )}
            </div>
            <div className="bg-[#F7F7F5] rounded-2xl p-6 border border-[#E5E5E5]">
              <h3 className="text-sm font-bold text-[#111111] mb-4">
                Caractéristiques techniques
              </h3>
              <ul className="space-y-2.5 text-sm text-[#111111]">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'livraison' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-[#F7F7F5] rounded-2xl p-6 border border-[#E5E5E5] space-y-2">
              <h3 className="font-bold text-[#111111]">Livraison Dakar & Régions</h3>
              <p className="text-[#777777] leading-relaxed">
                Livraison express par coursier dans tout Dakar (Plateau, Point E, Almadies, Mermoz, Sacré-Cœur, Pikine, Rufisque) sous 3h à 24h. Expédition dans toutes les régions (Thiès, Saint-Louis, Ziguinchor, Touba, Kaolack) sous 24h à 48h. Gratuite dès 50 000 FCFA d’achat.
              </p>
            </div>
            <div className="bg-[#F7F7F5] rounded-2xl p-6 border border-[#E5E5E5] space-y-2">
              <h3 className="font-bold text-[#111111]">Politique de Retours & Échanges</h3>
              <p className="text-[#777777] leading-relaxed">
                Les articles non personnalisés peuvent être échangés ou remboursés sous 14 jours sur simple présentation en atelier au Point E ou via ramassage coursier.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'avis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              {product.reviews.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#F7F7F5] text-center text-sm text-[#777777]">
                  Soyez le premier à donner votre avis sur cet article.
                </div>
              ) : (
                product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-[#111111]">
                        {rev.author} · <span className="font-normal text-xs text-[#777777]">{rev.city}</span>
                      </div>
                      <span className="text-xs text-[#777777]">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#FF5A1F]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#FF5A1F]" />
                      ))}
                    </div>
                    <p className="text-sm text-[#111111] leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleSubmitReview}
              className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4"
            >
              <h3 className="text-base font-bold text-[#111111]">Laisser un avis</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Votre nom *</label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Ex: Moussa Ndiaye"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Ville</label>
                  <input
                    type="text"
                    value={reviewCity}
                    onChange={(e) => setReviewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Note</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs bg-white"
                >
                  <option value={5}>5 étoiles – Excellent</option>
                  <option value={4}>4 étoiles – Très bien</option>
                  <option value={3}>3 étoiles – Correct</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Votre commentaire *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Partagez votre avis sur la coupe, la matière ou la livraison..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold transition-colors"
              >
                Publier mon avis
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-[#111111] hover:bg-white shadow"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeDisplayImage}
              alt={product.name}
              className="w-full h-auto max-h-[82vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Produits Similaires */}
      <div className="border-t border-[#E5E5E5] pt-12">
        <h2 className="text-xl sm:text-2xl font-bold text-[#111111] mb-6">
          Produits similaires
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {similarProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Impeccable Mobile Sticky Purchase Action Bar (AliExpress & Temu mobile style) */}
      <div className="lg:hidden fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="min-w-0">
          <div className="text-sm font-black text-[#111111] tabular-nums truncate">
            {formatFCFA(currentVariantPrice)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isOutOfStock ? 'Rupture' : `En stock (${currentVariantStock})`}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleOrderOnWhatsApp}
            title="Commander sur WhatsApp"
            className="p-2.5 rounded-xl bg-[#25D366] text-zinc-950 font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="px-3 py-2.5 rounded-xl border border-zinc-900 bg-white text-zinc-950 hover:bg-zinc-50 active:scale-95 disabled:opacity-40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Panier</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="px-3.5 py-2.5 rounded-xl bg-[#FF5A1F] text-white hover:bg-zinc-900 active:scale-95 disabled:opacity-40 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Commander</span>
          </button>
        </div>
      </div>
    </div>
  );
};
