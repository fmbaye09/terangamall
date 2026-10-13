import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA } from '../../services/payment';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from './SafeImage';
import {
  calculateVariantSavings,
  findMatchingVariant,
  getVariantImage,
  getVariantOldPrice,
  getVariantPrice,
} from '../../types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'bestseller';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
}) => {
  const { navigateTo, addToCartProduct, wishlistIds, toggleWishlist } = useStore();
  const isWishlisted = wishlistIds.includes(product.id);

  // Active color preview state for this card
  const [activeColor, setActiveColor] = useState<string>(
    product.colors?.[0]?.name || 'Standard'
  );

  // Matched variant for active color
  const currentVariant = findMatchingVariant(
    product,
    product.sizes?.[0] || 'Standard',
    activeColor
  );

  const cardPrice = getVariantPrice(product, currentVariant);
  const cardOldPrice = getVariantOldPrice(product, currentVariant);
  const { hasDiscount, discountPct } = calculateVariantSavings(cardPrice, cardOldPrice);

  const displayImage = getVariantImage(product, activeColor, currentVariant);

  const handleOpenProduct = () => {
    navigateTo('product', { productSlug: product.slug });
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const hasMultiplePrices = Boolean(
    product.variants &&
      product.variants.some((v) => v.price !== product.price)
  );

  return (
    <article
      onClick={handleOpenProduct}
      className="group cursor-pointer bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square bg-[#F7F7F6] overflow-hidden">
          <SafeImage
            src={displayImage}
            alt={`${product.name} - ${activeColor}`}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />

          {/* Simple discount badge if on promotion */}
          {hasDiscount && discountPct > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-[#FF5A1F] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs tabular-nums">
              -{discountPct}%
            </span>
          )}

          {/* Favorite button */}
          <button
            type="button"
            onClick={handleToggleFav}
            aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
              isWishlisted
                ? 'bg-white text-[#FF5A1F]'
                : 'bg-white/90 text-zinc-600 hover:bg-white hover:text-zinc-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#FF5A1F]' : ''}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3.5 sm:p-4 pb-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span className="font-medium truncate">{product.category}</span>
            {product.rating > 0 && (
              <span className="inline-flex items-center gap-0.5 text-amber-500 font-semibold tabular-nums">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 group-hover:text-[#FF5A1F] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Color swatches preview if multiple colors exist */}
          {product.colors && product.colors.length > 1 && (
            <div
              className="flex items-center gap-1.5 pt-1 overflow-x-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {product.colors.slice(0, 5).map((col) => {
                const isSelected = activeColor === col.name;
                return (
                  <button
                    key={col.name}
                    type="button"
                    title={col.name}
                    onMouseEnter={() => setActiveColor(col.name)}
                    onClick={() => setActiveColor(col.name)}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#FF5A1F] scale-110 border-white'
                        : 'border-black/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                );
              })}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-zinc-400 font-medium">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Clear Action Button */}
      <div className="p-3.5 sm:p-4 pt-1 space-y-2.5">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-bold text-zinc-950 tabular-nums">
            {hasMultiplePrices && !currentVariant ? 'Dès ' : ''}
            {formatFCFA(cardPrice)}
          </span>
          {hasDiscount && cardOldPrice && (
            <span className="text-xs text-zinc-400 line-through tabular-nums font-medium">
              {formatFCFA(cardOldPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpenProduct}
          className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-[#FF5A1F] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Voir & Commander</span>
        </button>
      </div>
    </article>
  );
};
