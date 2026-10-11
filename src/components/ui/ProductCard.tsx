import React from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA } from '../../services/payment';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from './SafeImage';

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
  const isOutOfStock = product.stock <= 0 || product.status === 'OUT_OF_STOCK';

  const discountPct =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const handleOpenProduct = () => {
    navigateTo('product', { productSlug: product.slug });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartProduct(
      product,
      product.sizes[0] || 'Standard',
      product.colors[0]?.name || 'Standard',
      1
    );
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article
      onClick={handleOpenProduct}
      className="group cursor-pointer bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square bg-[#F7F7F6] overflow-hidden">
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />

          {/* Simple discount badge if on promotion */}
          {discountPct > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-[#FF5A1F] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
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
        <div className="p-3.5 sm:p-4 pb-2 space-y-1">
          <div className="text-[11px] font-medium text-zinc-500 truncate">
            {product.category}
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 group-hover:text-[#FF5A1F] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Pricing & Clear Action Button */}
      <div className="p-3.5 sm:p-4 pt-1 space-y-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-zinc-950 tabular-nums">
            {formatFCFA(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-zinc-400 line-through tabular-nums">
              {formatFCFA(product.oldPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpenProduct}
          className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-[#FF5A1F] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-98"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Voir & Commander</span>
        </button>
      </div>
    </article>
  );
};
