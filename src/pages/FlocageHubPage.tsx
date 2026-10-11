import React from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FLOCAGE_IMAGE_URL, JERSEY_IMAGE_URL } from '../data/initialData';
import { formatFCFA } from '../services/payment';
import { QuoteForm } from '../components/flocage/QuoteForm';
import { SafeImage } from '../components/ui/SafeImage';

export const FlocageHubPage: React.FC = () => {
  const { navigateTo, flocagePricing } = useStore();

  return (
    <div className="space-y-16 pb-16">
      {/* HERO /FLOCAGE */}
      <section className="bg-[#111111] text-white border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold text-[#FF5A1F] uppercase tracking-wider">
                Atelier Officiel de Personnalisation · Dakar Point E
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                Personnalisez votre maillot
              </h1>
              <p className="text-lg sm:text-xl font-medium text-white/90">
                Nom <span className="text-[#FF5A1F]">•</span> Numéro{' '}
                <span className="text-[#FF5A1F]">•</span> Logo{' '}
                <span className="text-[#FF5A1F]">•</span> Sponsor
              </p>
              <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
                Flocage thermique flex haute densité et impression quadri pour particuliers, clubs de football, tournois corporatifs, écoles et événements partout au Sénégal.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('flocage-seul')}
                  className="px-6 py-3.5 rounded-xl bg-[#FF5A1F] hover:bg-white hover:text-[#111111] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Shirt className="w-4 h-4" />
                  <span>FLOQUAGE SEUL</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('flocage-lot')}
                  className="px-6 py-3.5 rounded-xl bg-white text-[#111111] hover:bg-[#FF5A1F] hover:text-white text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>FLOQUAGE EN LOT</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                <SafeImage
                  src={FLOCAGE_IMAGE_URL}
                  alt="Atelier Flocage Maillot Dakar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEUX FORMULES PRINCIPALES */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Flocage Seul */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#F7F7F5] mb-6">
                <SafeImage
                  src={FLOCAGE_IMAGE_URL}
                  alt="Flocage seul sur votre vêtement"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
                Prestation à l’unité · Apportez votre vêtement
              </div>
              <h2 className="text-2xl font-bold text-[#111111] mb-3">
                1. Flocage Seul (Sur votre propre maillot / T-shirt)
              </h2>
              <p className="text-sm text-[#777777] leading-relaxed mb-6">
                Vous avez déjà acheté votre maillot ou votre T-shirt ? Configurez votre nom, numéro, police et logo en ligne. Déposez-le dans notre atelier au Point E ou choisissez la collecte et livraison par coursier à Dakar.
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-[#111111] mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span>Aperçu en direct de votre nom et numéro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span>Import de votre logo ou sponsor (PNG, JPG, SVG)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span>Dépôt en atelier ou ramassage à domicile</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('flocage-seul')}
              className="w-full py-3.5 px-6 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>Configurer mon flocage seul</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Flocage en Lot */}
          <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-white mb-6">
                <SafeImage
                  src={JERSEY_IMAGE_URL}
                  alt="Flocage en lot pour clubs et équipes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
                Clubs, Académies, Écoles & Entreprises
              </div>
              <h2 className="text-2xl font-bold text-[#111111] mb-3">
                2. Flocage en Lot (Équipes & Séries)
              </h2>
              <p className="text-sm text-[#777777] leading-relaxed mb-6">
                Gérez facilement la liste complète de vos joueurs (Nom, Numéro, Taille, Couleur). Ajoutez chaque joueur manuellement ou importez directement votre liste Excel / CSV avec calcul automatique des remises par volume.
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-[#111111] mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span>Tableau dynamique des joueurs + Import Excel (.xlsx / .csv)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span>Logo d’équipe et sponsor sur poitrine, manche ou dos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span>
                    Remises automatiques de -{flocagePricing.volumeDiscounts.tier5to9}% à -{flocagePricing.volumeDiscounts.tier20to49}%
                  </span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('flocage-lot')}
              className="w-full py-3.5 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>Personnaliser un lot d’équipe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* BARÈME OFFICIEL & REMISES PAR VOLUME (100% piloté par la base de données / Admin) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
                Tarification Transparente (synchronisée en temps réel)
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">
                Tarifs unitaires & Remises par quantité
              </h2>
            </div>
            <div className="text-xs text-[#777777]">
              Mise à jour atelier Dakar 2026
            </div>
          </div>

          {/* Unit prices */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="text-xs text-[#777777] mb-1">Flocage Nom</div>
              <div className="text-xl font-bold text-[#111111] tabular-nums">
                {formatFCFA(flocagePricing.namePrice)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="text-xs text-[#777777] mb-1">Flocage Numéro</div>
              <div className="text-xl font-bold text-[#111111] tabular-nums">
                {formatFCFA(flocagePricing.numberPrice)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="text-xs text-[#777777] mb-1">Logo / Écusson</div>
              <div className="text-xl font-bold text-[#111111] tabular-nums">
                {formatFCFA(flocagePricing.logoPrice)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="text-xs text-[#777777] mb-1">Sponsor Officiel</div>
              <div className="text-xl font-bold text-[#111111] tabular-nums">
                {formatFCFA(flocagePricing.sponsorPrice)}
              </div>
            </div>
          </div>

          {/* Volume discount tiers */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl border border-[#E5E5E5] text-center">
              <div className="text-xs font-semibold text-[#777777]">1 à 4 pièces</div>
              <div className="text-base font-bold text-[#111111] mt-1 tabular-nums">
                Prix normal
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5E5] text-center">
              <div className="text-xs font-semibold text-[#777777]">5 à 9 pièces</div>
              <div className="text-base font-bold text-[#111111] mt-1 tabular-nums">
                -{flocagePricing.volumeDiscounts.tier5to9}%
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5E5] text-center">
              <div className="text-xs font-semibold text-[#777777]">10 à 19 pièces</div>
              <div className="text-base font-bold text-[#111111] mt-1 tabular-nums">
                -{flocagePricing.volumeDiscounts.tier10to19}%
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[#FF5A1F] bg-[#FFE8DE]/40 text-center">
              <div className="text-xs font-semibold text-[#FF5A1F]">20 à 49 pièces</div>
              <div className="text-base font-bold text-[#FF5A1F] mt-1 tabular-nums">
                -{flocagePricing.volumeDiscounts.tier20to49}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#111111] text-white text-center col-span-2 sm:col-span-1">
              <div className="text-xs font-semibold text-white/70">
                {flocagePricing.volumeDiscounts.quoteMinQty}+ pièces
              </div>
              <div className="text-sm font-bold text-[#FF5A1F] mt-1">
                Sur devis dédié
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULAIRE DE DEMANDE DE DEVIS GRANDS VOLUMES */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <QuoteForm defaultQuantity={flocagePricing.volumeDiscounts.quoteMinQty} />
      </section>
    </div>
  );
};
