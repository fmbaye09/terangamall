import {
  CategoryItem,
  Coupon,
  Customer,
  CustomerAddress,
  FlocagePricingConfig,
  Order,
  Product,
  ProductVariantItem,
  QuoteRequest,
  TieredDiscount,
} from '../types';

export const HERO_BANNER_URL = '/images/marketplace_hero_banner_1791237117872.jpg';
export const SMARTPHONE_IMAGE_URL = '/images/product_smartphone_pro_1791237127740.jpg';
export const PHONE_BLACK_TITANIUM_IMAGE_URL = '/images/phone_black_titanium_1791748499613.jpg';
export const PHONE_OCEAN_BLUE_IMAGE_URL = '/images/phone_ocean_blue_1791748484150.jpg';
export const EARBUDS_IMAGE_URL = '/images/product_earbuds_anc_1791237137291.jpg';
export const SMARTWATCH_IMAGE_URL = '/images/product_smartwatch_ultra_1791249417687.jpg';
export const SMARTWATCH_STEALTH_BLACK_IMAGE_URL = '/images/smartwatch_stealth_black_1791748516094.jpg';
export const SNEAKER_BLACK_IMAGE_URL = '/images/sneakers_all_black_1791748534181.jpg';
export const SPEAKER_IMAGE_URL = '/images/bluetooth_speaker_waterproof_1791748551617.jpg';
export const AIRFRYER_IMAGE_URL = '/images/product_airfryer_kitchen_1791237321177.jpg';
export const HOODIE_IMAGE_URL = '/images/product_premium_hoodie_1791068836590.jpg';
export const SNEAKER_IMAGE_URL = '/images/product_sneakers_air_1791068845803.jpg';
export const HERO_IMAGE_URL = '/images/hero_senegal_streetwear_1791068816383.jpg';
export const FLOCAGE_IMAGE_URL = '/images/product_custom_flocage_1791068854877.jpg';
export const JERSEY_IMAGE_URL = '/images/product_football_jersey_1791068826751.jpg';

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-electronique',
    name: 'Électronique & High-Tech',
    slug: 'electronique',
    subtitle: 'Smartphones, Audio & Objets connectés',
    productCount: 184,
    image: SMARTPHONE_IMAGE_URL,
    accentColor: '#0284C7',
  },
  {
    id: 'cat-maison',
    name: 'Maison & Électroménager',
    slug: 'maison',
    subtitle: 'Air Fryer, Mixeurs, Confort & Literie',
    productCount: 112,
    image: AIRFRYER_IMAGE_URL,
    accentColor: '#D97706',
  },
  {
    id: 'cat-mode',
    name: 'Mode & Habillement',
    slug: 'mode',
    subtitle: 'Streetwear Dakar, Hoodies & Tendance',
    productCount: 245,
    image: HOODIE_IMAGE_URL,
    accentColor: '#9333EA',
  },
  {
    id: 'cat-sport',
    name: 'Sports, Fitness & Baskets',
    slug: 'sport',
    subtitle: 'Sneakers, Running & Équipements',
    productCount: 96,
    image: SNEAKER_IMAGE_URL,
    accentColor: '#FF5A1F',
  },
  {
    id: 'cat-beaute',
    name: 'Beauté, Santé & Soins',
    slug: 'beaute',
    subtitle: 'Karité bio, Tondeuses & Bien-être',
    productCount: 78,
    image: HERO_IMAGE_URL,
    accentColor: '#EC4899',
  },
  {
    id: 'cat-auto',
    name: 'Auto, Bricolage & Énergie',
    slug: 'auto',
    subtitle: 'Outillage pro, Accessoires & Kits solaires',
    productCount: 65,
    image: SMARTPHONE_IMAGE_URL,
    accentColor: '#4B5563',
  },
  {
    id: 'cat-flocage',
    name: 'Personnalisation & Flocage Pro',
    slug: 'flocage',
    subtitle: 'Atelier Textile, Goodies & Séries Entreprise',
    productCount: 42,
    image: FLOCAGE_IMAGE_URL,
    accentColor: '#111111',
  },
];

export function buildVariantsMatrix(
  baseSku: string,
  basePrice: number,
  sizes: string[],
  colors: { name: string; hex: string; image?: string }[],
  priceDeltas?: Record<string, number>,
  baseOldPrice?: number
): ProductVariantItem[] {
  const variants: ProductVariantItem[] = [];
  sizes.forEach((sz, sIdx) => {
    colors.forEach((col, cIdx) => {
      const colorShort = col.name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
      const seed = (sIdx + 1) * (cIdx + 2);
      const stock = (seed % 14) + 4; // Stock réaliste par variante
      const delta = (priceDeltas && priceDeltas[sz]) || 0;
      const variantPrice = basePrice + delta;

      // Calcul cohérent de l'ancien prix barré pour la variante
      let variantOldPrice: number | undefined = undefined;
      if (baseOldPrice && baseOldPrice > basePrice) {
        const ratio = baseOldPrice / basePrice;
        // Prix barré proportionnel ajusté
        const proportionalOld = Math.round((variantPrice * ratio) / 500) * 500;
        variantOldPrice = Math.max(proportionalOld, variantPrice + 1000);
      }

      variants.push({
        id: `var-${baseSku}-${col.name}-${sz}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        size: sz,
        color: col.name,
        colorHex: col.hex,
        sku: `${baseSku}-${colorShort}-${sz}`,
        price: variantPrice,
        oldPrice: variantOldPrice,
        stock,
        image: col.image,
        active: true,
      });
    });
  });
  return variants;
}

const DEFAULT_TIERED_DISCOUNTS: TieredDiscount[] = [
  { minQty: 2, discountPct: 5 },
  { minQty: 5, discountPct: 10 },
  { minQty: 10, discountPct: 15 },
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. High-Tech: Flagship Smartphone
  {
    id: 'prod-tech-1',
    name: 'Smartphone Titanium Ultra 5G – 120Hz AMOLED & Triple Capteur Leica',
    slug: 'smartphone-titanium-ultra-5g',
    description:
      'Le summum de la technologie mobile : châssis en titane brossé de qualité aérospatiale, écran incurvé AMOLED LTPO 120Hz et processeur dernière génération octocœur. Batterie haute densité 5500 mAh compatible charge ultra-rapide 67W, parfaitement optimisée pour les réseaux Orange et Free Sénégal.',
    features: [
      'Écran AMOLED 6.78 pouces 2K 120Hz avec verre Gorilla Glass Armor anti-rayures',
      'Triple module photo 50MP grand-angle avec stabilisation optique OIS',
      'Batterie 5500 mAh avec charge rapide 67W (50% en 15 minutes)',
      'Double SIM 5G compatible réseaux sénégalais + eSIM intégrée',
      'Garantie constructeur 24 mois avec SAV agréé à Dakar Plateau',
    ],
    price: 345000,
    oldPrice: 420000,
    stock: 24,
    sku: 'TM-TEL-TITAN',
    category: 'Électronique & High-Tech',
    categorySlug: 'electronique',
    brand: 'Novacell Global',
    images: [SMARTPHONE_IMAGE_URL, PHONE_BLACK_TITANIUM_IMAGE_URL, PHONE_OCEAN_BLUE_IMAGE_URL, EARBUDS_IMAGE_URL],
    sizes: ['128 Go', '256 Go', '512 Go'],
    colors: [
      { name: 'Titane Naturel', hex: '#8E8D8A', image: SMARTPHONE_IMAGE_URL },
      { name: 'Noir Sidéral', hex: '#1C1C1E', image: PHONE_BLACK_TITANIUM_IMAGE_URL },
      { name: 'Bleu Océan', hex: '#1E3A8A', image: PHONE_OCEAN_BLUE_IMAGE_URL },
    ],
    badge: 'Bestseller',
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 384,
    status: 'ACTIVE',
    weightKg: 0.21,
    tieredDiscounts: [
      { minQty: 2, discountPct: 4 },
      { minQty: 5, discountPct: 8 },
    ],
    variants: buildVariantsMatrix(
      'TM-TEL-TITAN',
      345000,
      ['128 Go', '256 Go', '512 Go'],
      [
        { name: 'Titane Naturel', hex: '#8E8D8A', image: SMARTPHONE_IMAGE_URL },
        { name: 'Noir Sidéral', hex: '#1C1C1E', image: PHONE_BLACK_TITANIUM_IMAGE_URL },
        { name: 'Bleu Océan', hex: '#1E3A8A', image: PHONE_OCEAN_BLUE_IMAGE_URL },
      ],
      { '128 Go': 0, '256 Go': 40000, '512 Go': 90000 },
      420000
    ),
    reviews: [
      {
        id: 'rev-tel-1',
        author: 'Babacar Ndiaye',
        role: 'Ingénieur Télécom',
        city: 'Dakar, Mermoz',
        rating: 5,
        comment:
          'Livraison reçue en 2h chrono par Dakar Express. Le téléphone est magnifique, la charge 67W est indispensable à Dakar et les photos de nuit sont spectaculaires.',
        date: '02 Octobre 2026',
      },
      {
        id: 'rev-tel-2',
        author: 'Fatou Bintou Sow',
        role: 'Créatrice de contenu',
        city: 'Dakar, Almadies',
        rating: 5,
        comment: 'Très belle boutique ! J’ai payé avec Wave en un scan, produit 100% authentique avec facture.',
        date: '28 Septembre 2026',
      },
    ],
  },

  // 2. High-Tech: Montre Connectée Ultra Titanium
  {
    id: 'prod-watch-1',
    name: 'Montre Connectée Ultra Titanium 49mm – Écran AMOLED Saphir & GPS Précision',
    slug: 'montre-connectee-ultra-titanium',
    description:
      'Smartwatch d’aventure et de performance sportive en titane de grade aérospatial. Écran tactile ultra-lumineux AMOLED 2.1 pouces lisible sous le soleil dakarois, autonomie jusqu’à 7 jours, suivi cardiaque en temps réel et appels Bluetooth HD intégrés.',
    features: [
      'Boîtier 49mm en titane massif résistant aux chocs et rayures (étanche 50m)',
      'Écran AMOLED 2.1 pouces 3000 nits avec verre en cristal de saphir',
      'Suivi de santé continu : ECG, SpO2, fréquence cardiaque, sommeil et stress',
      'Haut-parleur et micro intégrés pour passer et recevoir des appels',
      'Compatible Android et iPhone avec autonomie batterie de 5 à 7 jours',
    ],
    price: 45000,
    oldPrice: 62000,
    stock: 45,
    sku: 'TM-WCH-ULTRA',
    category: 'Électronique & High-Tech',
    categorySlug: 'electronique',
    brand: 'Apex Tech',
    images: [SMARTWATCH_IMAGE_URL, SMARTWATCH_STEALTH_BLACK_IMAGE_URL, SMARTPHONE_IMAGE_URL],
    sizes: ['Boîtier 49mm Standard', 'Pack Duo avec 2 Bracelets'],
    colors: [
      { name: 'Orange Sport', hex: '#FF5A1F', image: SMARTWATCH_IMAGE_URL },
      { name: 'Noir Furtif', hex: '#111111', image: SMARTWATCH_STEALTH_BLACK_IMAGE_URL },
      { name: 'Titane Gris', hex: '#8E8D8A', image: SMARTWATCH_IMAGE_URL },
    ],
    badge: 'Bestseller',
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 246,
    status: 'ACTIVE',
    weightKg: 0.18,
    tieredDiscounts: DEFAULT_TIERED_DISCOUNTS,
    variants: buildVariantsMatrix(
      'TM-WCH-ULTRA',
      45000,
      ['Boîtier 49mm Standard', 'Pack Duo avec 2 Bracelets'],
      [
        { name: 'Orange Sport', hex: '#FF5A1F', image: SMARTWATCH_IMAGE_URL },
        { name: 'Noir Furtif', hex: '#111111', image: SMARTWATCH_STEALTH_BLACK_IMAGE_URL },
        { name: 'Titane Gris', hex: '#8E8D8A', image: SMARTWATCH_IMAGE_URL },
      ],
      { 'Boîtier 49mm Standard': 0, 'Pack Duo avec 2 Bracelets': 8000 },
      62000
    ),
    reviews: [
      {
        id: 'rev-wch-1',
        author: 'Cheikh Sarr',
        role: 'Consultant',
        city: 'Dakar, Plateau',
        rating: 5,
        comment: 'Écran ultra-lumineux en plein soleil. Les notifications WhatsApp et appels fonctionnent parfaitement.',
        date: '03 Octobre 2026',
      },
    ],
  },

  // 3. High-Tech: Écouteurs sans fil ANC
  {
    id: 'prod-tech-2',
    name: 'Écouteurs Sans Fil Pro Pulse ANC – Réduction de Bruit Active 42dB',
    slug: 'ecouteurs-pro-pulse-anc',
    description:
      'Immersion sonore totale grâce aux transducteurs en graphène 12mm et à la réduction active du bruit ambiant. Idéal pour les transports dakarois (BRT, TER, embouteillages) et le sport avec résistance IPX5 à la sueur et la poussière.',
    features: [
      'Réduction active hybride du bruit jusqu’à 42dB avec mode transparence',
      'Autonomie totale de 36 heures avec boîtier de charge USB-C',
      'Microphones à suppression de souffle par IA pour appels vocaux limpides',
      'Connexion Bluetooth 5.4 multi-points (PC + Téléphone simultanément)',
    ],
    price: 38000,
    oldPrice: 55000,
    stock: 58,
    sku: 'TM-AUD-PULSE',
    category: 'Électronique & High-Tech',
    categorySlug: 'electronique',
    brand: 'AcousticLab',
    images: [EARBUDS_IMAGE_URL, SMARTPHONE_IMAGE_URL],
    sizes: ['Standard'],
    colors: [
      { name: 'Noir Mat', hex: '#111111', image: EARBUDS_IMAGE_URL },
      { name: 'Blanc Ivoire', hex: '#F3F4F6', image: SMARTPHONE_IMAGE_URL },
    ],
    badge: 'Promo',
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 219,
    status: 'ACTIVE',
    weightKg: 0.12,
    tieredDiscounts: DEFAULT_TIERED_DISCOUNTS,
    variants: buildVariantsMatrix(
      'TM-AUD-PULSE',
      38000,
      ['Standard'],
      [
        { name: 'Noir Mat', hex: '#111111', image: EARBUDS_IMAGE_URL },
        { name: 'Blanc Ivoire', hex: '#F3F4F6', image: SMARTPHONE_IMAGE_URL },
      ],
      undefined,
      55000
    ),
    reviews: [
      {
        id: 'rev-aud-1',
        author: 'Ousmane Ba',
        role: 'Étudiant UCAD',
        city: 'Dakar, Fann',
        rating: 5,
        comment: 'La réduction de bruit est top pour réviser à la bibliothèque ou dans le bus. Rapport qualité-prix imbattable.',
        date: '25 Septembre 2026',
      },
    ],
  },

  // 4. High-Tech: Enceinte Bluetooth Waterproof BassBoost 360°
  {
    id: 'prod-tech-3',
    name: 'Enceinte Bluetooth Sans Fil Aura Wave 360° – Son Stéréo 30W & Étanche IPX7',
    slug: 'enceinte-bluetooth-aura-wave-360',
    description:
      'Enceinte nomade puissante avec diffusion acoustique à 360 degrés et radiateurs passifs BassBoost. Parfaite pour la plage des Almadies, les sorties à Saly ou les soirées à la maison avec une autonomie de 20 heures et recharge rapide USB-C.',
    features: [
      'Puissance sonore 30W RMS avec clarté vocale HD et basses profondes',
      'Certification d’étanchéité totale IPX7 (résiste à l’immersion et au sable)',
      'Batterie longue durée 5200 mAh (jusqu’à 20 heures d’écoute non-stop)',
      'Fonction Powerbank intégrée pour recharger votre smartphone en déplacement',
      'Mode TWS pour jumeler deux enceintes en véritable son stéréo sans fil',
    ],
    price: 29000,
    oldPrice: 42000,
    stock: 38,
    sku: 'TM-AUD-AURA360',
    category: 'Électronique & High-Tech',
    categorySlug: 'electronique',
    brand: 'AcousticLab',
    images: [SPEAKER_IMAGE_URL, EARBUDS_IMAGE_URL],
    sizes: ['Standard 30W'],
    colors: [
      { name: 'Noir Carbone', hex: '#1C1C1E', image: SPEAKER_IMAGE_URL },
      { name: 'Gris Métallique', hex: '#6B7280', image: SPEAKER_IMAGE_URL },
    ],
    badge: 'New',
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 74,
    status: 'ACTIVE',
    weightKg: 0.65,
    tieredDiscounts: DEFAULT_TIERED_DISCOUNTS,
    variants: buildVariantsMatrix(
      'TM-AUD-AURA360',
      29000,
      ['Standard 30W'],
      [
        { name: 'Noir Carbone', hex: '#1C1C1E', image: SPEAKER_IMAGE_URL },
        { name: 'Gris Métallique', hex: '#6B7280', image: SPEAKER_IMAGE_URL },
      ],
      undefined,
      42000
    ),
    reviews: [
      {
        id: 'rev-spk-1',
        author: 'Alioune Badara Diouf',
        role: 'Photographe',
        city: 'Dakar, Ouakam',
        rating: 5,
        comment: 'Super puissance pour sa taille ! Le son est très clair et les basses sont bien présentes.',
        date: '04 Octobre 2026',
      },
    ],
  },

  // 5. Maison & Électroménager: Air Fryer XXL 6.5L
  {
    id: 'prod-app-1',
    name: 'Friteuse Sans Huile Air Fryer Digital 6.5L – Écran Tactile 8 Programmes',
    slug: 'air-fryer-digital-xxl-6-5l',
    description:
      'Cuisinez vos grillades, beignets, pastels, poulets rôtis et frites croustillantes avec 85% d’huile en moins. Sa cuve XXL anti-adhésive de 6.5 litres permet de cuire un poulet entier ou un repas complet pour 6 à 8 personnes en un tour de main.',
    features: [
      'Grande capacité familiale 6.5L (jusqu’à 1.8 kg d’aliments)',
      'Circulation d’air chaud 360° thermo-dynamique 1800W',
      '8 programmes prédéfinis : frites, viandes, poissons, crevettes, pâtisseries',
      'Cuve amovible avec revêtement anti-adhésif sans PFOA lavable au lave-vaisselle',
      'Plage de température réglable de 80°C à 200°C avec minuteur automatique',
    ],
    price: 49000,
    oldPrice: 68000,
    stock: 32,
    sku: 'TM-ELC-AIRFRY',
    category: 'Maison & Électroménager',
    categorySlug: 'maison',
    brand: 'MasterCook Pro',
    images: [AIRFRYER_IMAGE_URL, HERO_BANNER_URL],
    sizes: ['4.5 Litres (Compact)', '6.5 Litres (Familial)', '8.5 Litres (Double Bac)'],
    colors: [
      { name: 'Noir Onyx & Inox', hex: '#111111', image: AIRFRYER_IMAGE_URL },
      { name: 'Blanc & Doré Luxe', hex: '#F9FAFB', image: AIRFRYER_IMAGE_URL },
    ],
    badge: 'Bestseller',
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 167,
    status: 'ACTIVE',
    weightKg: 5.4,
    tieredDiscounts: DEFAULT_TIERED_DISCOUNTS,
    variants: buildVariantsMatrix(
      'TM-ELC-AIRFRY',
      49000,
      ['4.5 Litres (Compact)', '6.5 Litres (Familial)', '8.5 Litres (Double Bac)'],
      [
        { name: 'Noir Onyx & Inox', hex: '#111111', image: AIRFRYER_IMAGE_URL },
        { name: 'Blanc & Doré Luxe', hex: '#F9FAFB', image: AIRFRYER_IMAGE_URL },
      ],
      { '4.5 Litres (Compact)': -10000, '6.5 Litres (Familial)': 0, '8.5 Litres (Double Bac)': 18000 },
      68000
    ),
    reviews: [
      {
        id: 'rev-air-1',
        author: 'Khadija Sy',
        role: 'Cheffe à domicile',
        city: 'Dakar, Yoff',
        rating: 5,
        comment: 'Les pastels et les cuisses de poulet sont croustillantes sans une goutte d’huile. La cuve 6.5L est parfaite.',
        date: '29 Septembre 2026',
      },
    ],
  },

  // 6. Mode & Vêtements: Hoodie Coton Peigné 420g
  {
    id: 'prod-mod-1',
    name: 'Hoodie Oversized Heavyweight 420g – Coton Peigné Pur & Coupe Boxy',
    slug: 'hoodie-essential-heavyweight',
    description:
      'Sweat à capuche d’exception en molleton de coton lourd 420g/m². Silhouette contemporaine inspirée du streetwear dakaroise, finitions côtelées renforcées et intérieur brossé ultra-doux. Compatible avec la personnalisation broderie ou flocage en atelier.',
    features: [
      '100% coton biologique peigné haute densité 420g/m²',
      'Capuche double épaisseur sans cordon pour un tombé minimaliste',
      'Poche kangourou renforcée aux points de tension',
      'Teinture réactive garantie sans décoloration au lavage',
    ],
    price: 32000,
    oldPrice: 42000,
    stock: 64,
    sku: 'TM-MOD-HOOD',
    category: 'Mode & Habillement',
    categorySlug: 'mode',
    brand: 'Teranga Studio',
    images: [HOODIE_IMAGE_URL, HERO_IMAGE_URL, FLOCAGE_IMAGE_URL],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Sable du Sahel', hex: '#D2B48C', image: HOODIE_IMAGE_URL },
      { name: 'Noir Onyx', hex: '#111111', image: HERO_IMAGE_URL },
      { name: 'Vert Kaki', hex: '#4B5320', image: HOODIE_IMAGE_URL },
    ],
    badge: 'New',
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    flocageEligible: true,
    rating: 4.8,
    reviewCount: 95,
    status: 'ACTIVE',
    weightKg: 0.72,
    tieredDiscounts: DEFAULT_TIERED_DISCOUNTS,
    variants: buildVariantsMatrix(
      'TM-MOD-HOOD',
      32000,
      ['S', 'M', 'L', 'XL', 'XXL'],
      [
        { name: 'Sable du Sahel', hex: '#D2B48C', image: HOODIE_IMAGE_URL },
        { name: 'Noir Onyx', hex: '#111111', image: HERO_IMAGE_URL },
        { name: 'Vert Kaki', hex: '#4B5320', image: HOODIE_IMAGE_URL },
      ],
      undefined,
      42000
    ),
    reviews: [
      {
        id: 'rev-mod-1',
        author: 'Ibrahima Fall',
        role: 'Designer Graphique',
        city: 'Dakar, Liberté 6',
        rating: 5,
        comment: 'Tissu très épais, tombé lourd magnifique. Rien à envier aux grandes marques internationales.',
        date: '24 Septembre 2026',
      },
    ],
  },

  // 7. Chaussures & Sport: Sneakers Air Pulse 270
  {
    id: 'prod-spo-1',
    name: 'Sneakers Performance Air Pulse 270 – Semelle Bulle Amorti Panoramique',
    slug: 'sneakers-air-pulse-270',
    description:
      'Baskets sportives polyvalentes adaptées à la course à pied, au fitness et au style urbain. Dotées d’un coussin d’air de 32 mm au talon procurant un retour d’énergie dynamique à chaque foulée sur tous types de sols.',
    features: [
      'Unité d’air 32mm haute résistance teintée Orange Teranga',
      'Empeigne en mesh respirant anti-échauffement',
      'Semelle extérieure en gomme d’adhérence crantée tout-terrain',
      'Semelle intérieure amortissante antimicrobienne et lavable',
    ],
    price: 58000,
    oldPrice: 75000,
    stock: 42,
    sku: 'TM-SNK-PULSE270',
    category: 'Sports, Fitness & Baskets',
    categorySlug: 'sport',
    brand: 'Kora Athletics',
    images: [SNEAKER_IMAGE_URL, SNEAKER_BLACK_IMAGE_URL, HERO_BANNER_URL],
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    colors: [
      { name: 'Blanc & Orange Teranga', hex: '#FF5A1F', image: SNEAKER_IMAGE_URL },
      { name: 'Noir Furtif', hex: '#111111', image: SNEAKER_BLACK_IMAGE_URL },
    ],
    badge: 'Promo',
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 178,
    status: 'ACTIVE',
    weightKg: 0.85,
    tieredDiscounts: DEFAULT_TIERED_DISCOUNTS,
    variants: buildVariantsMatrix(
      'TM-SNK-PULSE270',
      58000,
      ['39', '40', '41', '42', '43', '44', '45'],
      [
        { name: 'Blanc & Orange Teranga', hex: '#FF5A1F', image: SNEAKER_IMAGE_URL },
        { name: 'Noir Furtif', hex: '#111111', image: SNEAKER_BLACK_IMAGE_URL },
      ],
      undefined,
      75000
    ),
    reviews: [
      {
        id: 'rev-snk-1',
        author: 'Moussa Gueye',
        role: 'Coach sportif',
        city: 'Dakar, Corniche Ouest',
        rating: 5,
        comment: 'Très bon maintien pour les sessions de running sur la Corniche, super confort.',
        date: '18 Septembre 2026',
      },
    ],
  },

  // 8. Personnalisation & Atelier: Flocage & Textile Sur-Mesure
  {
    id: 'prod-floc-1',
    name: 'Maillot & T-Shirt Personnalisé – Flocage Thermique Officiel Nom & Numéro',
    slug: 'maillot-tshirt-flocage-personnalise',
    description:
      'Service de flocage et personnalisation pour particuliers, associations, clubs sportifs et entreprises. Impression thermique haute pression résistant à plus de 60 lavages en machine. Disponible à l’unité ou en lots avec remises quantitatives dégressives.',
    features: [
      'Flocage vinyle polyuréthane mat souple ultra-résistant',
      'Choix libre du nom, du numéro, du logo de sponsor ou blason',
      'Délais express 24h à notre atelier de Dakar',
      'Tarifs dégressifs automatiques dès 5 pièces et devis pro dès 50 pièces',
    ],
    price: 24000,
    oldPrice: 30000,
    stock: 90,
    sku: 'TM-FLOC-CUST',
    category: 'Personnalisation & Flocage Pro',
    categorySlug: 'flocage',
    brand: 'Atelier Teranga Express',
    images: [JERSEY_IMAGE_URL, FLOCAGE_IMAGE_URL, HERO_IMAGE_URL],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Vert Teranga', hex: '#0F4D2A', image: JERSEY_IMAGE_URL },
      { name: 'Noir Onyx', hex: '#111111', image: FLOCAGE_IMAGE_URL },
      { name: 'Blanc Craie', hex: '#F7F7F5', image: HERO_IMAGE_URL },
    ],
    badge: 'Bestseller',
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    flocageEligible: true,
    rating: 4.9,
    reviewCount: 310,
    status: 'ACTIVE',
    weightKg: 0.25,
    tieredDiscounts: DEFAULT_TIERED_DISCOUNTS,
    variants: buildVariantsMatrix(
      'TM-FLOC-CUST',
      24000,
      ['S', 'M', 'L', 'XL', 'XXL'],
      [
        { name: 'Vert Teranga', hex: '#0F4D2A', image: JERSEY_IMAGE_URL },
        { name: 'Noir Onyx', hex: '#111111', image: FLOCAGE_IMAGE_URL },
        { name: 'Blanc Craie', hex: '#F7F7F5', image: HERO_IMAGE_URL },
      ],
      undefined,
      30000
    ),
    reviews: [
      {
        id: 'rev-floc-1',
        author: 'Mamadou Diop',
        role: 'Capitaine Club Corpo',
        city: 'Dakar, Almadies',
        rating: 5,
        comment: 'Commande de 22 maillots personnalisés pour notre tournoi corpo. Flocage net et livraison rapide !',
        date: '12 Septembre 2026',
      },
    ],
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'TM-2026-9841',
    customerName: 'Cheikh Tidiane Sy',
    customerPhone: '+221 77 450 12 34',
    customerEmail: 'cheikh.sy@gmail.com',
    shippingAddress: {
      street: 'Rue Carnot angle Béranger Féraud',
      city: 'Dakar',
      region: 'Dakar Plateau',
      instructions: 'Appeler avant de monter au 3ème étage',
    },
    deliveryMethod: 'LIVRAISON_DOMICILE',
    carrier: 'Dakar Express GP',
    trackingNumber: 'DKR-EXP-9841-SN',
    paymentMethod: 'WAVE',
    paymentStatus: 'PAID',
    paymentReference: 'WAVE_TX_98417723',
    webhookConfirmedAt: '2026-10-02T10:14:00Z',
    orderStatus: 'DELIVERED',
    isFlocageOrder: false,
    items: [
      {
        id: 'item-1',
        type: 'PRODUCT',
        product: INITIAL_PRODUCTS[0],
        selectedSize: '256 Go',
        selectedColor: 'Titane Naturel',
        quantity: 1,
        unitPrice: 385000,
      },
    ],
    subtotal: 385000,
    deliveryFee: 0,
    discount: 0,
    total: 385000,
    createdAt: '2026-10-02T09:42:00Z',
  },
  {
    id: 'ord-1002',
    orderNumber: 'TM-2026-9842',
    customerName: 'Aïssatou Ndiaye',
    customerPhone: '+221 78 123 45 67',
    customerEmail: 'aissatou.ndiaye@orange.sn',
    shippingAddress: {
      street: 'Cité Keur Gorgui, Immeuble Horizon',
      city: 'Dakar',
      region: 'Mermoz - Sacré Cœur',
    },
    deliveryMethod: 'LIVRAISON_DOMICILE',
    carrier: 'Coursier Teranga Express',
    trackingNumber: 'TRG-CR-9842',
    paymentMethod: 'ORANGE_MONEY',
    paymentStatus: 'PAID',
    paymentReference: 'OM_REF_881923',
    webhookConfirmedAt: '2026-10-03T14:22:00Z',
    orderStatus: 'SHIPPED',
    isFlocageOrder: false,
    items: [
      {
        id: 'item-2',
        type: 'PRODUCT',
        product: INITIAL_PRODUCTS[3],
        selectedSize: '6.5 Litres (Familial)',
        selectedColor: 'Noir Onyx & Inox',
        quantity: 1,
        unitPrice: 49000,
      },
      {
        id: 'item-3',
        type: 'PRODUCT',
        product: INITIAL_PRODUCTS[2],
        selectedSize: 'Standard',
        selectedColor: 'Noir Mat',
        quantity: 1,
        unitPrice: 38000,
      },
    ],
    subtotal: 87000,
    deliveryFee: 0,
    discount: 0,
    total: 87000,
    createdAt: '2026-10-03T14:05:00Z',
  },
  {
    id: 'ord-1003',
    orderNumber: 'TM-2026-9843',
    customerName: 'Mouhamed Lamine Diop',
    customerPhone: '+221 76 890 12 34',
    customerEmail: 'm.diop@societegenerale.sn',
    shippingAddress: {
      street: 'Route des Almadies face King Fahd',
      city: 'Dakar',
      region: 'Almadies',
    },
    deliveryMethod: 'LIVRAISON_DOMICILE',
    paymentMethod: 'WAVE',
    paymentStatus: 'PAID',
    paymentReference: 'WAVE_TX_441029',
    webhookConfirmedAt: '2026-10-04T08:50:00Z',
    orderStatus: 'PREPARING',
    isFlocageOrder: true,
    items: [
      {
        id: 'item-4',
        type: 'PRODUCT',
        product: INITIAL_PRODUCTS[6],
        selectedSize: 'L',
        selectedColor: 'Vert Teranga',
        quantity: 12,
        unitPrice: 21600,
      },
    ],
    subtotal: 259200,
    deliveryFee: 0,
    discount: 25920,
    total: 233280,
    createdAt: '2026-10-04T08:30:00Z',
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'TERANGA10',
    discountPct: 10,
    active: true,
    minSpend: 25000,
    expiresAt: '2026-12-31',
    usageCount: 142,
  },
  {
    id: 'coup-2',
    code: 'DEALS5',
    discountPct: 5,
    active: true,
    minSpend: 15000,
    expiresAt: '2026-11-30',
    usageCount: 89,
  },
  {
    id: 'coup-3',
    code: 'BIENVENUE',
    discountPct: 15,
    active: true,
    minSpend: 40000,
    expiresAt: '2026-12-31',
    usageCount: 312,
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Cheikh Tidiane Sy',
    email: 'cheikh.sy@gmail.com',
    phone: '+221 77 450 12 34',
    city: 'Dakar Plateau',
    ordersCount: 4,
    totalSpent: 620000,
    lastOrderDate: '2026-10-02',
    isVip: true,
  },
  {
    id: 'cust-2',
    name: 'Aïssatou Ndiaye',
    email: 'aissatou.ndiaye@orange.sn',
    phone: '+221 78 123 45 67',
    city: 'Mermoz',
    ordersCount: 3,
    totalSpent: 185000,
    lastOrderDate: '2026-10-03',
    isVip: false,
  },
  {
    id: 'cust-3',
    name: 'Mouhamed Lamine Diop',
    email: 'm.diop@societegenerale.sn',
    phone: '+221 76 890 12 34',
    city: 'Almadies',
    ordersCount: 6,
    totalSpent: 790000,
    lastOrderDate: '2026-10-04',
    isVip: true,
  },
  {
    id: 'cust-4',
    name: 'Fatou Bintou Sow',
    email: 'fatou.sow@yahoo.fr',
    phone: '+221 77 332 11 00',
    city: 'Yoff',
    ordersCount: 2,
    totalSpent: 85000,
    lastOrderDate: '2026-09-28',
    isVip: false,
  },
];

export const INITIAL_FLOCAGE_PRICING: FlocagePricingConfig = {
  namePrice: 2000,
  numberPrice: 1500,
  logoPrice: 2500,
  sponsorPrice: 3000,
  pickupDeliveryFee: 2000,
  positionPrices: {
    dos: 0,
    poitrine: 1000,
    manche: 1000,
    autre: 1500,
  },
  volumeDiscounts: {
    tier1to4: 0,
    tier5to9: 5,
    tier10to19: 10,
    tier20to49: 15,
    quoteMinQty: 50,
  },
  availableFonts: ['Impact Pro', 'Bebas Neue', 'Collegiate Athletic', 'Modern Sans', 'Script Teranga'],
  availableColors: [
    { name: 'Blanc Pur', hex: '#FFFFFF' },
    { name: 'Noir Mat', hex: '#111111' },
    { name: 'Or Métallique', hex: '#D4AF37' },
    { name: 'Rouge Carmin', hex: '#DC2626' },
    { name: 'Jaune Sénégal', hex: '#FACC15' },
    { name: 'Vert Émeraude', hex: '#16A34A' },
  ],
  availablePositions: ['Dos', 'Poitrine', 'Manche', 'Autre'],
};

export const INITIAL_QUOTES: QuoteRequest[] = [
  {
    id: 'quote-101',
    name: 'Société Minière de Sabodala',
    phone: '+221 77 123 99 88',
    email: 'achats@sabodala-gold.sn',
    quantity: 120,
    garmentType: 'Polos et Vestes Haute Visibilité',
    message: 'Besoin de 120 polos avec broderie logo poitrine et flocage dos pour le personnel de chantier.',
    status: 'DEVIS_ENVOYE',
    createdAt: '2026-09-25T11:00:00Z',
  },
  {
    id: 'quote-102',
    name: 'Association des Jeunes de Thiès',
    phone: '+221 76 543 21 00',
    email: 'ajt.thies@gmail.com',
    quantity: 65,
    garmentType: 'Maillots de sport Tournoi Navétanes',
    message: 'Flocage 65 maillots avec nom, numéro et sponsor sur la poitrine pour notre tournoi annuel.',
    status: 'EN_ATTENTE',
    createdAt: '2026-10-01T16:30:00Z',
  },
];

export const INITIAL_ADDRESSES: CustomerAddress[] = [
  {
    id: 'addr-1',
    label: 'Bureau Plateau',
    recipientName: 'Cheikh Tidiane Sy',
    phone: '+221 77 450 12 34',
    street: 'Rue Carnot x Béranger Féraud, Immeuble Alpha',
    city: 'Dakar',
    region: 'Dakar Plateau',
    instructions: 'Remettre à l’accueil au 3ème étage',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Domicile Almadies',
    recipientName: 'Cheikh Tidiane Sy',
    phone: '+221 77 450 12 34',
    street: 'Villa 42, Rue de la Résidence',
    city: 'Dakar',
    region: 'Almadies',
    instructions: 'Portail blanc avec sonnette',
    isDefault: false,
  },
];
