import React, { useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Tag,
  Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FLOCAGE_IMAGE_URL } from '../data/initialData';
import { formatFCFA } from '../services/payment';
import { SafeImage } from '../components/ui/SafeImage';

export const CartPage: React.FC = () => {
  const {
    cart,
    navigateTo,
    updateCartQuantity,
    removeCartItem,
    toggleSaveForLater,
    couponCode,
    discountPct,
    applyCoupon,
  } = useStore();

  const [promoInput, setPromoInput] = useState(couponCode || '');

  const activeItems = cart.filter((i) => !i.savedForLater);
  const savedItems = cart.filter((i) => i.savedForLater);

  const subtotal = activeItems.reduce((sum, item) => {
    if (item.type === 'FLOCAGE' && item.flocageConfig) {
      return sum + item.flocageConfig.totalPrice;
    }
    return sum + item.unitPrice * item.quantity;
  }, 0);

  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 50000 ? 0 : 2500;
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    applyCoupon(promoInput);
  };

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-lg mx-auto bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#111111]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111]">Votre panier est vide</h1>
          <p className="text-sm text-[#777777]">
            Explorez notre sélection High-Tech, Maison, Électroménager, Mode et Sneakers disponibles immédiatement à Dakar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigateTo('shop', { categorySlug: 'all' })}
              className="px-6 py-3 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              CONTINUER MES ACHATS
            </button>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="px-6 py-3 rounded-xl bg-white border border-[#111111] text-[#111111] hover:bg-[#FFE8DE] text-xs sm:text-sm font-semibold transition-colors"
            >
              ACCUEIL BOUTIQUE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-xs text-[#777777]">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="hover:text-[#111111]"
        >
          Accueil
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111111] font-medium">Panier ({activeItems.length})</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">
        Votre Panier
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          {activeItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] text-center space-y-3">
              <p className="text-sm font-semibold text-[#111111]">
                Aucun article actif dans le panier immédiat.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('shop', { categorySlug: 'all' })}
                className="px-5 py-2.5 rounded-lg bg-[#111111] text-white text-xs font-semibold"
              >
                CONTINUER MES ACHATS
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeItems.map((item) => {
                const isFlocage = item.type === 'FLOCAGE' && item.flocageConfig;
                const lineTotal =
                  isFlocage && item.flocageConfig
                    ? item.flocageConfig.totalPrice
                    : item.unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E5E5E5] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl bg-[#F7F7F5] overflow-hidden shrink-0 border border-[#E5E5E5]">
                      <SafeImage
                        src={
                          isFlocage
                            ? FLOCAGE_IMAGE_URL
                            : item.product?.images[0] || FLOCAGE_IMAGE_URL
                        }
                        alt={
                          isFlocage
                            ? 'Prestation Flocage'
                            : item.product?.name || 'Produit'
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1.5 w-full">
                      {isFlocage && item.flocageConfig ? (
                        <>
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF5A1F]">
                            <Shirt className="w-3.5 h-3.5" />
                            <span>
                              {item.flocageConfig.mode === 'LOT'
                                ? `Flocage en Lot (${item.flocageConfig.quantity} ${item.flocageConfig.garmentType}s)`
                                : `Flocage Seul (${item.flocageConfig.garmentType})`}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#111111]">
                            {item.flocageConfig.mode === 'LOT'
                              ? `Personnalisation Équipe · ${item.flocageConfig.players?.length || item.flocageConfig.quantity} joueurs`
                              : `Nom : ${item.flocageConfig.customName || '-'} · N° : ${item.flocageConfig.customNumber || '-'}`}
                          </h3>
                          <p className="text-xs text-[#777777]">
                            Police : {item.flocageConfig.fontStyle} · Couleur : {item.flocageConfig.textColor} · Position : {item.flocageConfig.position}
                            {item.flocageConfig.discountPercent > 0 &&
                              ` · Remise -${item.flocageConfig.discountPercent}%`}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-[#777777]">
                            {item.product?.category} · SKU {item.product?.sku}
                          </div>
                          <h3 className="text-base font-bold text-[#111111] truncate">
                            {item.product?.name}
                          </h3>
                          <div className="text-xs text-[#777777]">
                            Taille : <strong className="text-[#111111]">{item.selectedSize}</strong> · Couleur :{' '}
                            <strong className="text-[#111111]">{item.selectedColor}</strong>
                          </div>
                        </>
                      )}

                      {/* Actions row */}
                      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                        {!isFlocage && (
                          <div className="flex items-center border border-[#E5E5E5] rounded-lg bg-[#F7F7F5] h-8 px-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.id, item.quantity - 1)
                              }
                              className="w-6 h-6 flex items-center justify-center text-[#111111]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.id, item.quantity + 1)
                              }
                              className="w-6 h-6 flex items-center justify-center text-[#111111]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleSaveForLater(item.id)}
                          className="inline-flex items-center gap-1 text-[#777777] hover:text-[#111111]"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Sauvegarder pour plus tard</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="inline-flex items-center gap-1 text-[#777777] hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>

                    {/* Line Price */}
                    <div className="text-right shrink-0 self-end sm:self-center">
                      <div className="text-base font-bold text-[#111111] tabular-nums">
                        {formatFCFA(lineTotal)}
                      </div>
                      {item.quantity > 1 && !isFlocage && (
                        <div className="text-[11px] text-[#777777] tabular-nums">
                          {formatFCFA(item.unitPrice)} / unité
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Saved For Later Section */}
          {savedItems.length > 0 && (
            <div className="pt-6 border-t border-[#E5E5E5] space-y-4">
              <h2 className="text-base font-bold text-[#111111]">
                Mis de côté pour plus tard ({savedItems.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#111111] truncate">
                        {item.product?.name || 'Prestation Flocage'}
                      </div>
                      <div className="text-xs font-bold text-[#FF5A1F] tabular-nums">
                        {formatFCFA(item.unitPrice)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleSaveForLater(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-semibold"
                      >
                        Remettre au panier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#111111]">Résumé de la commande</h2>

            {/* Promo Code */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Code promo (ex: TERANGA10)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-xs uppercase font-semibold focus:outline-none focus:border-[#111111]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold transition-colors"
              >
                Appliquer
              </button>
            </form>

            {/* Breakdown */}
            <div className="space-y-3 text-sm border-y border-[#E5E5E5] py-4">
              <div className="flex justify-between">
                <span className="text-[#777777]">Sous-total</span>
                <span className="font-semibold text-[#111111] tabular-nums">
                  {formatFCFA(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#777777]">Livraison estimée</span>
                <span className="font-semibold text-[#111111] tabular-nums">
                  {deliveryFee === 0 ? 'Gratuite' : formatFCFA(deliveryFee)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FF5A1F] font-semibold">
                  <span>Réduction ({couponCode} -{discountPct}%)</span>
                  <span className="tabular-nums">-{formatFCFA(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-[#111111]">Total TTC</span>
              <span className="text-2xl font-bold text-[#111111] tabular-nums">
                {formatFCFA(total)}
              </span>
            </div>

            <button
              type="button"
              disabled={activeItems.length === 0}
              onClick={() => navigateTo('checkout')}
              className="w-full py-3.5 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] disabled:bg-[#E5E5E5] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>PASSER LA COMMANDE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#777777] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#FF5A1F] shrink-0" />
              <span>Paiement Wave, Orange Money, Carte ou à la livraison</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
