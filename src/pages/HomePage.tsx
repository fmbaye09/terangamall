import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  HelpCircle,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  AIRFRYER_IMAGE_URL,
  FLOCAGE_IMAGE_URL,
  HERO_BANNER_URL,
  HOODIE_IMAGE_URL,
  SMARTPHONE_IMAGE_URL,
  SMARTWATCH_IMAGE_URL,
  SNEAKER_IMAGE_URL,
} from '../data/initialData';
import { ProductCard } from '../components/ui/ProductCard';
import { SafeImage } from '../components/ui/SafeImage';

export const HomePage: React.FC = () => {
  const { products, categories, navigateTo } = useStore();

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      'Bonjour TerangaMall ! J’aimerais avoir des informations sur un produit et commander directement.'
    );
    window.open(`https://wa.me/221774501289?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const featuredProducts = products.filter((p) => p.status === 'ACTIVE').slice(0, 8);

  const visualCategories = [
    {
      id: 'vis-phones',
      name: 'High-Tech & Téléphones',
      slug: 'electronique',
      desc: 'Smartphones 5G, écouteurs sans fil & son',
      image: SMARTPHONE_IMAGE_URL,
      tag: '📱 High-Tech',
    },
    {
      id: 'vis-watches',
      name: 'Montres & Objets Connectés',
      slug: 'electronique',
      desc: 'Smartwatches AMOLED, bracelets & gadgets',
      image: SMARTWATCH_IMAGE_URL,
      tag: '⌚ Montres',
    },
    {
      id: 'vis-cuisine',
      name: 'Maison & Cuisine',
      slug: 'maison',
      desc: 'Air Fryer sans huile & électroménager',
      image: AIRFRYER_IMAGE_URL,
      tag: '🍳 Cuisine',
    },
    {
      id: 'vis-mode',
      name: 'Mode & Sneakers',
      slug: 'mode',
      desc: 'Hoodies lourds, baskets & streetwear',
      image: SNEAKER_IMAGE_URL,
      tag: '👟 Mode',
    },
    {
      id: 'vis-flocage',
      name: 'Atelier Flocage & Pros',
      slug: 'flocage',
      desc: 'Personnalisation t-shirts & polos d’entreprise',
      image: FLOCAGE_IMAGE_URL,
      tag: '✨ Sur-mesure',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. HERO BANNER - Épuré, chaleureux et direct */}
      <section className="bg-gradient-to-b from-[#F9F9F8] to-white border-b border-zinc-200/80 pt-6 sm:pt-10 pb-8 sm:pb-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-bold px-3 py-1.5 rounded-full">
                <Truck className="w-3.5 h-3.5" />
                <span>Livraison express à Dakar en 24h & dans toutes les régions</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
                Le shopping en ligne <br className="hidden sm:inline" />
                <span className="text-[#FF5A1F]">simple et rassurant</span> au Sénégal
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 max-w-xl leading-relaxed">
                Trouvez vos smartphones, appareils maison, montres et vêtements en quelques clics. Payez facilement par <strong>Wave</strong>, <strong>Orange Money</strong> ou <strong>à la livraison</strong> chez vous.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('shop', { categorySlug: 'all' })}
                  className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-[#FF5A1F] text-white text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Voir tous les articles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppContact}
                  className="px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-zinc-950 text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Commander sur WhatsApp</span>
                </button>
              </div>

              {/* 3 simple reassurance items */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Paiement après vérification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pas de carte bancaire obligatoire</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Conseiller disponible 7j/7</span>
                </div>
              </div>
            </div>

            {/* Right visual photo */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 lg:aspect-square bg-zinc-100 border border-zinc-200 shadow-sm">
                <SafeImage
                  src={HERO_BANNER_URL}
                  alt="Articles disponibles sur TerangaMall"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <div className="text-xs font-semibold text-amber-300">Nouveautés 2026</div>
                    <div className="text-lg font-bold">Produits 100% testés et garantis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATÉGORIES VISUELLES & INTUITIVES */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
              Choisissez ce qui vous intéresse
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              Cliquez directement sur une catégorie pour voir les produits
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('shop', { categorySlug: 'all' })}
            className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Tout voir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {visualCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                if (cat.slug === 'flocage') {
                  navigateTo('flocage');
                } else {
                  navigateTo('shop', { categorySlug: cat.slug });
                }
              }}
              className="group cursor-pointer bg-white rounded-2xl border border-zinc-200/90 hover:border-[#FF5A1F] hover:shadow-md transition-all duration-200 p-3.5 flex flex-col justify-between text-left active:scale-98"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-zinc-50 mb-3 border border-zinc-100">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#FF5A1F]">
                  {cat.tag}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-[#FF5A1F] transition-colors leading-snug">
                  {cat.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SÉLECTION POPULAIRE - Pas chargée, très lisible */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-200/80 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
              Nos articles les plus demandés
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Des articles de qualité, disponibles immédiatement pour livraison
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('shop', { categorySlug: 'all' })}
            className="text-xs font-bold text-zinc-900 hover:text-[#FF5A1F] flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Voir toute la boutique</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. COMMENT ÇA MARCHE - Pour les non-tech */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="bg-[#FAF9F7] rounded-3xl border border-zinc-200/80 p-6 sm:p-10 space-y-8">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-950">
              Commander est très facile
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Pas besoin d’inscription compliquée. Vous commandez en moins d'une minute !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-2xs space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5A1F] font-black text-base flex items-center justify-center mx-auto sm:mx-0">
                1
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                Choisissez votre article
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Trouvez le produit qui vous plaît et cliquez sur le bouton pour l'ajouter à votre panier.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-2xs space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5A1F] font-black text-base flex items-center justify-center mx-auto sm:mx-0">
                2
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                Indiquez votre adresse
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Renseignez simplement votre nom, votre numéro de téléphone et votre quartier à Dakar ou en région.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-2xs space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5A1F] font-black text-base flex items-center justify-center mx-auto sm:mx-0">
                3
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                Payez à la réception
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Le livreur vous contacte sous 24h. Vous payez par Wave, Orange Money ou en liquide à la livraison.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AIDE DIRECTE WHATSAPP & TÉLÉPHONE - Rassurant pour les non-tech */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
              <Headphones className="w-4 h-4" />
              <span>Assistance client dévouée</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Vous préférez commander par WhatsApp ?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
              Si vous n'êtes pas à l'aise avec internet, un conseiller s'occupe de tout pour vous par message ou appel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleWhatsAppContact}
              className="px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Écrire sur WhatsApp</span>
            </button>

            <a
              href="tel:+221774501289"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20 transition-all active:scale-98"
            >
              <Phone className="w-4 h-4" />
              <span>+221 77 450 12 89</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
