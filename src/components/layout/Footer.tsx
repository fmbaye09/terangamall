import React, { useRef, useState } from 'react';
import { MapPin, MessageCircle, Phone, Mail, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigateTo } = useStore();
  const secretClickCount = useRef(0);
  const secretClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWhatsAppSupport = () => {
    const text = encodeURIComponent(
      'Bonjour TerangaMall Dakar ! J’aimerais avoir des informations sur vos produits et le service de livraison.'
    );
    window.open(`https://wa.me/221774501289?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Discreet secret entry for the administrator (no visible button)
  const handleSecretAdminTrigger = () => {
    secretClickCount.current += 1;
    if (secretClickTimer.current) clearTimeout(secretClickTimer.current);

    if (secretClickCount.current >= 3) {
      secretClickCount.current = 0;
      navigateTo('admin');
      return;
    }

    secretClickTimer.current = setTimeout(() => {
      secretClickCount.current = 0;
    }, 1500);
  };

  return (
    <footer className="bg-[#111111] text-white pt-14 pb-24 lg:pb-12 border-t border-white/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="text-2xl font-black tracking-tight text-white font-display text-left"
            >
              Teranga<span className="text-[#FF5A1F]">Mall</span>
            </button>
            <p className="text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed">
              Le grand marketplace généraliste au Sénégal. High-Tech, Smartphones, Électroménager, Maison, Mode, Sneakers et personnalisation pro avec livraison express sous 24h à Dakar et dans toutes les régions.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleWhatsAppSupport}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-[#111111] font-bold text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Assistance WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('order-tracking')}
                className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-white text-xs font-semibold text-white transition-colors"
              >
                Suivre un colis
              </button>
            </div>
          </div>

          {/* Col 2: Catégories Marketplace */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Catégories
            </h3>
            <ul className="space-y-2.5 text-xs text-white/70 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('shop', { categorySlug: 'all' })}
                  className="hover:text-[#FF5A1F] transition-colors"
                >
                  Tous les produits
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('shop', { categorySlug: 'electronique' })}
                  className="hover:text-[#FF5A1F] transition-colors"
                >
                  High-Tech & Smartphones
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('shop', { categorySlug: 'sport' })}
                  className="hover:text-[#FF5A1F] transition-colors"
                >
                  Montres Connectées & Audio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('shop', { categorySlug: 'maison' })}
                  className="hover:text-[#FF5A1F] transition-colors"
                >
                  Maison & Électroménager
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('shop', { categorySlug: 'mode' })}
                  className="hover:text-[#FF5A1F] transition-colors"
                >
                  Mode & Sneakers
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Personnalisation & B2B */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Atelier & Pros
            </h3>
            <ul className="space-y-2.5 text-xs text-white/70 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('flocage')}
                  className="hover:text-[#FF5A1F] transition-colors"
                >
                  Atelier Flocage Textile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('flocage-seul')}
                  className="hover:text-[#FF5A1F] transition-colors"
                >
                  Flocage à la pièce
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('flocage-lot')}
                  className="hover:text-[#FF5A1F] transition-colors"
                >
                  Commandes en lot (Entreprises)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('flocage')}
                  className="hover:text-[#FF5A1F] transition-colors text-[#FF5A1F]"
                >
                  Demande de devis pro
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Showroom Dakar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Contact & Retrait
            </h3>
            <ul className="space-y-3 text-xs text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                <span>Avenue Cheikh Anta Diop, Point E, Dakar – Sénégal</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <span className="tabular-nums">+221 33 825 40 90 / 77 450 12 89</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <span>contact@terangamall.sn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payment Methods & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            <span
              onClick={handleSecretAdminTrigger}
              className="cursor-default select-none"
              title=""
            >
              ©
            </span>{' '}
            2026 TerangaMall Sénégal SARL. Tous droits réservés · CGV · Protection des acheteurs.
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <span className="text-white/40 text-[11px]">Paiements sécurisés :</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold text-[11px]">
              Wave Sénégal
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[#FF7900] font-semibold text-[11px]">
              Orange Money
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold text-[11px]">
              Visa / Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[11px]">
              Paiement à la livraison
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
