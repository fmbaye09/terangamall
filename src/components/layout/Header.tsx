import React, { useState } from 'react';
import {
  Heart,
  LayoutGrid,
  Menu,
  MessageCircle,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Header: React.FC = () => {
  const {
    currentView,
    navigateTo,
    cart,
    wishlistIds,
    setIsSearchOpen,
    selectedCategorySlug,
    categories,
    theme,
    toggleTheme,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCartCount = cart
    .filter((i) => !i.savedForLater)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      'Bonjour TerangaMall Dakar ! J’aimerais avoir une information ou commander un article.'
    );
    window.open(`https://wa.me/221774501289?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* 1. Bandeau de réassurance supérieur, calme et rassurant */}
      <div className="bg-zinc-900 text-white h-9 px-4 sm:px-6 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2 text-zinc-300 truncate">
          <Truck className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />
          <span className="font-medium">
            Livraison 24h à Dakar & partout au Sénégal · Paiement par Wave, OM ou à la livraison
          </span>
        </div>

        <button
          type="button"
          onClick={handleWhatsAppContact}
          className="hidden sm:inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
          <span>Assistance WhatsApp : +221 77 450 12 89</span>
        </button>
      </div>

      {/* 2. Barre principale - Très claire, aérée et intuitive */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-2xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo et menu mobile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="lg:hidden p-2 -ml-2 text-zinc-800 hover:text-zinc-950 rounded-lg active:bg-zinc-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="flex items-baseline gap-1.5 text-left group"
            >
              <span className="text-2xl font-black tracking-tight text-zinc-950 font-display">
                Teranga<span className="text-[#FF5A1F]">Mall</span>
              </span>
            </button>
          </div>

          {/* Barre de recherche simple et accueillante (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center bg-zinc-100/80 hover:bg-zinc-100 border border-zinc-200/90 hover:border-zinc-300 rounded-full px-4 py-2 text-xs text-zinc-500 cursor-pointer transition-all"
            >
              <Search className="w-4 h-4 text-zinc-700 mr-2.5" />
              <span className="flex-1 truncate">
                Que recherchez-vous ? (Téléphone, Air fryer, Habits, Baskets...)
              </span>
              <span className="text-xs font-bold text-white bg-zinc-900 px-3.5 py-1 rounded-full hover:bg-[#FF5A1F] transition-colors">
                Rechercher
              </span>
            </div>
          </div>

          {/* Boutons d'actions clairs à droite */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Recherche Mobile */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Rechercher"
              className="md:hidden p-2 rounded-xl text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bouton direct WhatsApp (Très populaire au Sénégal pour les non-tech) */}
            <button
              type="button"
              onClick={handleWhatsAppContact}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Aide WhatsApp</span>
            </button>

            {/* Mode Sombre Neumorphism Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Basculer en Mode Clair' : 'Activer le Mode Sombre Neumorphism'}
              aria-label="Basculer le mode sombre"
              className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                theme === 'dark'
                  ? 'bg-[#1e222a] text-amber-400 border border-white/10 shadow-[inset_2px_2px_5px_#0f1115,inset_-2px_-2px_5px_#2c323e]'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/90 shadow-2xs'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="hidden lg:inline text-[11px] font-semibold text-amber-300">Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-zinc-700" />
                  <span className="hidden lg:inline text-[11px] font-semibold text-zinc-600">Sombre</span>
                </>
              )}
            </button>

            {/* Bouton Panier très visible */}
            <button
              type="button"
              onClick={() => navigateTo('cart')}
              aria-label="Voir mon panier"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900 text-white hover:bg-[#FF5A1F] active:scale-95 transition-all shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold">Panier</span>
              {activeCartCount > 0 && (
                <span className="min-w-4 h-4 px-1 rounded-full bg-[#FF5A1F] text-white text-[10px] font-black flex items-center justify-center tabular-nums">
                  {activeCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. Navigation par univers simple (Desktop) */}
        <div className="bg-[#FAF9F7] border-t border-zinc-200/70 hidden md:block">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-10 flex items-center gap-6 text-xs font-semibold text-zinc-600 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`py-1 transition-colors ${
                currentView === 'home'
                  ? 'text-[#FF5A1F] font-bold border-b-2 border-[#FF5A1F]'
                  : 'hover:text-zinc-950'
              }`}
            >
              Accueil
            </button>

            <button
              type="button"
              onClick={() => navigateTo('shop', { categorySlug: 'all' })}
              className={`py-1 transition-colors ${
                currentView === 'shop' && selectedCategorySlug === 'all'
                  ? 'text-[#FF5A1F] font-bold border-b-2 border-[#FF5A1F]'
                  : 'hover:text-zinc-950'
              }`}
            >
              Tous les produits
            </button>

            <button
              type="button"
              onClick={() => navigateTo('shop', { categorySlug: 'electronique' })}
              className={`py-1 transition-colors ${
                selectedCategorySlug === 'electronique' && currentView === 'shop'
                  ? 'text-[#FF5A1F] font-bold border-b-2 border-[#FF5A1F]'
                  : 'hover:text-zinc-950'
              }`}
            >
              High-Tech & Téléphonie
            </button>

            <button
              type="button"
              onClick={() => navigateTo('shop', { categorySlug: 'sport' })}
              className={`py-1 transition-colors ${
                selectedCategorySlug === 'sport' && currentView === 'shop'
                  ? 'text-[#FF5A1F] font-bold border-b-2 border-[#FF5A1F]'
                  : 'hover:text-zinc-950'
              }`}
            >
              Montres & Audio
            </button>

            <button
              type="button"
              onClick={() => navigateTo('shop', { categorySlug: 'maison' })}
              className={`py-1 transition-colors ${
                selectedCategorySlug === 'maison' && currentView === 'shop'
                  ? 'text-[#FF5A1F] font-bold border-b-2 border-[#FF5A1F]'
                  : 'hover:text-zinc-950'
              }`}
            >
              Maison & Cuisine
            </button>

            <button
              type="button"
              onClick={() => navigateTo('shop', { categorySlug: 'mode' })}
              className={`py-1 transition-colors ${
                selectedCategorySlug === 'mode' && currentView === 'shop'
                  ? 'text-[#FF5A1F] font-bold border-b-2 border-[#FF5A1F]'
                  : 'hover:text-zinc-950'
              }`}
            >
              Mode & Baskets
            </button>

            <button
              type="button"
              onClick={() => navigateTo('flocage')}
              className={`py-1 transition-colors flex items-center gap-1 ${
                currentView.startsWith('flocage')
                  ? 'text-[#FF5A1F] font-bold border-b-2 border-[#FF5A1F]'
                  : 'hover:text-zinc-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Personnalisation & Flocage</span>
            </button>
          </div>
        </div>
      </header>

      {/* 4. Menu Tiroir Mobile - Épuré, lisible et rassurant */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Entête du menu */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <span className="text-xl font-black text-zinc-950">
                Teranga<span className="text-[#FF5A1F]">Mall</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Catégories claires */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Menu de navigation
              </div>

              <div className="space-y-1.5 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('home');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-900"
                >
                  🏠 Accueil
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('shop', { categorySlug: 'all' });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-900"
                >
                  🛍️ Tous les articles
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('shop', { categorySlug: 'electronique' });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-900"
                >
                  📱 High-Tech & Téléphones
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('shop', { categorySlug: 'sport' });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-900"
                >
                  ⌚ Montres & Audio
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('shop', { categorySlug: 'maison' });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-900"
                >
                  🍳 Maison & Cuisine
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('shop', { categorySlug: 'mode' });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-900"
                >
                  👟 Mode & Baskets
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('flocage');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-orange-50 text-[#FF5A1F] font-bold"
                >
                  ✨ Atelier Flocage & Pros
                </button>
              </div>

              <div className="pt-3 border-t border-zinc-200 space-y-1.5 text-xs text-zinc-600">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('order-tracking');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Suivre ma commande</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('account');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-zinc-700" />
                  <span>Mon compte client</span>
                </button>

                {/* Neumorphic Dark Mode switch */}
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 flex items-center justify-between font-semibold"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-zinc-700" />
                    )}
                    <span>Mode Sombre (Neumorphism)</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    theme === 'dark' ? 'bg-amber-400/20 text-amber-400' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {theme === 'dark' ? 'Activé' : 'Désactivé'}
                  </span>
                </button>
              </div>
            </div>

            {/* Assistance WhatsApp en bas du tiroir mobile */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-2">
              <button
                type="button"
                onClick={handleWhatsAppContact}
                className="w-full py-3 rounded-xl bg-[#25D366] text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Commander sur WhatsApp</span>
              </button>
              <p className="text-[11px] text-zinc-500 text-center">
                Livraison à Dakar sous 24h · Paiement Wave & OM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Barre mobile inférieure ergonomique & ultra-intuitive (4 onglets indispensables) */}
      <nav
        aria-label="Navigation mobile"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-zinc-200 grid grid-cols-4 items-center px-1 select-none shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      >
        {/* Tab 1: Accueil */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentView === 'home' ? 'text-[#FF5A1F]' : 'text-zinc-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Accueil</span>
          {currentView === 'home' && (
            <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-[#FF5A1F]" />
          )}
        </button>

        {/* Tab 2: Produits */}
        <button
          type="button"
          onClick={() => navigateTo('shop', { categorySlug: 'all' })}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentView === 'shop' ? 'text-[#FF5A1F]' : 'text-zinc-500'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Produits</span>
          {currentView === 'shop' && (
            <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-[#FF5A1F]" />
          )}
        </button>

        {/* Tab 3: Panier */}
        <button
          type="button"
          onClick={() => navigateTo('cart')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentView === 'cart' ? 'text-[#FF5A1F]' : 'text-zinc-500'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {activeCartCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#FF5A1F] text-white text-[9px] font-black flex items-center justify-center tabular-nums">
                {activeCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Panier</span>
          {currentView === 'cart' && (
            <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-[#FF5A1F]" />
          )}
        </button>

        {/* Tab 4: Aide WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsAppContact}
          className="flex flex-col items-center justify-center py-1 text-[#128C7E] transition-colors relative"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Aide WhatsApp</span>
        </button>
      </nav>
    </>
  );
};
