import React, { useState } from 'react';
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../services/payment';
import { FlocagePreview } from '../components/flocage/FlocagePreview';

export const FlocageSeulPage: React.FC = () => {
  const {
    navigateTo,
    flocagePricing,
    calculateVolumeDiscountPct,
    addToCartFlocage,
  } = useStore();

  // ÉTAPE 1 : Type de vêtement
  const [garmentType, setGarmentType] = useState<'Maillot' | 'T-shirt' | 'Autre'>('Maillot');
  const [garmentBgColor, setGarmentBgColor] = useState<string>('#111111');

  // ÉTAPE 2 : Personnalisation Nom & Numéro
  const [customName, setCustomName] = useState<string>('MBAYE');
  const [customNumber, setCustomNumber] = useState<string>('10');

  // ÉTAPE 3 : Style (Police, Couleur, Position)
  const [fontStyle, setFontStyle] = useState<string>(
    flocagePricing.availableFonts[2] || 'Football Pro'
  );
  const [selectedColorObj, setSelectedColorObj] = useState(
    flocagePricing.availableColors[0] || { name: 'Blanc', hex: '#FFFFFF' }
  );
  const [position, setPosition] = useState<'Dos' | 'Poitrine' | 'Manche' | 'Autre'>('Dos');

  // ÉTAPE 4 : Logo / Sponsor (PNG, JPG, SVG)
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [logoName, setLogoName] = useState<string>('');

  // ÉTAPE 5 : Quantité
  const [quantity, setQuantity] = useState<number>(1);

  // ÉTAPE 6 : Mode de dépôt
  const [depositMode, setDepositMode] = useState<
    'DEPOT_ATELIER' | 'RECUPERATION_LIVRAISON'
  >('DEPOT_ATELIER');

  // Calcul dynamique du prix depuis la base de données (flocagePricing)
  const hasName = customName.trim().length > 0;
  const hasNumber = customNumber.trim().length > 0;
  const hasLogo = Boolean(logoDataUrl);

  const nameCost = hasName ? flocagePricing.namePrice : 0;
  const numberCost = hasNumber ? flocagePricing.numberPrice : 0;
  const logoCost = hasLogo ? flocagePricing.logoPrice : 0;

  const positionSupplement =
    position === 'Dos'
      ? flocagePricing.positionPrices.dos
      : position === 'Poitrine'
      ? flocagePricing.positionPrices.poitrine
      : position === 'Manche'
      ? flocagePricing.positionPrices.manche
      : flocagePricing.positionPrices.autre;

  const unitBasePrice = nameCost + numberCost + logoCost + positionSupplement;
  const discountPercent = calculateVolumeDiscountPct(quantity);
  const subtotalBeforeDiscount = unitBasePrice * quantity;
  const discountAmount = Math.round((subtotalBeforeDiscount * discountPercent) / 100);
  const pickupFee =
    depositMode === 'RECUPERATION_LIVRAISON' ? flocagePricing.pickupDeliveryFee : 0;

  const totalPrice = Math.max(0, subtotalBeforeDiscount - discountAmount + pickupFee);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = () => {
    if (!hasName && !hasNumber && !hasLogo) return;

    addToCartFlocage({
      id: `floc-seul-${Date.now()}`,
      mode: 'SEUL',
      garmentType,
      customName: customName.trim(),
      customNumber: customNumber.trim(),
      fontStyle,
      textColor: selectedColorObj.name,
      textColorHex: selectedColorObj.hex,
      position,
      hasLogo,
      logoDataUrl,
      logoName: logoName || undefined,
      depositMode,
      quantity,
      unitPrice: unitBasePrice,
      discountPercent,
      totalPrice,
      createdAt: new Date().toLocaleDateString('fr-FR'),
    });

    navigateTo('cart');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-xs text-[#777777] mb-6">
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
          onClick={() => navigateTo('flocage')}
          className="hover:text-[#111111]"
        >
          Flocage
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111111] font-medium">Flocage Seul</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5] mb-8">
        <div>
          <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
            Configurateur Individuel · URL : /flocage/seul
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">
            Flocage sur votre propre vêtement
          </h1>
          <p className="text-sm text-[#777777] mt-1">
            Vous avez déjà un maillot ou un T-shirt ? Apportez-le-nous et choisissez votre personnalisation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('flocage-lot')}
          className="px-4 py-2.5 rounded-xl border border-[#111111] text-xs font-semibold text-[#111111] hover:bg-[#111111] hover:text-white transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Passer au Flocage en Lot (Équipes) →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left: 6-Step Configurator */}
        <div className="lg:col-span-7 space-y-6">
          {/* ÉTAPE 1 : Type de vêtement */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#111111]">
              Étape 1 · Type de vêtement à floquer
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(['Maillot', 'T-shirt', 'Autre'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGarmentType(type)}
                  className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    garmentType === type
                      ? 'border-[#FF5A1F] bg-[#FFE8DE] text-[#FF5A1F]'
                      : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111] hover:border-[#111111]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <span className="block text-xs text-[#777777] mb-2">
                Couleur de votre vêtement (pour l’aperçu) :
              </span>
              <div className="flex items-center gap-2.5">
                {[
                  { label: 'Noir', hex: '#111111' },
                  { label: 'Vert Lions', hex: '#0E5A36' },
                  { label: 'Blanc', hex: '#FFFFFF' },
                  { label: 'Bleu Nuit', hex: '#1E3A8A' },
                  { label: 'Rouge', hex: '#991B1B' },
                ].map((bg) => (
                  <button
                    key={bg.hex}
                    type="button"
                    onClick={() => setGarmentBgColor(bg.hex)}
                    title={bg.label}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      garmentBgColor === bg.hex
                        ? 'border-[#FF5A1F] scale-110'
                        : 'border-[#E5E5E5]'
                    }`}
                    style={{ backgroundColor: bg.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ÉTAPE 2 : Personnalisation Nom & Numéro */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#111111]">
              Étape 2 · Personnalisation (Nom & Numéro)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-semibold text-[#111111]">Nom à floquer</label>
                  <span className="text-[#FF5A1F] font-semibold tabular-nums">
                    +{formatFCFA(flocagePricing.namePrice)}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={14}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: MBAYE"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm font-semibold uppercase focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-semibold text-[#111111]">Numéro</label>
                  <span className="text-[#FF5A1F] font-semibold tabular-nums">
                    +{formatFCFA(flocagePricing.numberPrice)}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={3}
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ex: 10"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm font-bold tabular-nums focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>
          </div>

          {/* ÉTAPE 3 : Style (Police, Couleur, Position) */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-5">
            <h2 className="text-sm font-bold text-[#111111]">
              Étape 3 · Style, Couleur & Position
            </h2>

            {/* Police */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2">
                Police de caractère
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {flocagePricing.availableFonts.map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setFontStyle(font)}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      fontStyle === font
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            {/* Couleur du flocage */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2">
                Couleur du flocage : <span className="text-[#777777]">{selectedColorObj.name}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {flocagePricing.availableColors.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColorObj(col)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      selectedColorObj.name === col.name
                        ? 'border-[#FF5A1F] bg-[#FFE8DE] text-[#111111] font-semibold'
                        : 'border-[#E5E5E5] bg-white text-[#111111]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2">
                Position sur le vêtement
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Dos', 'Poitrine', 'Manche', 'Autre'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      position === pos
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ÉTAPE 4 : Logo / Sponsor */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#111111]">
                Étape 4 · Logo ou Sponsor (Optionnel)
              </h2>
              <span className="text-xs font-semibold text-[#FF5A1F] tabular-nums">
                +{formatFCFA(flocagePricing.logoPrice)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="flex-1 w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-[#E5E5E5] hover:border-[#111111] bg-[#F7F7F5] cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-[#FF5A1F] shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#111111] truncate">
                    {logoName || 'Importer un fichier PNG, JPG ou SVG'}
                  </div>
                  <div className="text-[11px] text-[#777777]">
                    Haute résolution recommandée · Affichage direct sur l’aperçu
                  </div>
                </div>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {logoDataUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoDataUrl(undefined);
                    setLogoName('');
                  }}
                  className="px-3.5 py-2 rounded-lg border border-[#E5E5E5] text-xs text-red-600 hover:bg-red-50"
                >
                  Retirer le logo
                </button>
              )}
            </div>
          </div>

          {/* ÉTAPE 5 & 6 : Quantité & Mode de dépôt */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#111111] mb-3">
                Étape 5 · Quantité
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E5E5E5] rounded-xl bg-[#F7F7F5] h-11 px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-[#111111]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#111111]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-[#FF5A1F] tabular-nums">
                    Remise volume appliquée : -{discountPercent}%
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5E5]">
              <h2 className="text-sm font-bold text-[#111111] mb-3">
                Étape 6 · Mode de dépôt du vêtement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepositMode('DEPOT_ATELIER')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    depositMode === 'DEPOT_ATELIER'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111]'
                  }`}
                >
                  <div className="text-xs font-bold mb-1">
                    Je vais déposer mon vêtement
                  </div>
                  <div
                    className={`text-[11px] ${
                      depositMode === 'DEPOT_ATELIER' ? 'text-white/75' : 'text-[#777777]'
                    }`}
                  >
                    Dépôt gratuit à l’Atelier Point E, Dakar
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMode('RECUPERATION_LIVRAISON')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    depositMode === 'RECUPERATION_LIVRAISON'
                      ? 'border-[#FF5A1F] bg-[#FFE8DE] text-[#111111]'
                      : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span>Récupération & Livraison</span>
                    <span className="text-[#FF5A1F] tabular-nums">
                      +{formatFCFA(flocagePricing.pickupDeliveryFee)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#777777]">
                    Un coursier récupère et vous relivre à Dakar
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sticky Live Preview & Dynamic Price Breakdown */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <FlocagePreview
            garmentType={garmentType}
            garmentBgColor={garmentBgColor}
            playerName={customName}
            playerNumber={customNumber}
            fontStyle={fontStyle}
            textColorHex={selectedColorObj.hex}
            position={position}
            logoDataUrl={logoDataUrl}
          />

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#111111]">
              Estimation tarifaire en direct
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm border-b border-[#E5E5E5] pb-4">
              {hasName && (
                <div className="flex justify-between">
                  <span className="text-[#777777]">Flocage nom ({customName})</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {formatFCFA(nameCost)}
                  </span>
                </div>
              )}
              {hasNumber && (
                <div className="flex justify-between">
                  <span className="text-[#777777]">Numéro ({customNumber})</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {formatFCFA(numberCost)}
                  </span>
                </div>
              )}
              {hasLogo && (
                <div className="flex justify-between">
                  <span className="text-[#777777]">Logo personnalisé</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {formatFCFA(logoCost)}
                  </span>
                </div>
              )}
              {positionSupplement > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#777777]">Supplément position ({position})</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {formatFCFA(positionSupplement)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-[#777777]">Quantité</span>
                <span className="font-semibold text-[#111111] tabular-nums">
                  × {quantity}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FF5A1F] font-semibold">
                  <span>Remise volume (-{discountPercent}%)</span>
                  <span className="tabular-nums">-{formatFCFA(discountAmount)}</span>
                </div>
              )}
              {pickupFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#777777]">Collecte & Relivraison Dakar</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {formatFCFA(pickupFee)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-[#111111]">TOTAL ESTIMÉ</span>
              <span className="text-2xl font-bold text-[#FF5A1F] tabular-nums">
                {formatFCFA(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>AJOUTER AU PANIER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
