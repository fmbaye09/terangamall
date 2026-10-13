import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../services/payment';
import { checkPayDunyaInvoiceStatus, createPayDunyaInvoice } from '../services/paydunya';
import { Order, PaymentMethodType } from '../types';
import { SafeImage } from '../components/ui/SafeImage';
import { FLOCAGE_IMAGE_URL } from '../data/initialData';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    userProfile,
    addresses,
    discountPct,
    createOrderWithPayment,
    confirmOrderPaymentWebhook,
    navigateTo,
    pushToast,
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('PAYDUNYA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PayDunya Real API modal states
  const [paydunyaInvoiceData, setPaydunyaInvoiceData] = useState<{
    order: Order;
    token: string;
    responseUrl: string;
    mode: 'test' | 'live';
  } | null>(null);
  const [paydunyaError, setPaydunyaError] = useState<{ message: string; code?: string } | null>(null);
  const [isCheckingPayDunyaStatus, setIsCheckingPayDunyaStatus] = useState(false);

  // Écoute en direct des Webhooks IPN PayDunya dès que la facture est ouverte
  useEffect(() => {
    if (!paydunyaInvoiceData?.token) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        setIsCheckingPayDunyaStatus(true);
        const res = await checkPayDunyaInvoiceStatus(paydunyaInvoiceData.token);
        if (res.confirmed && isMounted) {
          clearInterval(interval);
          await confirmOrderPaymentWebhook(paydunyaInvoiceData.order.id);
          pushToast(
            'Paiement PayDunya Confirmé par Webhook !',
            `Le paiement de la commande ${paydunyaInvoiceData.order.orderNumber} a été validé avec succès.`
          );
          const targetOrderId = paydunyaInvoiceData.order.id;
          setPaydunyaInvoiceData(null);
          navigateTo('order-tracking', { orderId: targetOrderId });
        }
      } catch {
        // silent polling catch
      } finally {
        if (isMounted) setIsCheckingPayDunyaStatus(false);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [paydunyaInvoiceData, confirmOrderPaymentWebhook, navigateTo, pushToast]);

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
    setPaydunyaError(null);
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

      if (paymentMethod === 'PAYDUNYA') {
        // Création de la vraie facture sur l'API PayDunya (Sandbox ou Live)
        const invoiceRes = await createPayDunyaInvoice({
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          amount: createdOrder.total,
          customerName,
          customerPhone,
          customerEmail: emailToUse,
          description: `Commande ${createdOrder.orderNumber} - TerangaMall Sénégal`,
        });

        if (invoiceRes.success && invoiceRes.token && invoiceRes.responseUrl) {
          setPaydunyaInvoiceData({
            order: createdOrder,
            token: invoiceRes.token,
            responseUrl: invoiceRes.responseUrl,
            mode: invoiceRes.mode,
          });
        } else {
          setPaydunyaError({
            message: invoiceRes.responseText || 'Échec de connexion avec l\'API PayDunya.',
            code: invoiceRes.responseCode,
          });
        }
      } else {
        navigateTo('order-tracking', { orderId: createdOrder.id });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualCheckPayDunyaStatus = async () => {
    if (!paydunyaInvoiceData?.token || isCheckingPayDunyaStatus) return;
    setIsCheckingPayDunyaStatus(true);
    try {
      const res = await checkPayDunyaInvoiceStatus(paydunyaInvoiceData.token);
      if (res.confirmed) {
        await confirmOrderPaymentWebhook(paydunyaInvoiceData.order.id);
        pushToast(
          'Paiement PayDunya Confirmé !',
          `Facture ${paydunyaInvoiceData.token} validée avec succès par PayDunya.`
        );
        const targetId = paydunyaInvoiceData.order.id;
        setPaydunyaInvoiceData(null);
        navigateTo('order-tracking', { orderId: targetId });
      } else {
        pushToast(
          'En attente de règlement PayDunya',
          'La facture n\'a pas encore été validée sur le portail PayDunya. Cliquez sur "Accéder à PayDunya" pour régler avec votre compte de test.',
          'info'
        );
      }
    } catch {
      pushToast('Erreur', 'Impossible de vérifier le statut PayDunya.', 'error');
    } finally {
      setIsCheckingPayDunyaStatus(false);
    }
  };

  const handleCancelPayDunya = () => {
    if (!paydunyaInvoiceData) return;
    pushToast('Paiement PayDunya suspendu', 'Votre commande est conservée en attente de paiement.', 'info');
    const orderId = paydunyaInvoiceData.order.id;
    setPaydunyaInvoiceData(null);
    navigateTo('order-tracking', { orderId });
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
                    id: 'PAYDUNYA',
                    title: 'PayDunya Sénégal (API Test / Sandbox)',
                    desc: 'Passerelle multi-canaux : Wave, Orange Money, Free Money & Cartes bancaires.',
                    badge: 'API Test',
                  },
                  {
                    id: 'WAVE',
                    title: 'Wave Sénégal Direct',
                    desc: 'Validation instantanée sur votre application Wave.',
                  },
                  {
                    id: 'ORANGE_MONEY',
                    title: 'Orange Money Direct',
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
                      ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                      : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111] hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {m.title}
                      {'badge' in m && m.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            paymentMethod === m.id
                              ? 'bg-[#FF5A1F] text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {m.badge}
                        </span>
                      )}
                    </span>
                    {paymentMethod === m.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
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
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                        <SafeImage
                          src={
                            isFlocage
                              ? FLOCAGE_IMAGE_URL
                              : item.selectedImage || item.product?.images[0] || FLOCAGE_IMAGE_URL
                          }
                          alt="Article"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#111111] truncate">
                          {isFlocage
                            ? `Flocage ${item.flocageConfig?.mode} (${item.flocageConfig?.quantity} pcs)`
                            : item.product?.name}
                        </div>
                        <div className="text-[#777777] text-[11px] truncate">
                          Qté : {item.quantity}
                          {!isFlocage && (
                            <>
                              {item.selectedSize && ` · ${item.selectedSize}`}
                              {item.selectedColor && ` · ${item.selectedColor}`}
                            </>
                          )}
                        </div>
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
                : paymentMethod === 'PAYDUNYA'
                ? `PAYER VIA PAYDUNYA TEST (${formatFCFA(total)})`
                : `CONFIRMER ET PAYER (${formatFCFA(total)})`}
            </button>
          </div>
        </div>
      </form>

      {/* ======================================================== */}
      {/* MODAL 1 : VRAIE PASSERELLE PAYDUNYA (SANDBOX / LIVE)     */}
      {/* ======================================================== */}
      {paydunyaInvoiceData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            className="bg-white rounded-3xl border border-[#E5E5E5] max-w-lg w-full shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header PayDunya */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0084FF]/10 text-[#0084FF] font-black flex items-center justify-center text-sm shadow-2xs">
                  PD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#111111]">
                      PayDunya Checkout
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      paydunyaInvoiceData.mode === 'live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {paydunyaInvoiceData.mode === 'live' ? 'Production' : 'Sandbox (Test Réel)'}
                    </span>
                  </div>
                  <p className="text-xs text-[#777777]">
                    Passerelle officielle PayDunya Sénégal (Wave, OM, Free, Carte)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelPayDunya}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Facture Info */}
            <div className="bg-[#F7F7F5] rounded-2xl p-4 border border-[#E5E5E5] space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#777777]">Montant à régler</span>
                <span className="text-xl font-bold text-[#111111] tabular-nums">
                  {formatFCFA(paydunyaInvoiceData.order.total)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-zinc-200">
                <span className="text-zinc-500">Numéro de Commande</span>
                <span className="font-semibold text-zinc-900">{paydunyaInvoiceData.order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Token PayDunya Officiel</span>
                <span className="font-mono text-zinc-800 font-semibold">{paydunyaInvoiceData.token}</span>
              </div>
            </div>

            {/* Instructions pour paiement réel Sandbox */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#0084FF]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Paiement avec votre compte de test PayDunya</span>
              </div>
              <p className="leading-relaxed text-zinc-700">
                Cliquez sur le bouton ci-dessous pour ouvrir la page officielle de paiement <strong>PayDunya</strong>. Réglez avec vos identifiants test ou les faux numéros Wave/Orange Money fournis par PayDunya.
              </p>
              <div className="text-[10px] font-semibold text-blue-800 bg-white/80 p-2 rounded-lg border border-blue-100">
                ⚡ Dès validation sur PayDunya, la notification Webhook IPN officielle confirmera instantanément cette commande en temps réel !
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3 pt-1">
              <a
                href={paydunyaInvoiceData.responseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-[#0084FF] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <span>Accéder à la passerelle PayDunya ({formatFCFA(paydunyaInvoiceData.order.total)})</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Indicateur de webhook en direct */}
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-800 bg-blue-50 py-2.5 px-4 rounded-xl border border-blue-200">
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPayDunyaStatus ? 'animate-spin' : ''} text-[#0084FF]`} />
                <span>En attente de la notification Webhook IPN de PayDunya...</span>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleManualCheckPayDunyaStatus}
                  disabled={isCheckingPayDunyaStatus}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPayDunyaStatus ? 'animate-spin' : ''}`} />
                  <span>Vérifier si le paiement est confirmé</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleCancelPayDunya}
                    className="text-zinc-500 hover:text-red-600 font-semibold cursor-pointer"
                  >
                    Annuler la commande
                  </button>

                  <a
                    href={paydunyaInvoiceData.responseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0084FF] hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Lien direct vers la facture PayDunya</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2 : ERREUR DE CONNEXION API PAYDUNYA               */}
      {/* ======================================================== */}
      {paydunyaError && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            className="bg-white rounded-3xl border border-red-200 max-w-md w-full shadow-2xl p-6 space-y-4 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900">
                  Erreur API PayDunya
                </h3>
                <p className="text-xs text-zinc-500">
                  Impossible d'initialiser la session de paiement avec PayDunya
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1.5">
              <div className="font-semibold">{paydunyaError.message}</div>
              {paydunyaError.code && (
                <div className="text-[10px] font-mono text-red-700">Code retour : {paydunyaError.code}</div>
              )}
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Pour encaisser ou tester avec votre compte PayDunya, vérifiez que vos 3 clés API (<strong>Master Key</strong>, <strong>Private Key</strong> et <strong>Token</strong>) sont renseignées et correspondent à votre application <strong>Mode Test</strong> dans PayDunya.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPaydunyaError(null);
                  navigateTo('admin');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#0084FF] hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚙️ Configurer mes clés PayDunya dans l'Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setPaydunyaError(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
