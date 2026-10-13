import React, { useMemo, useState } from 'react';
import { ChevronRight, Filter, RotateCcw, Search, SlidersHorizontal, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../services/payment';
import { ProductCard } from '../components/ui/ProductCard';
import { normalizeCategorySlug } from '../types';

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    selectedCategorySlug,
    navigateTo,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [priceMax, setPriceMax] = useState<number>(1000000);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedSize, setSelectedSize] = useState<string>('ALL');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyPromo, setOnlyPromo] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<
    'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'bestsellers' | 'rating'
  >('relevance');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Auto-reset size and brand when changing category so valid products are never hidden
  React.useEffect(() => {
    setSelectedSize('ALL');
    setSelectedBrand('ALL');
    setCurrentPage(1);
  }, [selectedCategorySlug]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    const targetSlug = normalizeCategorySlug(selectedCategorySlug);
    const pool =
      selectedCategorySlug && selectedCategorySlug !== 'all'
        ? products.filter(
            (p) => normalizeCategorySlug(p.categorySlug || p.category) === targetSlug
          )
        : products;
    pool.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products, selectedCategorySlug]);

  // Options / Tailles dynamiques adaptées à la catégorie consultée
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    const targetSlug = normalizeCategorySlug(selectedCategorySlug);
    const pool =
      selectedCategorySlug && selectedCategorySlug !== 'all'
        ? products.filter(
            (p) => normalizeCategorySlug(p.categorySlug || p.category) === targetSlug
          )
        : products;

    pool.forEach((p) => {
      p.sizes?.forEach((s) => set.add(s));
    });

    const list = Array.from(set);
    if (list.length === 0) {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '40', '41', '42', '43', '44'];
    }
    return list;
  }, [products, selectedCategorySlug]);

  const filteredProducts = useMemo(() => {
    const targetSlug = normalizeCategorySlug(selectedCategorySlug);

    return products
      .filter((p) => p.status !== 'ARCHIVED')
      .filter((p) => {
        if (selectedCategorySlug && selectedCategorySlug !== 'all') {
          const prodCatSlug = normalizeCategorySlug(p.categorySlug || p.category);
          return prodCatSlug === targetSlug || p.categorySlug === selectedCategorySlug;
        }
        return true;
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      })
      .filter((p) => p.price <= priceMax)
      .filter((p) => (selectedBrand === 'ALL' ? true : p.brand === selectedBrand))
      .filter((p) => (selectedSize === 'ALL' ? true : p.sizes.includes(selectedSize)))
      .filter((p) => (onlyInStock ? p.stock > 0 : true))
      .filter((p) => (onlyPromo ? Boolean(p.oldPrice && p.oldPrice > p.price) : true))
      .filter((p) => p.rating >= minRating)
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        if (sortBy === 'bestsellers')
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [
    products,
    selectedCategorySlug,
    searchQuery,
    priceMax,
    selectedBrand,
    selectedSize,
    onlyInStock,
    onlyPromo,
    minRating,
    sortBy,
  ]);

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    navigateTo('shop', { categorySlug: 'all' });
    setSearchQuery('');
    setPriceMax(1000000);
    setSelectedBrand('ALL');
    setSelectedSize('ALL');
    setOnlyInStock(false);
    setOnlyPromo(false);
    setMinRating(0);
    setSortBy('relevance');
    setCurrentPage(1);
  };

  const activeCategoryName =
    selectedCategorySlug === 'all'
      ? 'Tous les produits'
      : categories.find(
          (c) =>
            c.slug === selectedCategorySlug ||
            c.slug === normalizeCategorySlug(selectedCategorySlug)
        )?.name || 'Catalogue';

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-xs text-[#777777] mb-6">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="hover:text-[#111111] transition-colors"
        >
          Accueil
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          type="button"
          onClick={() => navigateTo('shop', { categorySlug: 'all' })}
          className="hover:text-[#111111] transition-colors"
        >
          Boutique
        </button>
        {selectedCategorySlug !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#111111] font-medium">{activeCategoryName}</span>
          </>
        )}
      </nav>

      {/* Header & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5] mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">
            {activeCategoryName}
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 tabular-nums">
            {filteredProducts.length} article{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''} · Livraison Dakar & Régions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input inside Catalog */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filtrer par mot-clé..."
              className="w-full sm:w-52 pl-9 pr-3 py-2 rounded-lg border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Mobile Filter Trigger */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E5E5E5] text-xs font-semibold text-[#111111]"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#777777] hidden sm:inline" />
            <select
              aria-label="Trier les produits"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3.5 py-2 rounded-lg border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
            >
              <option value="relevance">Tri : Pertinence</option>
              <option value="newest">Nouveautés</option>
              <option value="bestsellers">Meilleures ventes</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            mobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#111111]">Filtres</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#FF5A1F] hover:underline inline-flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-semibold text-[#111111] mb-2.5">Catégorie</h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigateTo('shop', { categorySlug: 'all' });
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategorySlug === 'all'
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'text-[#777777] hover:text-[#111111] hover:bg-white'
                  }`}
                >
                  <span>Toutes les catégories</span>
                  <span className="tabular-nums">{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const isActive =
                    selectedCategorySlug === cat.slug ||
                    normalizeCategorySlug(selectedCategorySlug) === cat.slug;
                  const catCount = products.filter(
                    (p) =>
                      normalizeCategorySlug(p.categorySlug || p.category) === cat.slug
                  ).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        navigateTo('shop', { categorySlug: cat.slug });
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-[#111111] text-white font-semibold'
                          : 'text-[#777777] hover:text-[#111111] hover:bg-white'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="tabular-nums font-mono">{catCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Price Filter */}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#111111]">Budget max</span>
                <span className="font-bold text-[#FF5A1F] tabular-nums">
                  {formatFCFA(priceMax)}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={1000000}
                step={5000}
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#FF5A1F]"
              />
              <div className="flex justify-between text-[11px] text-[#777777] tabular-nums mt-1">
                <span>5 000 FCFA</span>
                <span>1 000 000 FCFA</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <h3 className="text-xs font-semibold text-[#111111] mb-2">Marque</h3>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-xs text-[#111111]"
              >
                <option value="ALL">Toutes les marques</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Size / Option Filter (dynamique selon la catégorie) */}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <h3 className="text-xs font-semibold text-[#111111] mb-2">
                {normalizeCategorySlug(selectedCategorySlug) === 'electronique'
                  ? 'Capacité / Format'
                  : normalizeCategorySlug(selectedCategorySlug) === 'sport'
                  ? 'Pointure / Option'
                  : 'Option / Taille'}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSize('ALL')}
                  className={`px-2.5 py-1 rounded text-xs font-medium border ${
                    selectedSize === 'ALL'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-[#777777] border-[#E5E5E5]'
                  }`}
                >
                  Toutes
                </button>
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border ${
                      selectedSize === sz
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-[#111111] border-[#E5E5E5] hover:border-[#111111]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability & Promo Toggles */}
            <div className="pt-4 border-t border-[#E5E5E5] space-y-2.5">
              <label className="flex items-center gap-2.5 text-xs text-[#111111] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded accent-[#FF5A1F]"
                />
                <span>En stock uniquement</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[#111111] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyPromo}
                  onChange={(e) => setOnlyPromo(e.target.checked)}
                  className="rounded accent-[#FF5A1F]"
                />
                <span>En promotion uniquement</span>
              </label>
            </div>

            {/* Rating Filter */}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <h3 className="text-xs font-semibold text-[#111111] mb-2">Note minimale</h3>
              <div className="flex items-center gap-2">
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMinRating(r)}
                    className={`px-2.5 py-1 rounded-lg border text-xs inline-flex items-center gap-1 ${
                      minRating === r
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-[#111111] border-[#E5E5E5]'
                    }`}
                  >
                    {r === 0 ? (
                      <span>Toutes</span>
                    ) : (
                      <>
                        <Star className="w-3 h-3 fill-[#FF5A1F] text-[#FF5A1F]" />
                        <span className="tabular-nums">{r}+</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Product Grid: Desktop 4 cols (or 3 cols next to sidebar), Tablet 3 cols, Mobile 2 cols */}
        <div className="lg:col-span-9">
          {paginatedProducts.length === 0 ? (
            <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-12 text-center space-y-4">
              <h3 className="text-lg font-bold text-[#111111]">
                Aucun article ne correspond à vos filtres
              </h3>
              <p className="text-sm text-[#777777] max-w-md mx-auto">
                Essayez d’élargir votre budget ou de réinitialiser les filtres pour explorer l’ensemble de notre collection.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-lg bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold transition-colors"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-lg text-xs font-semibold tabular-nums transition-colors ${
                        currentPage === page
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F7F7F5] text-[#111111] hover:bg-[#FFE8DE]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
