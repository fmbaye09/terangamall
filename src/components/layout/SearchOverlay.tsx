import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Clock, Search, Sparkles, TrendingUp, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatFCFA } from '../../services/payment';
import { SafeImage } from '../ui/SafeImage';

export const SearchOverlay: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    categories,
    navigateTo,
    setSearchQuery,
  } = useStore();

  const [localQuery, setLocalQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Maillot Lions',
    'Air Pulse 270',
    'Flocage équipe',
    'Hoodie Sable',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = localQuery.trim().toLowerCase();
  const matchingProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    : products.slice(0, 4);

  const matchingCategories = q
    ? categories.filter((c) => c.name.toLowerCase().includes(q))
    : categories;

  const handleSelectSearchTerm = (term: string) => {
    setLocalQuery(term);
    if (!recentSearches.includes(term)) {
      setRecentSearches((prev) => [term, ...prev.slice(0, 4)]);
    }
  };

  const handleViewAllInShop = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    setIsSearchOpen(false);
    navigateTo('shop', { categorySlug: 'all' });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-4 sm:pt-14 px-4"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleViewAllInShop}
          className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E5E5]"
        >
          <Search className="w-5 h-5 text-[#FF5A1F] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Rechercher un produit, maillot, catégorie (ex: maillot, air, hoodie)..."
            className="w-full text-sm sm:text-base text-[#111111] placeholder-[#777777] focus:outline-none"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => setLocalQuery('')}
              className="text-xs text-[#777777] hover:text-[#111111]"
            >
              Effacer
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Fermer la recherche"
            className="p-1.5 rounded-lg hover:bg-[#F7F7F5] text-[#777777] hover:text-[#111111]"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Search Panel Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Recent Searches & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#777777] mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Recherches récentes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectSearchTerm(term)}
                    className="px-3 py-1.5 rounded-lg bg-[#F7F7F5] hover:bg-[#FFE8DE] hover:text-[#FF5A1F] text-xs font-medium text-[#111111] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#777777] mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Catégories correspondantes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigateTo('shop', { categorySlug: cat.slug });
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E5E5] hover:border-[#111111] text-xs font-medium text-[#111111] transition-colors"
                  >
                    {cat.name} ({cat.productCount})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Matching / Popular Products */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#777777]">
                {q ? `Produits correspondants (${matchingProducts.length})` : 'Produits populaires à Dakar'}
              </span>
              <button
                type="button"
                onClick={handleViewAllInShop}
                className="text-xs font-semibold text-[#FF5A1F] hover:underline inline-flex items-center gap-1"
              >
                <span>Voir tout le catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {matchingProducts.length === 0 ? (
              <div className="py-8 text-center bg-[#F7F7F5] rounded-xl">
                <p className="text-sm font-medium text-[#111111] mb-1">
                  Aucun produit trouvé pour « {localQuery} »
                </p>
                <p className="text-xs text-[#777777] mb-4">
                  Essayez un terme plus général ou personnalisez votre propre vêtement dans notre atelier.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigateTo('flocage');
                  }}
                  className="px-4 py-2 bg-[#FF5A1F] text-white text-xs font-semibold rounded-lg"
                >
                  Découvrir l’Atelier Flocage
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingProducts.slice(0, 6).map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigateTo('product', { productSlug: prod.slug });
                    }}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl border border-[#E5E5E5] hover:border-[#111111] text-left transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#F7F7F5] overflow-hidden shrink-0">
                      <SafeImage
                        src={prod.images[0]}
                        alt={prod.name}
                        sizes="56px"
                        maxWidth={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-[#777777]">{prod.category}</div>
                      <div className="text-sm font-semibold text-[#111111] group-hover:text-[#FF5A1F] truncate">
                        {prod.name}
                      </div>
                      <div className="text-xs font-bold text-[#111111] tabular-nums">
                        {formatFCFA(prod.price)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct Shortcut to Custom Flocage */}
          <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFE8DE] text-[#FF5A1F] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#111111]">
                  Vous cherchez à floquer vos propres maillots ou ceux de votre équipe ?
                </div>
                <div className="text-xs text-[#777777]">
                  Configurateur en direct avec aperçu Nom + Numéro + Logo et remises par volume.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                navigateTo('flocage');
              }}
              className="px-4 py-2 bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Ouvrir le Configurateur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
