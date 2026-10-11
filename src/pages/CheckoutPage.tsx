import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  Smartphone,
  Store,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../services/payment';
import { PaymentMethodType } from '../types';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    userProfile,
    addresses,
    discountPct,
    createOrderWithPayment,
    navigateTo,
  } = useStore();

  const activeItems = cart.filter((i) => !i.savedForLater);
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  // Étape 1 : Informations client & Adresse
  const [customerName, setCustomerName] = useState(userProfile.name);
  const [customerPhone, setCustomerPhone] = useState(userProfile.phone);
  const [customerEmail, setCustomerEmail] = useState(userProfile.email);
  const [street, setStreet] = useState(defaultAddress?.street || 'Rue PE-24, Point E');
  const [city, setCity] = useState(defaultAddress?.city || 'Dakar');
  const [region, setRegion] = useState(defaultAddress?.region || 'Dakar');
  const [instructions, setInstructions] = useState(defaultAddress?.instructions || '');

  // Étape 2 : Mode de livraison
  const [deliveryMethod, setDeliveryMethod] = useState<
    'LIVRAISON_DOMICILE' | 'RETRAIT_ATELIER'
  >('LIVRAISON_DOMICILE');

  // Étape 3 : Moyen de paiement
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('WAVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = activeItems.reduce((sum, item) => {
    if (item.type === 'FLOCAGE' && item.flocageConfig) {
      return sum + item.flocageConfig.totalPrice;
    }
    return sum + item.unitPrice * item.quantity;
  }, 0);

  const deliveryFee =
    deliveryMethod === 'RETRAIT_ATELIER' ? 0 : subtotal >= 50000 ? 0 : 2500;
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const emailToUse =
        customerEmail.trim() ||
        `${customerPhone.replace(/[^0-9]/g, '') || 'commande'}@terangamall.sn`;

      const createdOrder = await createOrderWithPayment({
        customerName,
        customerPhone,
        customerEmail: emailToUse,
        street,
        city,
        region,
        instructions,
        deliveryMethod,
        paymentMethod,
      });

      navigateTo('order-tracking', { orderId: createdOrder.id });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeItems.length === 0) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#111111]">
          Votre panier ne contient aucun article à régler
        </h1>
        <button
          type="button"
          onClick={() => navigateTo('shop', { categorySlug: 'all' })}
          className="px-6 py-3 rounded-xl bg-[#111111] text-white text-xs font-semibold"
        >
          Retourner à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-xs text-[#777777] mb-6">
        <button
          type="button"
          onClick={() => navigateTo('cart')}
          className="hover:text-[#111111]"
        >
          Panier
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111111] font-medium">Finalisation & Paiement</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] mb-8">
        Validation de la commande
      </h1>

      <form
        onSubmit={handleConfirmOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
      >
        {/* Left: Steps 1, 2, 3 */}
        <div className="lg:col-span-7 space-y-6">
          {/* ÉTAPE 1 : Informations Client & Adresse */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111111]">
                Étape 1 · Vos coordonnées pour la livraison
              </h2>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sans mot de passe</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Fatou Diop"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Numéro de téléphone (Wave / OM) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ex: 77 123 45 67"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm tabular-nums"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Email (Facultatif)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Optionnel (pour recevoir le reçu par mail)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Rue / Quartier / Villa *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Rue PE-24, Villa 18, Point E"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Ville *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Région *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5E5] text-sm bg-white"
                >
                  <option value="Dakar">Dakar</option>
                  <option value="Thiès">Thiès (Mbour / Saly)</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                  <option value="Diourbel">Diourbel (Touba)</option>
                  <option value="Ziguinchor">Ziguinchor</option>
                  <option value="Kaolack">Kaolack</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Instructions de livraison (Point de repère)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ex: À côté de la pharmacie, appeler en arrivant..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm"
                />
              </div>
            </div>
          </div>

          {/* ÉTAPE 2 : Mode de livraison */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#111111]">
              Étape 2 · Mode de réception
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setDeliveryMethod('LIVRAISON_DOMICILE')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  deliveryMethod === 'LIVRAISON_DOMICILE'
                    ? 'border-[#FF5A1F] bg-[#FFE8DE]/50'
                    : 'border-[#E5E5E5] bg-[#F7F7F5]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#FF5A1F]" />
                    <span>Livraison à domicile / bureau</span>
                  </span>
                  <span className="text-xs font-bold text-[#111111] tabular-nums">
                    {subtotal >= 50000 ? 'Gratuite' : '2 500 FCFA'}
                  </span>
                </div>
                <p className="text-[11px] text-[#777777]">
                  Par coursier à Dakar (sous 24h) ou expédition régionale.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('RETRAIT_ATELIER')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  deliveryMethod === 'RETRAIT_ATELIER'
                    ? 'border-[#FF5A1F] bg-[#FFE8DE]/50'
                    : 'border-[#E5E5E5] bg-[#F7F7F5]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#FF5A1F]" />
                    <span>Retrait en boutique / atelier</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-700">Gratuit</span>
                </div>
                <p className="text-[11px] text-[#777777]">
                  Showroom & Atelier TerangaMall, Point E – Dakar.
                </p>
              </button>
            </div>
          </div>

          {/* ÉTAPE 3 : Moyen de paiement (Wave, Orange Money, Carte, Livraison) */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111111]">
                Étape 3 · Moyen de paiement sécurisé
              </h2>
              <span className="text-xs text-[#777777] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Webhook vérifié</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(
                [
                  {
                    id: 'WAVE',
                    title: 'Wave Sénégal',
                    desc: 'Validation instantanée sur votre application Wave.',
                  },
                  {
                    id: 'ORANGE_MONEY',
                    title: 'Orange Money',
                    desc: 'Paiement mobile rapide via #144#391# ou Max It.',
                  },
                  {
                    id: 'CARD',
                    title: 'Carte Bancaire (Visa / Mastercard)',
                    desc: 'Transaction 3D Secure chiffrée.',
                  },
                  {
                    id: 'CASH_ON_DELIVERY',
                    title: 'Paiement à la livraison',
                    desc: 'Réglez en espèces ou Wave auprès du livreur.',
                  },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === m.id
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{m.title}</span>
                    {paymentMethod === m.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" />
                    )}
                  </div>
                  <p
                    className={`text-[11px] ${
                      paymentMethod === m.id ? 'text-white/75' : 'text-[#777777]'
                    }`}
                  >
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Step 4 - Final Summary & Submit */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#111111]">
              Étape 4 · Résumé de la commande
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-[#E5E5E5]">
              {activeItems.map((item) => {
                const isFlocage = item.type === 'FLOCAGE' && item.flocageConfig;
                const price =
                  isFlocage && item.flocageConfig
                    ? item.flocageConfig.totalPrice
                    : item.unitPrice * item.quantity;
                return (
                  <div key={item.id} className="pt-3 first:pt-0 flex justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-[#111111]">
                        {isFlocage
                          ? `Flocage ${item.flocageConfig?.mode} (${item.flocageConfig?.quantity} pcs)`
                          : item.product?.name}
                      </div>
                      <div className="text-[#777777]">
                        Qté : {item.quantity}
                        {!isFlocage && ` · Taille ${item.selectedSize}`}
                      </div>
                    </div>
                    <div className="font-bold text-[#111111] tabular-nums shrink-0">
                      {formatFCFA(price)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2.5 text-sm border-y border-[#E5E5E5] py-4">
              <div className="flex justify-between">
                <span className="text-[#777777]">Sous-total</span>
                <span className="font-semibold text-[#111111] tabular-nums">
                  {formatFCFA(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Livraison ({city})</span>
                <span className="font-semibold text-[#111111] tabular-nums">
                  {deliveryFee === 0 ? 'Gratuite' : formatFCFA(deliveryFee)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FF5A1F] font-semibold">
                  <span>Réduction</span>
                  <span className="tabular-nums">-{formatFCFA(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-[#111111]">NET À PAYER</span>
              <span className="text-2xl font-bold text-[#FF5A1F] tabular-nums">
                {formatFCFA(total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-sm font-bold transition-colors cursor-pointer"
            >
              {isSubmitting
                ? 'Vérification du paiement en cours...'
                : `CONFIRMER ET PAYER (${formatFCFA(total)})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
