import React from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageCircle,
  Package,
  ShieldCheck,
  Shirt,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../services/payment';
import { OrderStatusType } from '../types';

const STANDARD_STEPS: { status: OrderStatusType; label: string; desc: string }[] = [
  {
    status: 'CONFIRMED',
    label: 'Commande confirmée',
    desc: 'Votre commande a été enregistrée par notre système.',
  },
  {
    status: 'PAID',
    label: 'Paiement reçu (Webhook vérifié)',
    desc: 'Transaction confirmée par le fournisseur de paiement.',
  },
  {
    status: 'PREPARING',
    label: 'Préparation en showroom',
    desc: 'Contrôle des articles et emballage soigné à Dakar.',
  },
  {
    status: 'SHIPPED',
    label: 'En livraison',
    desc: 'Remis à notre coursier pour livraison à votre adresse.',
  },
  {
    status: 'DELIVERED',
    label: 'Livrée',
    desc: 'Colis remis en main propre au destinataire.',
  },
];

const FLOCAGE_STEPS: { status: OrderStatusType; label: string; desc: string }[] = [
  {
    status: 'CONFIRMED',
    label: 'Commande confirmée',
    desc: 'Configuration de flocage enregistrée avec succès.',
  },
  {
    status: 'PAID',
    label: 'Paiement reçu (Webhook vérifié)',
    desc: 'Transaction validée par le serveur.',
  },
  {
    status: 'RECEIVING_GARMENT',
    label: 'Vêtement reçu en atelier',
    desc: 'Réception et vérification de la fibre textile au Point E.',
  },
  {
    status: 'DESIGN_VALIDATED',
    label: 'Personnalisation validée (BAT)',
    desc: 'Calibrage vectoriel des noms, numéros et logos.',
  },
  {
    status: 'FLOCAGE_IN_PROGRESS',
    label: 'Flocage thermique en cours',
    desc: 'Pressage haute précision en atelier.',
  },
  {
    status: 'QUALITY_CHECK',
    label: 'Contrôle qualité',
    desc: 'Inspection de la tenue, de l’alignement et des finitions.',
  },
  {
    status: 'READY',
    label: 'Prêt à l’atelier',
    desc: 'Vos maillots personnalisés sont prêts.',
  },
  {
    status: 'DELIVERED',
    label: 'Livraison / Retrait effectué',
    desc: 'Commande livrée ou récupérée au showroom.',
  },
];

export const OrderTrackingPage: React.FC = () => {
  const {
    orders,
    selectedOrderId,
    navigateTo,
    updateOrderStatus,
    confirmOrderPaymentWebhook,
  } = useStore();

  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) || orders[0];

  if (!activeOrder) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-sm text-[#777777]">Aucune commande à suivre.</p>
      </div>
    );
  }

  const timelineSteps = activeOrder.isFlocageOrder ? FLOCAGE_STEPS : STANDARD_STEPS;
  const currentStepIndex = Math.max(
    0,
    timelineSteps.findIndex((s) => s.status === activeOrder.orderStatus)
  );

  const handleWhatsAppOrderHelp = () => {
    const msg = encodeURIComponent(
      `Bonjour Support TerangaMall ! J'ai besoin d'aide concernant ma commande ${activeOrder.orderNumber} (${activeOrder.customerName}).`
    );
    window.open(`https://wa.me/221774501289?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
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
        <button
          type="button"
          onClick={() => navigateTo('account')}
          className="hover:text-[#111111]"
        >
          Mon Compte
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111111] font-medium">
          Suivi {activeOrder.orderNumber}
        </span>
      </nav>

      {/* Order Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
            Suivi de commande en temps réel
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">
            Commande {activeOrder.orderNumber}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {orders.map((ord) => (
            <button
              key={ord.id}
              type="button"
              onClick={() => navigateTo('order-tracking', { orderId: ord.id })}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                ord.id === activeOrder.id
                  ? 'border-[#111111] bg-[#111111] text-white'
                  : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111]'
              }`}
            >
              {ord.orderNumber} {ord.isFlocageOrder ? '· Flocage' : '· Boutique'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Vertical Step-by-Step Timeline */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E5E5] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#111111]">
              {activeOrder.isFlocageOrder
                ? 'Progression Atelier de Flocage (8 étapes)'
                : 'Progression Expédition Standard (5 étapes)'}
            </h2>
            <span className="text-xs font-semibold text-[#FF5A1F]">
              Étape {currentStepIndex + 1} / {timelineSteps.length}
            </span>
          </div>

          <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:left-[23px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E5E5]">
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.status}
                  onClick={() => updateOrderStatus(activeOrder.id, step.status)}
                  className="relative flex items-start gap-4 cursor-pointer group"
                >
                  <div
                    className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isCurrent
                        ? 'bg-[#FF5A1F] text-white ring-4 ring-[#FFE8DE]'
                        : isCompleted
                        ? 'bg-[#111111] text-white'
                        : 'bg-white border-2 border-[#E5E5E5] text-[#777777]'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-[#FF5A1F]'
                            : isCompleted
                            ? 'text-[#111111]'
                            : 'text-[#777777]'
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <span className="text-[11px] font-semibold text-[#FF5A1F]">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#777777] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E5E5E5] text-xs text-[#777777]">
            Astuce démo : cliquez sur n’importe quelle étape ci-dessus pour simuler l’avancement de la commande en temps réel.
          </div>
        </div>

        {/* Right: Order Info, Payment Status & WhatsApp Support */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#111111]">
              Détails & Vérification Paiement
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-[#777777]">Client</span>
                <span className="font-semibold text-[#111111]">
                  {activeOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Téléphone</span>
                <span className="font-semibold text-[#111111] tabular-nums">
                  {activeOrder.customerPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Adresse</span>
                <span className="font-semibold text-[#111111] text-right">
                  {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Moyen de paiement</span>
                <span className="font-bold text-[#111111]">
                  {activeOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Référence transaction</span>
                <span className="font-mono-num text-xs text-[#111111]">
                  {activeOrder.paymentReference}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#777777]">Statut paiement</span>
                <span
                  className={`font-bold ${
                    activeOrder.paymentStatus === 'PAID'
                      ? 'text-emerald-700'
                      : 'text-[#FF5A1F]'
                  }`}
                >
                  {activeOrder.paymentStatus}
                  {activeOrder.webhookConfirmedAt &&
                    ` (Webhook ${activeOrder.webhookConfirmedAt})`}
                </span>
              </div>
            </div>

            {activeOrder.paymentStatus !== 'PAID' && (
              <button
                type="button"
                onClick={() => confirmOrderPaymentWebhook(activeOrder.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold transition-colors"
              >
                Simuler la confirmation Webhook du paiement
              </button>
            )}

            <div className="pt-4 border-t border-[#E5E5E5] flex items-baseline justify-between">
              <span className="text-sm font-bold text-[#111111]">Total Commande</span>
              <span className="text-xl font-bold text-[#111111] tabular-nums">
                {formatFCFA(activeOrder.total)}
              </span>
            </div>
          </div>

          {/* WhatsApp Support Card */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#111111]">
              Besoin d’aide sur cette commande ?
            </h3>
            <p className="text-xs text-[#777777] leading-relaxed">
              Notre équipe support et atelier à Dakar répond immédiatement sur WhatsApp avec votre numéro de suivi <strong>{activeOrder.orderNumber}</strong>.
            </p>
            <button
              type="button"
              onClick={handleWhatsAppOrderHelp}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-[#111111] text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contacter sur WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
