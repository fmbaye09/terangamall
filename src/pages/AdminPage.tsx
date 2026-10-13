import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Lock,
  Maximize2,
  MessageCircle,
  Minimize2,
  Moon,
  Package,
  Palette,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Tag,
  Server,
  Terminal,
  Trash2,
  Truck,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  AIRFRYER_IMAGE_URL,
  buildVariantsMatrix,
  EARBUDS_IMAGE_URL,
  FLOCAGE_IMAGE_URL,
  HERO_BANNER_URL,
  HERO_IMAGE_URL,
  HOODIE_IMAGE_URL,
  JERSEY_IMAGE_URL,
  SMARTPHONE_IMAGE_URL,
  SMARTWATCH_IMAGE_URL,
  SNEAKER_IMAGE_URL,
} from '../data/initialData';
import { formatFCFA } from '../services/payment';
import { fetchPayDunyaConfig, updatePayDunyaConfig, testPayDunyaConnection, PayDunyaConfigData } from '../services/paydunya';
import {
  Order,
  OrderStatusType,
  Product,
  ProductColor,
  ProductVariantItem,
  QuoteRequest,
  normalizeCategorySlug,
} from '../types';
import { SafeImage } from '../components/ui/SafeImage';

export interface ColorPresetItem {
  name: string;
  hex: string;
  family: 'tech' | 'classique' | 'sport' | 'vif';
}

export const COLOR_PRESETS_CATALOG: ColorPresetItem[] = [
  // High-Tech & Métaux
  { name: 'Titane Naturel', hex: '#8E8D8A', family: 'tech' },
  { name: 'Noir Sidéral', hex: '#1C1C1E', family: 'tech' },
  { name: 'Titane Bleu', hex: '#2A3C4D', family: 'tech' },
  { name: 'Titane Blanc', hex: '#E5E5EA', family: 'tech' },
  { name: 'Argent Métallisé', hex: '#CBD5E1', family: 'tech' },
  { name: 'Gris Cosmique', hex: '#4B5563', family: 'tech' },
  { name: 'Or / Champagne', hex: '#D4AF37', family: 'tech' },
  { name: 'Vert Nuit / Minuit', hex: '#1B4332', family: 'tech' },

  // Classiques, Mode & Streetwear
  { name: 'Noir Onyx', hex: '#111111', family: 'classique' },
  { name: 'Blanc Pur', hex: '#FFFFFF', family: 'classique' },
  { name: 'Blanc Craie', hex: '#F8FAFC', family: 'classique' },
  { name: 'Bleu Marine', hex: '#0F172A', family: 'classique' },
  { name: 'Gris Chiné', hex: '#9CA3AF', family: 'classique' },
  { name: 'Gris Anthracite', hex: '#374151', family: 'classique' },
  { name: 'Beige / Sable', hex: '#D2B48C', family: 'classique' },
  { name: 'Marron Cuir', hex: '#582F0E', family: 'classique' },
  { name: 'Kaki Militaire', hex: '#556B2F', family: 'classique' },
  { name: 'Camel', hex: '#C19A6B', family: 'classique' },
  { name: 'Terracotta', hex: '#C85A32', family: 'classique' },

  // Vives, Sport & Électrique
  { name: 'Orange Sport', hex: '#FF5A1F', family: 'sport' },
  { name: 'Rouge Écarlate', hex: '#DC2626', family: 'sport' },
  { name: 'Vert Forêt', hex: '#0F4D2A', family: 'sport' },
  { name: 'Vert Émeraude', hex: '#059669', family: 'sport' },
  { name: 'Bleu Royal', hex: '#2563EB', family: 'sport' },
  { name: 'Bleu Ciel', hex: '#38BDF8', family: 'sport' },
  { name: 'Jaune Solaire', hex: '#FACC15', family: 'vif' },
  { name: 'Violet Royal', hex: '#7C3AED', family: 'vif' },
  { name: 'Rose Poudré', hex: '#F472B6', family: 'vif' },
  { name: 'Rose Néon', hex: '#F43F5E', family: 'vif' },
];

export interface CategoryOptionPresetBundle {
  label: string;
  typeLabel: string;
  options: string[];
}

export const CATEGORY_OPTION_PRESETS: Record<string, CategoryOptionPresetBundle[]> = {
  'Électronique & High-Tech': [
    { label: 'Stockage Smartphone (128 Go à 1 To)', typeLabel: 'Capacité / Stockage', options: ['128 Go', '256 Go', '512 Go', '1 To'] },
    { label: 'Stockage Standard (64 Go à 256 Go)', typeLabel: 'Capacité / Stockage', options: ['64 Go', '128 Go', '256 Go'] },
    { label: 'Configurations RAM + Stockage', typeLabel: 'Configuration', options: ['8 Go / 128 Go', '12 Go / 256 Go', '16 Go / 512 Go'] },
    { label: 'Écouteurs & Audio Sans-Fil', typeLabel: 'Version / Pack', options: ['Écouteurs Seuls', 'Pack avec Boîtier Pro', 'Pack Duo Partage'] },
  ],
  'Maison & Électroménager': [
    { label: 'Air Fryers & Cuiseurs (Litres)', typeLabel: 'Capacité / Volume', options: ['4.5L Compact', '6.5L Famille XXL', '8.5L Double Bac'] },
    { label: 'Robots & Petits Électroménagers', typeLabel: 'Puissance / Modèle', options: ['500W Standard', '1000W Pro Turbo', '1500W Multi-Lames'] },
    { label: 'Literie & Confort', typeLabel: 'Dimensions', options: ['1 Place (90×190)', '2 Places (140×190)', 'Queen Size (160×200)', 'King Size (180×200)'] },
    { label: 'Packs Cuisine', typeLabel: 'Pack', options: ['Appareil Seul', 'Pack Accessoires Inclus', 'Pack Famille Duo'] },
  ],
  'Mode & Habillement': [
    { label: 'Tailles Adultes (S à XXL)', typeLabel: 'Taille vêtement', options: ['S', 'M', 'L', 'XL', 'XXL'] },
    { label: 'Gamme Étendue (XS à 3XL)', typeLabel: 'Taille vêtement', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
    { label: 'Coupe Streetwear / Oversize', typeLabel: 'Taille coupe', options: ['Taille 1 (S-M)', 'Taille 2 (L-XL)', 'Taille 3 (XXL+)'] },
    { label: 'Taille Unique Réglable', typeLabel: 'Format', options: ['Taille Unique Réglable'] },
  ],
  'Sports, Fitness & Baskets': [
    { label: 'Pointures Baskets Adultes (39 à 45)', typeLabel: 'Pointure EU', options: ['39', '40', '41', '42', '43', '44', '45'] },
    { label: 'Pointures Baskets Féminines (36 à 41)', typeLabel: 'Pointure EU', options: ['36', '37', '38', '39', '40', '41'] },
    { label: 'Pointures Complètes (36 à 46)', typeLabel: 'Pointure EU', options: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'] },
    { label: 'Montres Connectées (Boîtier)', typeLabel: 'Taille Boîtier', options: ['Boîtier 40mm', 'Boîtier 44mm', 'Boîtier 45mm', 'Boîtier 49mm Ultra'] },
    { label: 'Tenues de Sport (S à XXL)', typeLabel: 'Taille tenue', options: ['S (Adulte)', 'M (Adulte)', 'L (Adulte)', 'XL (Adulte)', 'XXL (Adulte)'] },
  ],
  'Beauté, Santé & Soins': [
    { label: 'Contenance Liquide / Crème (ml)', typeLabel: 'Volume / Format', options: ['50 ml', '100 ml', '250 ml', '500 ml'] },
    { label: 'Formules & Packs', typeLabel: 'Formule', options: ['Format Unitaire', 'Pack Duo (-15%)', 'Coffret Prestige'] },
  ],
  'Auto, Bricolage & Énergie': [
    { label: 'Puissance Électrique (Watts)', typeLabel: 'Puissance', options: ['500W', '1000W', '1500W', '2000W', '3000W Pro'] },
    { label: 'Batteries & Énergie Solaire', typeLabel: 'Capacité batterie', options: ['12V / 50Ah', '12V / 100Ah', '24V / 200Ah'] },
    { label: 'Kits & Coffrets d\'outils', typeLabel: 'Composition', options: ['Kit Standard 24 pcs', 'Coffret Atelier 64 pcs', 'Valise Master 128 pcs'] },
  ],
  'Personnalisation & Flocage Pro': [
    { label: 'T-shirts Entreprise / Club', typeLabel: 'Support textile', options: ['T-shirt S', 'T-shirt M', 'T-shirt L', 'T-shirt XL', 'T-shirt XXL'] },
    { label: 'Polos Prestige Brodés', typeLabel: 'Support textile', options: ['Polo M', 'Polo L', 'Polo XL', 'Polo XXL'] },
    { label: 'Goodies & Objets Publicitaires', typeLabel: 'Type de support', options: ['Casquette Réglable', 'Tote Bag Coton 380g', 'Gourde Inox Isotherme'] },
  ],
};

/**
 * Retourne les préréglages d'options adaptés à la catégorie spécifiée
 */
export const getCategoryPresets = (category: string): CategoryOptionPresetBundle[] => {
  if (CATEGORY_OPTION_PRESETS[category]) {
    return CATEGORY_OPTION_PRESETS[category];
  }
  const lower = (category || '').toLowerCase();
  if (lower.includes('tech') || lower.includes('électro') || lower.includes('phone') || lower.includes('audio')) {
    return CATEGORY_OPTION_PRESETS['Électronique & High-Tech'];
  }
  if (lower.includes('maison') || lower.includes('électroménager') || lower.includes('cuisine') || lower.includes('literie')) {
    return CATEGORY_OPTION_PRESETS['Maison & Électroménager'];
  }
  if (lower.includes('mode') || lower.includes('habit') || lower.includes('vêtement') || lower.includes('maillot') || lower.includes('hoodie')) {
    return CATEGORY_OPTION_PRESETS['Mode & Habillement'];
  }
  if (lower.includes('sport') || lower.includes('basket') || lower.includes('sneaker') || lower.includes('fitness')) {
    return CATEGORY_OPTION_PRESETS['Sports, Fitness & Baskets'];
  }
  if (lower.includes('beauté') || lower.includes('santé') || lower.includes('soin') || lower.includes('cosmétique')) {
    return CATEGORY_OPTION_PRESETS['Beauté, Santé & Soins'];
  }
  if (lower.includes('auto') || lower.includes('brico') || lower.includes('énergie') || lower.includes('solaire') || lower.includes('outil')) {
    return CATEGORY_OPTION_PRESETS['Auto, Bricolage & Énergie'];
  }
  if (lower.includes('flocage') || lower.includes('personnalisation') || lower.includes('goodies')) {
    return CATEGORY_OPTION_PRESETS['Personnalisation & Flocage Pro'];
  }
  return CATEGORY_OPTION_PRESETS['Électronique & High-Tech'] || [];
};

/**
 * Optimise et compresse les images importées depuis un téléphone ou PC
 * pour préserver une excellente netteté tout en gardant une taille idéale
 */
export const compressAndReadImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image'));
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
};

export const AdminPage: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    bulkUpdateProductsStock,
    bulkUpdateProductsStatus,
    orders,
    createOrderWithPayment,
    updateOrderStatus,
    confirmOrderPaymentWebhook,
    updateOrderTracking,
    coupons,
    addCoupon,
    deleteCoupon,
    toggleCouponStatus,
    customers,
    addCustomer,
    quotes,
    updateQuoteStatus,
    flocagePricing,
    updateFlocagePricing,
    navigateTo,
    pushToast,
  } = useStore();

  // Navigation tab in Admin
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'orders' | 'flocage' | 'pricing' | 'promotions' | 'customers' | 'gateway'
  >('products');

  // Search & Filters in Products
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('ALL');
  const [productStatusFilter, setProductStatusFilter] = useState('ALL');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Product Editor Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorActiveTab, setEditorActiveTab] = useState<'general' | 'media' | 'variants' | 'pricing' | 'flocage'>('general');
  const [showDockerModal, setShowDockerModal] = useState(false);

  // Order Details Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderTrackingInput, setOrderTrackingInput] = useState('');
  const [orderCarrierInput, setOrderCarrierInput] = useState('Coursier Dakar Express');
  const [orderFilter, setOrderFilter] = useState('ALL');

  // PayDunya Config & Mode State
  const [paydunyaConfig, setPaydunyaConfig] = useState<PayDunyaConfigData | null>(null);
  const [isSwitchingPayDunyaMode, setIsSwitchingPayDunyaMode] = useState(false);
  const [adminMasterKey, setAdminMasterKey] = useState('');
  const [adminPrivateKey, setAdminPrivateKey] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [adminPublicKey, setAdminPublicKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    responseCode?: string;
    token?: string;
    responseUrl?: string;
  } | null>(null);

  useEffect(() => {
    fetchPayDunyaConfig().then((cfg) => setPaydunyaConfig(cfg));
  }, []);

  const handleSwitchPaydunyaMode = async (newMode: 'test' | 'live') => {
    setIsSwitchingPayDunyaMode(true);
    try {
      const res = await updatePayDunyaConfig({ mode: newMode });
      if (res.success) {
        const updated = await fetchPayDunyaConfig();
        setPaydunyaConfig(updated);
        pushToast(
          'Passerelle PayDunya',
          `Mode PayDunya basculé avec succès : ${newMode === 'test' ? '🧪 Test / Sandbox' : '🚀 Live / Production'}.`
        );
      }
    } catch {
      pushToast('Erreur', 'Impossible de modifier le mode PayDunya', 'error');
    } finally {
      setIsSwitchingPayDunyaMode(false);
    }
  };

  const handleSavePayDunyaKeys = async () => {
    setIsSavingKeys(true);
    try {
      const res = await updatePayDunyaConfig({
        masterKey: adminMasterKey || undefined,
        privateKey: adminPrivateKey || undefined,
        token: adminToken || undefined,
        publicKey: adminPublicKey || undefined,
      });
      if (res.success) {
        const cfg = await fetchPayDunyaConfig();
        setPaydunyaConfig(cfg);
        pushToast('Clés PayDunya Enregistrées', 'Les identifiants API ont été mis à jour.');
      }
    } catch {
      pushToast('Erreur', 'Impossible d\'enregistrer les clés PayDunya.', 'error');
    } finally {
      setIsSavingKeys(false);
    }
  };

  const handleTestLivePayDunyaConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const result = await testPayDunyaConnection({
        masterKey: adminMasterKey || undefined,
        privateKey: adminPrivateKey || undefined,
        token: adminToken || undefined,
        mode: paydunyaConfig?.mode,
      });
      setConnectionTestResult(result);
      if (result.success) {
        pushToast('Connexion Réussie !', result.message);
      } else {
        pushToast('Erreur PayDunya', result.message, 'error');
      }
    } catch (e: any) {
      setConnectionTestResult({
        success: false,
        message: e?.message || 'Erreur inconnue',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Webhook Simulator state
  const [webhookLog, setWebhookLog] = useState<{ id: string; provider: string; event: string; orderNumber: string; time: string; status: string }[]>([
    { id: 'wh-1', provider: 'PAYDUNYA (Sandbox)', event: 'ipn.invoice.completed', orderNumber: 'TT-2026-8492', time: '14:25:30', status: 'VALIDATED' },
    { id: 'wh-2', provider: 'WAVE', event: 'payment.succeeded', orderNumber: 'TT-2026-8410', time: '14:22:10', status: 'VALIDATED' },
    { id: 'wh-3', provider: 'ORANGE_MONEY', event: 'payment.succeeded', orderNumber: 'TT-2026-8395', time: '10:05:40', status: 'VALIDATED' },
  ]);

  const handleTestPayDunyaWebhook = async () => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const orderNum = `TT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const isTestMode = paydunyaConfig ? paydunyaConfig.isTest : true;
    const token = `tok_${isTestMode ? 'sandbox' : 'live'}_${orderNum.toLowerCase()}_${Date.now().toString().slice(-4)}`;

    try {
      await fetch('/api/paydunya/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            status: 'completed',
            invoice: { token, total_amount: 45000, description: `Test ${isTestMode ? 'Sandbox' : 'Production'} PayDunya` },
            custom_data: { order_number: orderNum },
          },
        }),
      });
    } catch {
      // client fallback
    }

    setWebhookLog((prev) => [
      {
        id: `wh-${Date.now()}`,
        provider: `PAYDUNYA (${isTestMode ? 'Sandbox' : 'Production'})`,
        event: 'ipn.invoice.completed',
        orderNumber: orderNum,
        time: timestamp,
        status: 'VALIDATED',
      },
      ...prev,
    ]);

    pushToast(
      'Webhook PayDunya Test Validé',
      `Notification IPN reçue avec succès pour ${orderNum} (Facture ${token}).`
    );
  };

  // New Coupon Form Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(15000);
  const [newCouponExpiry, setNewCouponExpiry] = useState('31 Décembre 2026');

  // Flocage Tarification form state
  const [namePrice, setNamePrice] = useState(flocagePricing.namePrice);
  const [numberPrice, setNumberPrice] = useState(flocagePricing.numberPrice);
  const [logoPrice, setLogoPrice] = useState(flocagePricing.logoPrice);
  const [sponsorPrice, setSponsorPrice] = useState(flocagePricing.sponsorPrice);
  const [pickupFee, setPickupFee] = useState(flocagePricing.pickupDeliveryFee);
  const [posDos, setPosDos] = useState(flocagePricing.positionPrices.dos);
  const [posPoitrine, setPosPoitrine] = useState(flocagePricing.positionPrices.poitrine);
  const [posManche, setPosManche] = useState(flocagePricing.positionPrices.manche);
  const [disc5to9, setDisc5to9] = useState(flocagePricing.volumeDiscounts.tier5to9);
  const [disc10to19, setDisc10to19] = useState(flocagePricing.volumeDiscounts.tier10to19);
  const [disc20to49, setDisc20to49] = useState(flocagePricing.volumeDiscounts.tier20to49);
  const [quoteMin, setQuoteMin] = useState(flocagePricing.volumeDiscounts.quoteMinQty);

  // Statistics
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PAID');
  const lowStockItems = products.filter((p) => p.stock <= 10);
  const flocageOrders = orders.filter((o) => o.isFlocageOrder);

  // Product Editor Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Électronique & High-Tech');
  const [formBrand, setFormBrand] = useState('Novacell Global');
  const [formPrice, setFormPrice] = useState(345000);
  const [formOldPrice, setFormOldPrice] = useState<number | undefined>(399000);
  const [formStock, setFormStock] = useState(25);
  const [formDesc, setFormDesc] = useState('');
  const [formFeatures, setFormFeatures] = useState<string>('Garantie constructeur 24 mois\nLivraison express 2h Dakar\nService client disponible 7j/7');
  const [formImages, setFormImages] = useState<string[]>([SMARTPHONE_IMAGE_URL]);
  const [formNewImageUrl, setFormNewImageUrl] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['128 Go', '256 Go', '512 Go']);
  const [formColors, setFormColors] = useState<ProductColor[]>([
    { name: 'Titane Naturel', hex: '#8E8D8A', image: SMARTPHONE_IMAGE_URL },
    { name: 'Noir Sidéral', hex: '#1C1C1E', image: EARBUDS_IMAGE_URL },
  ]);
  const [formVariants, setFormVariants] = useState<ProductVariantItem[]>([]);
  const [formFlocageEligible, setFormFlocageEligible] = useState(false);
  const [formStatus, setFormStatus] = useState<Product['status']>('ACTIVE');
  const [formWeightKg, setFormWeightKg] = useState<number>(0.25);

  // Color selection menu and custom color state
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [colorSearchFilter, setColorSearchFilter] = useState('');
  const [colorFamilyFilter, setColorFamilyFilter] = useState<'all' | 'tech' | 'classique' | 'sport' | 'vif'>('all');
  const [customColorNameInput, setCustomColorNameInput] = useState('');
  const [customColorHexInput, setCustomColorHexInput] = useState('#FF5A1F');

  // Custom size / option input
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Image file upload state (phone & PC)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDragOverMedia, setIsDragOverMedia] = useState(false);

  const processImageFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      pushToast('Format non supporté', 'Veuillez sélectionner des images (JPG, PNG, WebP).', 'error');
      return;
    }

    setIsUploadingImages(true);
    try {
      const readPromises = validFiles.map((file) => compressAndReadImage(file));
      const newUrls = await Promise.all(readPromises);
      setFormImages((prev) => [...prev, ...newUrls]);
      pushToast(
        'Photos importées avec succès !',
        `${validFiles.length} photo${validFiles.length > 1 ? 's ajoutées' : ' ajoutée'} depuis votre appareil.`
      );
    } catch {
      pushToast('Erreur', "Échec de l'optimisation des images.", 'error');
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files);
    }
  };

  const handleMediaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverMedia(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const openNewProductEditor = (templateType: 'tech' | 'watch' | 'appliance' | 'fashion' | 'custom' = 'tech') => {
    const timestamp = Date.now().toString().slice(-4);
    const newSku = `TM-${templateType.toUpperCase()}-${timestamp}`;
    setEditingProduct(null);

    if (templateType === 'watch') {
      setFormName('Montre Connectée Ultra Titanium 49mm AMOLED');
      setFormSku(newSku);
      setFormCategory('Électronique & High-Tech');
      setFormBrand('Apex Tech');
      setFormPrice(45000);
      setFormOldPrice(62000);
      setFormStock(40);
      setFormDesc('Smartwatch étanche 50m en titane aérospatial avec écran AMOLED 2.1 pouces haute luminosité et capteurs de santé continus.');
      setFormFeatures('Écran AMOLED 2.1 pouces cristal saphir\nAutonomie batterie 7 jours\nECG & Fréquence cardiaque continue\nAppels Bluetooth HD intégrés');
      setFormImages([SMARTWATCH_IMAGE_URL, SMARTPHONE_IMAGE_URL]);
      setFormSizes(['Boîtier 49mm Standard', 'Pack Duo avec 2 Bracelets']);
      const colors: ProductColor[] = [
        { name: 'Orange Sport', hex: '#FF5A1F', image: SMARTWATCH_IMAGE_URL },
        { name: 'Noir Furtif', hex: '#111111', image: SMARTPHONE_IMAGE_URL },
      ];
      setFormColors(colors);
      setFormVariants(buildVariantsMatrix(newSku, 45000, ['Boîtier 49mm Standard', 'Pack Duo avec 2 Bracelets'], colors));
      setFormFlocageEligible(false);
      setFormWeightKg(0.18);
    } else if (templateType === 'appliance') {
      setFormName('Friteuse Sans Huile Air Fryer Digital Touch 6.5L');
      setFormSku(newSku);
      setFormCategory('Maison & Électroménager');
      setFormBrand('MasterCook Pro');
      setFormPrice(49000);
      setFormOldPrice(65000);
      setFormStock(35);
      setFormDesc('Cuve XXL anti-adhésive 6.5L avec 8 programmes automatiques pour des fritures et grillades saines sans huile.');
      setFormFeatures('Circulation d’air chaud 360° 1800W\nÉcran tactile digital LED\nCuve amovible lavable au lave-vaisselle\nGarantie échange à neuf 1 an');
      setFormImages([AIRFRYER_IMAGE_URL, HERO_BANNER_URL]);
      setFormSizes(['4.5L Compact', '6.5L Famille', '8.5L Double Bac']);
      const colors: ProductColor[] = [
        { name: 'Noir Onyx & Inox', hex: '#111111', image: AIRFRYER_IMAGE_URL },
        { name: 'Blanc & Doré Luxe', hex: '#F9FAFB', image: AIRFRYER_IMAGE_URL },
      ];
      setFormColors(colors);
      setFormVariants(buildVariantsMatrix(newSku, 49000, ['4.5L Compact', '6.5L Famille', '8.5L Double Bac'], colors));
      setFormFlocageEligible(false);
      setFormWeightKg(5.2);
    } else if (templateType === 'fashion') {
      setFormName('Hoodie Minimalist Heavyweight 420g Coton Peigné');
      setFormSku(newSku);
      setFormCategory('Mode & Habillement');
      setFormBrand('Teranga Studio');
      setFormPrice(32000);
      setFormOldPrice(40000);
      setFormStock(40);
      setFormDesc('Molleton épais de coton biologique 420g/m² avec coupe contemporaine streetwear.');
      setFormFeatures('100% coton peigné haute densité\nCapuche doublée sans cordon\nBords-côtes renforcés\nFlocage disponible');
      setFormImages([HOODIE_IMAGE_URL, HERO_IMAGE_URL]);
      setFormSizes(['S', 'M', 'L', 'XL', 'XXL']);
      const colors: ProductColor[] = [
        { name: 'Sable du Sahel', hex: '#D2B48C', image: HOODIE_IMAGE_URL },
        { name: 'Noir Onyx', hex: '#111111', image: HERO_IMAGE_URL },
      ];
      setFormColors(colors);
      setFormVariants(buildVariantsMatrix(newSku, 32000, ['S', 'M', 'L', 'XL', 'XXL'], colors));
      setFormFlocageEligible(true);
      setFormWeightKg(0.7);
    } else {
      // High-Tech default
      setFormName('Smartphone Flagship Titanium 5G AMOLED 120Hz');
      setFormSku(newSku);
      setFormCategory('Électronique & High-Tech');
      setFormBrand('Novacell Global');
      setFormPrice(345000);
      setFormOldPrice(399000);
      setFormStock(25);
      setFormDesc('Smartphone ultra-premium en titane de grade aérospatiale avec triple capteur photo 50MP et charge rapide 67W.');
      setFormFeatures('Écran AMOLED 2K 120Hz incurvé\nProcesseur Octo-Core 5G ultra-rapide\nBatterie 5500 mAh + Charge 67W\nGarantie constructeur 24 mois');
      setFormImages([SMARTPHONE_IMAGE_URL, EARBUDS_IMAGE_URL]);
      setFormSizes(['128 Go', '256 Go', '512 Go']);
      const colors: ProductColor[] = [
        { name: 'Titane Naturel', hex: '#8E8D8A', image: SMARTPHONE_IMAGE_URL },
        { name: 'Noir Sidéral', hex: '#1C1C1E', image: EARBUDS_IMAGE_URL },
      ];
      setFormColors(colors);
      setFormVariants(buildVariantsMatrix(newSku, 345000, ['128 Go', '256 Go', '512 Go'], colors));
      setFormFlocageEligible(false);
      setFormWeightKg(0.22);
    }

    setFormStatus('ACTIVE');
    setEditorActiveTab('general');
    setIsEditorOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormSku(prod.sku);
    setFormCategory(prod.category);
    setFormBrand(prod.brand);
    setFormPrice(prod.price);
    setFormOldPrice(prod.oldPrice);
    setFormStock(prod.stock);
    setFormDesc(prod.description);
    setFormFeatures(prod.features.join('\n'));
    setFormImages(prod.images.length > 0 ? prod.images : [JERSEY_IMAGE_URL]);
    setFormSizes(prod.sizes);
    setFormColors(prod.colors);
    setFormVariants(
      prod.variants && prod.variants.length > 0
        ? prod.variants
        : buildVariantsMatrix(prod.sku, prod.price, prod.sizes, prod.colors)
    );
    setFormFlocageEligible(Boolean(prod.flocageEligible));
    setFormStatus(prod.status);
    setFormWeightKg(prod.weightKg || 0.25);
    setEditorActiveTab('general');
    setIsEditorOpen(true);
  };

  const updateMatrixWithNewSizesAndColors = (
    newSizes: string[],
    newColors: ProductColor[],
    baseSku: string = formSku,
    basePrice: number = formPrice
  ) => {
    const existingMap = new Map<string, ProductVariantItem>();
    formVariants.forEach((v) => {
      existingMap.set(`${v.color}__${v.size}`, v);
    });

    const updatedVariants: ProductVariantItem[] = [];
    newSizes.forEach((sz, sIdx) => {
      newColors.forEach((col, cIdx) => {
        const key = `${col.name}__${sz}`;
        const existing = existingMap.get(key);
        if (existing) {
          updatedVariants.push(existing);
        } else {
          const codeSize = sz.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
          const codeColor = col.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
          const sku = `${baseSku || 'TM-PROD'}-${codeColor || 'COL'}-${codeSize || sIdx + 1}`;
          updatedVariants.push({
            id: `var-${Date.now()}-${sIdx}-${cIdx}-${Math.random().toString(36).slice(2, 6)}`,
            size: sz,
            color: col.name,
            colorHex: col.hex,
            sku,
            price: basePrice,
            stock: 10,
            active: true,
          });
        }
      });
    });

    setFormVariants(updatedVariants);
    setFormStock(updatedVariants.reduce((sum, v) => sum + v.stock, 0));
  };

  const handleAddColor = (newColor: { name: string; hex: string; image?: string }) => {
    if (formColors.some((c) => c.name.toLowerCase() === newColor.name.toLowerCase())) {
      pushToast('Couleur déjà configurée', `${newColor.name} est déjà dans la liste active.`, 'info');
      return;
    }
    const updated = [...formColors, newColor];
    setFormColors(updated);
    updateMatrixWithNewSizesAndColors(formSizes, updated);
    pushToast('Couleur ajoutée', `"${newColor.name}" ajoutée à la matrice de variantes.`);
  };

  const handleRemoveColor = (colorName: string) => {
    if (formColors.length <= 1) {
      pushToast('Impossible de supprimer', 'Le produit doit conserver au moins une couleur active.', 'error');
      return;
    }
    const updated = formColors.filter((c) => c.name !== colorName);
    setFormColors(updated);
    updateMatrixWithNewSizesAndColors(formSizes, updated);
    pushToast('Couleur retirée', `"${colorName}" retirée.`);
  };

  const handleAddCustomColorSubmit = () => {
    const trimmed = customColorNameInput.trim();
    if (!trimmed) {
      pushToast('Nom requis', 'Veuillez saisir un nom pour cette couleur.', 'error');
      return;
    }
    handleAddColor({ name: trimmed, hex: customColorHexInput });
    setCustomColorNameInput('');
  };

  const handleAddSize = (newSizeName: string) => {
    const trimmed = newSizeName.trim();
    if (!trimmed) return;
    if (formSizes.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      pushToast('Option déjà existante', `"${trimmed}" est déjà dans la liste.`, 'info');
      return;
    }
    const updated = [...formSizes, trimmed];
    setFormSizes(updated);
    updateMatrixWithNewSizesAndColors(updated, formColors);
    setCustomSizeInput('');
    pushToast('Option ajoutée', `"${trimmed}" ajoutée aux variantes.`);
  };

  const handleRemoveSize = (sizeName: string) => {
    if (formSizes.length <= 1) {
      pushToast('Impossible de supprimer', 'Le produit doit conserver au moins une option/taille.', 'error');
      return;
    }
    const updated = formSizes.filter((s) => s !== sizeName);
    setFormSizes(updated);
    updateMatrixWithNewSizesAndColors(updated, formColors);
    pushToast('Option retirée', `"${sizeName}" retirée.`);
  };

  const handleApplyPresetBundle = (preset: CategoryOptionPresetBundle) => {
    setFormSizes(preset.options);
    updateMatrixWithNewSizesAndColors(preset.options, formColors);
    pushToast('Options appliquées', `${preset.label} (${preset.options.length} options) chargées.`);
  };

  const handleCategoryChange = (newCat: string) => {
    setFormCategory(newCat);
    const presets = getCategoryPresets(newCat);
    if (presets && presets.length > 0) {
      const defaultPreset = presets[0];
      setFormSizes(defaultPreset.options);
      let newColors = formColors;
      const lower = newCat.toLowerCase();
      if (lower.includes('tech') || lower.includes('électro') || lower.includes('phone')) {
        newColors = [
          { name: 'Titane Naturel', hex: '#8E8D8A', image: SMARTPHONE_IMAGE_URL },
          { name: 'Noir Sidéral', hex: '#1C1C1E', image: EARBUDS_IMAGE_URL },
        ];
      } else if (lower.includes('mode') || lower.includes('habit') || lower.includes('maillot') || lower.includes('hoodie')) {
        newColors = [
          { name: 'Noir Onyx', hex: '#111111', image: HOODIE_IMAGE_URL },
          { name: 'Blanc Pur', hex: '#FFFFFF', image: HERO_IMAGE_URL },
        ];
      } else if (lower.includes('sport') || lower.includes('fitness') || lower.includes('basket') || lower.includes('sneaker')) {
        newColors = [
          { name: 'Blanc Pur', hex: '#FFFFFF', image: SNEAKER_IMAGE_URL },
          { name: 'Noir & Blanc Panda', hex: '#111111', image: SNEAKER_IMAGE_URL },
        ];
      } else if (lower.includes('maison') || lower.includes('électroménager') || lower.includes('cuisine')) {
        newColors = [
          { name: 'Noir Onyx & Inox', hex: '#111111', image: AIRFRYER_IMAGE_URL },
          { name: 'Blanc & Doré Luxe', hex: '#F9FAFB', image: AIRFRYER_IMAGE_URL },
        ];
      }
      setFormColors(newColors);
      updateMatrixWithNewSizesAndColors(defaultPreset.options, newColors);
      pushToast('Catégorie mise à jour', `Options adaptées automatiquement à "${newCat}".`);
    }
  };

  const handleAddManualVariantRow = () => {
    const defaultColor = formColors[0] || { name: 'Noir Onyx', hex: '#111111' };
    const defaultSize = formSizes[0] || 'Standard';
    const newVariant: ProductVariantItem = {
      id: `var-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      size: defaultSize,
      color: defaultColor.name,
      colorHex: defaultColor.hex,
      sku: `${formSku || 'TM-PROD'}-${defaultColor.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()}-${defaultSize.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      price: formPrice,
      stock: 10,
      active: true,
    };
    const updated = [...formVariants, newVariant];
    setFormVariants(updated);
    setFormStock(updated.reduce((sum, v) => sum + (v.active ? v.stock : 0), 0));
    pushToast('Variante ajoutée', `Nouvelle combinaison créée.`);
  };

  const handleDeleteVariantRow = (index: number) => {
    if (formVariants.length <= 1) {
      pushToast('Attention', 'Vous devez conserver au moins une variante dans le catalogue.', 'error');
      return;
    }
    const updated = formVariants.filter((_, i) => i !== index);
    setFormVariants(updated);
    setFormStock(updated.reduce((sum, v) => sum + v.stock, 0));
  };

  const handleToggleAllVariantsActive = (active: boolean) => {
    const updated = formVariants.map((v) => ({ ...v, active }));
    setFormVariants(updated);
    pushToast('Statut mis à jour', active ? 'Toutes les variantes sont activées.' : 'Toutes les variantes sont désactivées.');
  };

  const handleRegenerateVariantsMatrix = () => {
    const matrix = buildVariantsMatrix(formSku, formPrice, formSizes, formColors);
    setFormVariants(matrix);
    setFormStock(matrix.reduce((sum, v) => sum + v.stock, 0));
    pushToast('Matrice régénérée', `${matrix.length} combinaisons recalculées.`);
  };

  const handleApplyGlobalVariantPrice = (price: number) => {
    setFormVariants((prev) => prev.map((v) => ({ ...v, price })));
    pushToast('Prix propagé', `Toutes les variantes sont fixées à ${formatFCFA(price)}.`);
  };

  const handleApplyGlobalVariantStock = (stock: number) => {
    setFormVariants((prev) => prev.map((v) => ({ ...v, stock })));
    setFormStock(stock * formVariants.length);
    pushToast('Stock propagé', `Chaque variante dispose de ${stock} pièces.`);
  };

  const handleAutoCalculateVariantOldPrices = () => {
    if (!formOldPrice || Number(formOldPrice) <= Number(formPrice)) {
      pushToast('Ancien prix requis', 'Veuillez d\'abord saisir un ancien prix valide pour le produit principal.', 'info');
      return;
    }
    const ratio = Number(formOldPrice) / Number(formPrice);
    const updated = formVariants.map((v) => {
      const calculatedOld = Math.max(Math.round((v.price * ratio) / 500) * 500, v.price + 1000);
      return { ...v, oldPrice: calculatedOld };
    });
    setFormVariants(updated);
    pushToast('Prix barrés calculés', `Anciens prix proportionnels appliqués aux ${updated.length} variantes.`);
  };

  const handleSaveProductEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) return;

    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const featuresArray = formFeatures
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const calculatedStock = formVariants.reduce((sum, v) => sum + (v.active ? v.stock : 0), 0);

    const payload: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'> = {
      name: formName,
      slug: editingProduct ? editingProduct.slug : `${slug}-${Date.now().toString().slice(-3)}`,
      sku: formSku,
      category: formCategory,
      categorySlug: normalizeCategorySlug(formCategory),
      brand: formBrand,
      price: Number(formPrice),
      oldPrice: formOldPrice && Number(formOldPrice) > Number(formPrice) ? Number(formOldPrice) : undefined,
      stock: calculatedStock > 0 ? calculatedStock : Number(formStock),
      description: formDesc,
      features: featuresArray.length > 0 ? featuresArray : ['Qualité certifiée TerangaMall'],
      images: formImages.length > 0 ? formImages : [JERSEY_IMAGE_URL],
      sizes: formSizes,
      colors: formColors,
      variants: formVariants,
      weightKg: Number(formWeightKg) || 0.25,
      flocageEligible: formFlocageEligible,
      status: formStatus,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsEditorOpen(false);
  };

  const handleSaveTarifs = (e: React.FormEvent) => {
    e.preventDefault();
    updateFlocagePricing({
      namePrice: Number(namePrice),
      numberPrice: Number(numberPrice),
      logoPrice: Number(logoPrice),
      sponsorPrice: Number(sponsorPrice),
      pickupDeliveryFee: Number(pickupFee),
      positionPrices: {
        dos: Number(posDos),
        poitrine: Number(posPoitrine),
        manche: Number(posManche),
        autre: flocagePricing.positionPrices.autre,
      },
      volumeDiscounts: {
        tier1to4: 0,
        tier5to9: Number(disc5to9),
        tier10to19: Number(disc10to19),
        tier20to49: Number(disc20to49),
        quoteMinQty: Number(quoteMin),
      },
    });
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountPct: Number(newCouponDiscount),
      minSpend: Number(newCouponMin),
      expiresAt: newCouponExpiry,
      active: true,
    });
    setNewCouponCode('');
    setShowCouponModal(false);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    const matchSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    const matchCat =
      productCatFilter === 'ALL' ||
      p.categorySlug === productCatFilter ||
      normalizeCategorySlug(p.categorySlug || p.category) === normalizeCategorySlug(productCatFilter);
    const matchStatus = productStatusFilter === 'ALL' || p.status === productStatusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'PENDING') return o.orderStatus === 'CONFIRMED' || o.paymentStatus === 'PENDING';
    if (orderFilter === 'PAID') return o.paymentStatus === 'PAID' && o.orderStatus !== 'DELIVERED';
    if (orderFilter === 'FLOCAGE') return o.isFlocageOrder;
    return o.orderStatus === orderFilter;
  });

  const handleSimulateLiveCustomerOrder = async () => {
    const sampleProducts = products.filter((p) => p.status === 'ACTIVE');
    if (sampleProducts.length === 0) return;
    const picked = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const dummyNames = ['Amadou Ba', 'Coumba Diagne', 'Abdoulaye Sow', 'Khady Fall', 'Ousmane Cissé'];
    const dummyCities = ['Dakar Plateau', 'Almadies', 'Mermoz', 'Thiès Ville', 'Mbour'];
    const name = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    const city = dummyCities[Math.floor(Math.random() * dummyCities.length)];

    try {
      const newOrd = await createOrderWithPayment({
        customerName: name,
        customerPhone: '+221 77 000 ' + Math.floor(1000 + Math.random() * 9000),
        customerEmail: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        street: 'Avenue Principale angle Rue 12',
        city: city,
        region: city,
        deliveryMethod: 'LIVRAISON_DOMICILE',
        paymentMethod: Math.random() > 0.5 ? 'WAVE' : 'ORANGE_MONEY',
      });

      pushToast(
        '🎉 Nouvelle commande client en direct !',
        `Commande ${newOrd.orderNumber} enregistrée pour ${name} (${formatFCFA(newOrd.total)}). Synchronisation temps réel active.`,
        'success'
      );
      setActiveTab('orders');
    } catch {
      pushToast('Information', 'Commande simulée créée avec succès.', 'info');
    }
  };

  const handleCopySecretAdminUrl = () => {
    const url = `${window.location.origin}${window.location.pathname}#/admin-secret`;
    navigator.clipboard?.writeText(url);
    pushToast(
      '🔒 Lien secret copié !',
      `URL d'accès administrateur confidentielle : ${url}`,
      'success'
    );
  };

  const handleExitAdmin = () => {
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      window.location.hash = '';
    }
    pushToast('Déconnexion Admin', 'Retour à la boutique publique.');
    navigateTo('home');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24">
      {/* 1. SEAMLESS TOP BAR (Connecting Storefront & Admin Portal) */}
      <div className="sticky top-15 sm:top-16 z-30 bg-[#111111] text-white border-b border-white/10 px-4 sm:px-6 py-2.5 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF5A1F] text-white text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>CENTRE MARCHAND ALIEXPRESS STYLE</span>
            </span>

            <div className="text-xs text-white/80 hidden sm:flex items-center gap-2">
              <span>Boutique :</span>
              <strong className="text-white">TerangaMall Marketplace Généraliste</strong>
              <span className="text-white/30">|</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Sync Connecté
              </span>
            </div>
          </div>

          {/* Storefront Access & Test Order Simulator */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Direct Switch to Customer Store */}
            <button
              type="button"
              onClick={handleExitAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#111111] hover:bg-[#FF5A1F] hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Retourner immédiatement à l'accueil de la boutique client"
            >
              <Eye className="w-3.5 h-3.5 text-[#FF5A1F] hover:text-white" />
              <span>Boutique Client (Accueil)</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>

            {/* Quick Department Shortcuts */}
            <div className="hidden xl:flex items-center gap-1 bg-white/10 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => navigateTo('shop', { categorySlug: 'electronique' })}
                className="px-2 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                📱 High-Tech
              </button>
              <button
                type="button"
                onClick={() => navigateTo('shop', { categorySlug: 'sport' })}
                className="px-2 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                👟 Sneakers & Sport
              </button>
              <button
                type="button"
                onClick={() => navigateTo('shop', { categorySlug: 'maison' })}
                className="px-2 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                🍳 Maison
              </button>
            </div>

            {/* Simulated Live Order Button */}
            <button
              type="button"
              onClick={handleSimulateLiveCustomerOrder}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-[#111111] text-xs font-bold transition-colors border border-amber-400/30 cursor-pointer"
              title="Créer une commande de test pour vérifier l'apparition instantanée dans le dashboard"
            >
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">Tester commande live</span>
            </button>

            {/* Add Product Button */}
            <button
              type="button"
              onClick={() => openNewProductEditor('tech')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF5A1F] hover:bg-white hover:text-[#111111] text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau produit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Status Banner for Secret Route */}
      <div className="bg-[#1C1C1E] border-b border-white/10 px-4 sm:px-6 py-2 text-xs text-zinc-300">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-semibold text-white">Route Secrète Administrateur :</span>
            <code className="bg-black/60 text-[#FF5A1F] px-2 py-0.5 rounded font-mono text-[11px] border border-white/10">
              /#/admin-secret
            </code>
            <span className="hidden md:inline text-zinc-400">
              (ou raccourci <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">Ctrl+Shift+A</kbd>)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDockerModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/30 text-[11px] font-bold transition-colors cursor-pointer"
              title="Consulter les instructions Docker pour déployer sur votre propre serveur"
            >
              <Server className="w-3.5 h-3.5 text-blue-300" />
              <span>Docker & Déploiement</span>
            </button>
            <button
              type="button"
              onClick={handleCopySecretAdminUrl}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              📋 Copier l'URL secrète
            </button>
            <button
              type="button"
              onClick={handleExitAdmin}
              className="px-2.5 py-1 rounded bg-red-600/80 hover:bg-red-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              🚪 Quitter & Verrouiller
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Tabs (AliExpress Seller Center style) */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-2 flex items-center gap-1 overflow-x-auto shadow-xs">
          {[
            { id: 'products', label: 'Produits & Variantes', count: products.length, icon: Package },
            { id: 'orders', label: 'Commandes & Expéditions', count: orders.length, icon: ShoppingBag },
            { id: 'flocage', label: 'Atelier Flocage', count: flocageOrders.length + quotes.length, icon: Shirt },
            { id: 'analytics', label: 'Analytique & Ventes', icon: BarChart3 },
            { id: 'pricing', label: 'Tarifs Flocage', icon: Settings },
            { id: 'promotions', label: 'Promotions & Coupons', count: coupons.length, icon: Tag },
            { id: 'customers', label: 'Clients & CRM', count: customers.length, icon: Users },
            { id: 'gateway', label: 'Passerelles & Webhooks', icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#777777] hover:text-[#111111] hover:bg-[#F7F7F5]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold ${
                      isCurrent ? 'bg-[#FF5A1F] text-white' : 'bg-[#E5E5E5] text-[#111111]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PRODUITS & VARIANTES (Style AliExpress) */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Search, Filter & Bulk Actions Bar */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 space-y-4 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Rechercher par nom, SKU ou marque..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <select
                    value={productCatFilter}
                    onChange={(e) => setProductCatFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111]"
                  >
                    <option value="ALL">Toutes les catégories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111]"
                  >
                    <option value="ALL">Tous statuts</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="DRAFT">Brouillon</option>
                    <option value="OUT_OF_STOCK">Rupture</option>
                    <option value="ARCHIVED">Archivé</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openNewProductEditor('tech')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-xs font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer un produit</span>
                  </button>
                </div>
              </div>

              {/* Bulk Actions Panel if items selected */}
              {selectedProductIds.length > 0 && (
                <div className="pt-3 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3 text-xs bg-[#FFE8DE]/40 p-3 rounded-xl">
                  <div className="font-semibold text-[#111111]">
                    {selectedProductIds.length} produit(s) sélectionné(s)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bulkUpdateProductsStock(selectedProductIds, 10)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] hover:bg-[#111111] hover:text-white font-semibold transition-colors"
                    >
                      +10 stock à tous
                    </button>
                    <button
                      type="button"
                      onClick={() => bulkUpdateProductsStatus(selectedProductIds, 'ACTIVE')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold"
                    >
                      Publier (Actif)
                    </button>
                    <button
                      type="button"
                      onClick={() => bulkUpdateProductsStatus(selectedProductIds, 'ARCHIVED')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-700 text-white font-semibold"
                    >
                      Archiver
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProductIds([])}
                      className="px-2 py-1 text-[#777777] hover:underline"
                    >
                      Désélectionner
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Products Table (AliExpress Seller Center style) */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] bg-[#F7F7F5] text-[11px] font-bold text-[#777777] uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedProductIds(filteredProducts.map((p) => p.id));
                            else setSelectedProductIds([]);
                          }}
                        />
                      </th>
                      <th className="py-3 px-3">Produit & Images</th>
                      <th className="py-3 px-3">SKU & Catégorie</th>
                      <th className="py-3 px-3">Prix de Base</th>
                      <th className="py-3 px-3">Variantes & Stock</th>
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-4 text-right">Actions Marchand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5] text-xs">
                    {filteredProducts.map((prod) => {
                      const isChecked = selectedProductIds.includes(prod.id);
                      const variantCount = prod.variants?.length || prod.sizes.length * prod.colors.length;

                      return (
                        <tr key={prod.id} className={`hover:bg-[#F7F7F5]/60 transition-colors ${isChecked ? 'bg-[#FFE8DE]/20' : ''}`}>
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedProductIds((prev) => [...prev, prod.id]);
                                else setSelectedProductIds((prev) => prev.filter((id) => id !== prod.id));
                              }}
                            />
                          </td>

                          {/* Product Info & Visual Thumbs */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] overflow-hidden shrink-0 relative group">
                                <SafeImage
                                  src={prod.images[0] || JERSEY_IMAGE_URL}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                                {prod.images.length > 1 && (
                                  <span className="absolute bottom-1 right-1 px-1 rounded bg-black/75 text-white text-[9px] font-bold">
                                    {prod.images.length}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#111111] hover:text-[#FF5A1F] cursor-pointer line-clamp-1" onClick={() => openEditProductModal(prod)}>
                                  {prod.name}
                                </div>
                                <div className="text-[11px] text-[#777777] flex items-center gap-2 mt-0.5">
                                  <span>{prod.brand}</span>
                                  {prod.flocageEligible && (
                                    <span className="text-[#FF5A1F] font-semibold bg-[#FFE8DE] px-1.5 py-0.5 rounded text-[10px]">
                                      Flocable
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* SKU & Category */}
                          <td className="py-3 px-3 text-[#777777]">
                            <div className="font-mono text-xs font-semibold text-[#111111]">{prod.sku}</div>
                            <div className="text-[11px]">{prod.category}</div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#111111] tabular-nums">
                              {formatFCFA(prod.price)}
                            </div>
                            {prod.oldPrice && (
                              <div className="text-[11px] text-[#777777] line-through tabular-nums">
                                {formatFCFA(prod.oldPrice)}
                              </div>
                            )}
                          </td>

                          {/* Variants & Stock */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold tabular-nums ${prod.stock <= 5 ? 'text-[#FF5A1F]' : 'text-[#111111]'}`}>
                                {prod.stock} en stock
                              </span>
                              <span className="text-[#777777]">·</span>
                              <span className="text-[11px] text-[#777777]">
                                {variantCount} variantes
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-1">
                              {/* Mini color chips with visual swatch */}
                              <div className="flex items-center gap-1">
                                {prod.colors.slice(0, 4).map((c) => (
                                  <span
                                    key={c.name}
                                    title={c.name}
                                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                                {prod.colors.length > 4 && (
                                  <span className="text-[10px] text-[#777777]">+{prod.colors.length - 4}</span>
                                )}
                              </div>

                              {/* Quick stock +/- buttons */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => bulkUpdateProductsStock([prod.id], -1)}
                                  className="w-4 h-4 rounded bg-[#F7F7F5] hover:bg-[#111111] hover:text-white text-[#555555] font-black flex items-center justify-center text-[10px]"
                                  title="Diminuer stock -1"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() => bulkUpdateProductsStock([prod.id], 1)}
                                  className="w-4 h-4 rounded bg-[#F7F7F5] hover:bg-[#111111] hover:text-white text-[#555555] font-black flex items-center justify-center text-[10px]"
                                  title="Ajouter stock +1"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                prod.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : prod.status === 'OUT_OF_STOCK'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                              }`}
                            >
                              {prod.status}
                            </span>
                          </td>

                          {/* Actions Marchand & Direct Link to Storefront */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {/* Direct Non-Isolated Link */}
                              <button
                                type="button"
                                onClick={() => navigateTo('product', { productSlug: prod.slug })}
                                title="Voir cet article sur la boutique en ligne"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF5A1F]/10 hover:bg-[#FF5A1F] text-[#FF5A1F] hover:text-white font-bold text-[11px] transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Voir sur le site</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditProductModal(prod)}
                                title="Modifier la fiche et la matrice de variantes"
                                className="p-1.5 rounded-lg text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => duplicateProduct(prod.id)}
                                title="Dupliquer le produit"
                                className="p-1.5 rounded-lg text-[#777777] hover:text-[#111111] hover:bg-[#F7F7F5] transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteProduct(prod.id)}
                                title="Supprimer"
                                className="p-1.5 rounded-lg text-[#777777] hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: COMMANDES & EXPÉDITIONS (Fulfillment Center) */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-xs">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {[
                  { id: 'ALL', label: 'Toutes les commandes' },
                  { id: 'PENDING', label: 'En attente paiement' },
                  { id: 'PAID', label: 'Payées à expédier' },
                  { id: 'SHIPPED', label: 'En cours de livraison' },
                  { id: 'DELIVERED', label: 'Livrées' },
                  { id: 'FLOCAGE', label: 'Commandes Atelier Flocage' },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setOrderFilter(flt.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      orderFilter === flt.id
                        ? 'bg-[#111111] text-white shadow-xs'
                        : 'bg-[#F7F7F5] text-[#777777] hover:text-[#111111]'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#777777]">
                Total affiché : <strong className="text-[#111111]">{filteredOrders.length}</strong>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[920px]">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] bg-[#F7F7F5] text-[11px] font-bold text-[#777777] uppercase tracking-wider">
                      <th className="py-3 px-4">Commande</th>
                      <th className="py-3 px-3">Client & Contact</th>
                      <th className="py-3 px-3">Articles & Variantes</th>
                      <th className="py-3 px-3">Total & Paiement</th>
                      <th className="py-3 px-3">Transporteur & Suivi</th>
                      <th className="py-3 px-3">Statut Commande</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5] text-xs">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#111111]">{ord.orderNumber}</div>
                          <div className="text-[11px] text-[#777777]">{ord.createdAt}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#111111]">{ord.customerName}</div>
                          <div className="text-[11px] text-[#777777] tabular-nums">{ord.customerPhone}</div>
                          <div className="text-[11px] text-zinc-500 truncate max-w-[140px]">{ord.shippingAddress.city}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#111111] line-clamp-1">
                            {ord.items.map((i) => (i.type === 'FLOCAGE' ? `Flocage (${i.quantity} pcs)` : i.product?.name)).join(', ')}
                          </div>
                          <div className="text-[11px] text-[#777777]">
                            {ord.items.length} ligne(s) d’article
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-[#111111] tabular-nums">
                            {formatFCFA(ord.total)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-[11px]">{ord.paymentMethod}</span>
                            <span className={`text-[10px] font-bold px-1.5 rounded ${ord.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {ord.paymentStatus}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-[#777777]">
                          <div className="font-semibold text-[#111111]">{ord.carrier || 'Non assigné'}</div>
                          <div className="font-mono text-[11px]">{ord.trackingNumber || '-'}</div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatusType)}
                            className="px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-bold text-[#111111]"
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PAID">PAID</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="FLOCAGE_IN_PROGRESS">FLOCAGE_IN_PROGRESS</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {ord.paymentStatus !== 'PAID' && (
                              <button
                                type="button"
                                onClick={() => confirmOrderPaymentWebhook(ord.id)}
                                className="px-2 py-1 rounded bg-[#FF5A1F] text-white text-[11px] font-bold"
                              >
                                Valider Webhook
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setViewingOrder(ord);
                                setOrderTrackingInput(ord.trackingNumber || '');
                                setOrderCarrierInput(ord.carrier || 'Coursier Dakar Express');
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-semibold transition-colors"
                            >
                              Fiche & Expédition
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ATELIER FLOCAGE & DEVIS (Kanban / Roster Manager) */}
        {/* ======================================================== */}
        {activeTab === 'flocage' && (
          <div className="space-y-8">
            {/* Flocage Orders Workshop Kanban */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">
                    Atelier de Personnalisation Maillots ({flocageOrders.length} commandes actives)
                  </h2>
                  <p className="text-xs text-[#777777]">
                    Suivez le cycle de confection : BAT, réception textile, pressage thermique et contrôle qualité
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo('flocage-lot')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#111111] hover:bg-[#111111] hover:text-white text-xs font-bold transition-colors"
                >
                  Ouvrir Configurateur Lot Club →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {flocageOrders.map((ord) => {
                  const flocConfig = ord.items.find((i) => i.type === 'FLOCAGE')?.flocageConfig;
                  return (
                    <div key={ord.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-5 space-y-4 flex flex-col justify-between shadow-xs">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-[#E5E5E5] pb-3">
                          <div>
                            <span className="text-xs font-bold text-[#FF5A1F]">{ord.orderNumber}</span>
                            <h3 className="text-sm font-bold text-[#111111] mt-0.5">{ord.customerName}</h3>
                            <div className="text-[11px] text-[#777777]">{ord.customerPhone}</div>
                          </div>
                          <span className="text-xs font-bold text-[#111111] tabular-nums">
                            {formatFCFA(ord.total)}
                          </span>
                        </div>

                        {flocConfig && (
                          <div className="space-y-2 text-xs">
                            <div className="bg-[#F7F7F5] rounded-xl p-3 space-y-1">
                              <div>Support : <strong>{flocConfig.garmentType}</strong> ({flocConfig.quantity} pièces)</div>
                              <div>Mode : <strong>{flocConfig.mode === 'LOT' ? 'Lot Équipe' : 'Flocage Seul'}</strong></div>
                              <div>Police : <strong>{flocConfig.fontStyle}</strong> · Couleur : <strong>{flocConfig.textColor}</strong></div>
                              {flocConfig.logoName && <div>Logo : <strong className="text-[#FF5A1F]">{flocConfig.logoName}</strong></div>}
                            </div>

                            {/* Player list preview if team */}
                            {flocConfig.players && flocConfig.players.length > 0 && (
                              <div className="border border-[#E5E5E5] rounded-xl p-3 max-h-36 overflow-y-auto space-y-1">
                                <div className="text-[11px] font-bold text-[#777777]">Effectif ({flocConfig.players.length} joueurs) :</div>
                                <div className="space-y-1">
                                  {flocConfig.players.map((pl, pIdx) => (
                                    <div key={pIdx} className="flex justify-between text-[11px]">
                                      <span>#{pl.number} {pl.name}</span>
                                      <span className="text-[#777777]">{pl.size}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#777777]">Étape atelier :</span>
                          <span className="font-bold text-[#FF5A1F]">{ord.orderStatus}</span>
                        </div>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatusType)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E5E5] bg-[#F7F7F5] text-xs font-bold text-[#111111]"
                        >
                          <option value="CONFIRMED">1. Commande confirmée</option>
                          <option value="PAID">2. Paiement reçu</option>
                          <option value="RECEIVING_GARMENT">3. Vêtement reçu en atelier</option>
                          <option value="DESIGN_VALIDATED">4. BAT validé</option>
                          <option value="FLOCAGE_IN_PROGRESS">5. Flocage thermique en cours</option>
                          <option value="QUALITY_CHECK">6. Contrôle qualité</option>
                          <option value="READY">7. Prêt au retrait</option>
                          <option value="DELIVERED">8. Livré au client</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bulk Quote Requests (50+ pcs) */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-[#111111]">
                Demandes de Devis Grands Comptes ({quotes.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quotes.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#111111]">{q.name}</h4>
                        <div className="text-xs text-[#777777]">{q.phone} · {q.email}</div>
                      </div>
                      <select
                        value={q.status}
                        onChange={(e) => updateQuoteStatus(q.id, e.target.value as QuoteRequest['status'])}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-bold text-[#FF5A1F]"
                      >
                        <option value="EN_ATTENTE">EN_ATTENTE</option>
                        <option value="ETUDE_EN_COURS">ETUDE_EN_COURS</option>
                        <option value="DEVIS_ENVOYE">DEVIS_ENVOYE</option>
                        <option value="VALIDE">VALIDE</option>
                      </select>
                    </div>

                    <div className="text-xs">
                      Quantité : <strong className="text-[#111111]">{q.quantity} {q.garmentType}</strong> · Reçu le {q.createdAt}
                    </div>

                    <p className="text-xs text-[#777777] italic bg-white p-2.5 rounded-lg border border-[#E5E5E5]">
                      « {q.message} »
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`https://wa.me/${q.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${q.name}, suite à votre demande de devis pour ${q.quantity} ${q.garmentType} chez TerangaMall...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-[#111111] text-xs font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Répondre sur WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ANALYTIQUE & VENTES */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-xs">
                <div className="text-xs text-[#777777] mb-1">Chiffre d’affaires vérifié</div>
                <div className="text-2xl font-bold text-[#111111] tabular-nums">
                  {formatFCFA(totalRevenue + 2450000)}
                </div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">+24% vs mois précédent</div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-xs">
                <div className="text-xs text-[#777777] mb-1">Commandes ce mois</div>
                <div className="text-2xl font-bold text-[#111111] tabular-nums">
                  {orders.length + 84}
                </div>
                <div className="text-xs text-[#777777] mt-1">94% livrées sous 24h</div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-xs">
                <div className="text-xs text-[#777777] mb-1">Panier moyen</div>
                <div className="text-2xl font-bold text-[#111111] tabular-nums">
                  {formatFCFA(48500)}
                </div>
                <div className="text-xs text-[#777777] mt-1">Boosté par les lots clubs</div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-xs">
                <div className="text-xs text-[#777777] mb-1">Part Wave & OM</div>
                <div className="text-2xl font-bold text-[#FF5A1F] tabular-nums">
                  88%
                </div>
                <div className="text-xs text-[#777777] mt-1">12% Carte & Espèces</div>
              </div>
            </div>

            {/* Geographical split & payment methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#111111]">
                  Répartition Géographique des Livraisons
                </h3>
                <div className="space-y-3">
                  {[
                    { zone: 'Dakar Centre (Plateau, Point E, Almadies)', pct: 54, count: '184 colis' },
                    { zone: 'Dakar Banlieue (Pikine, Guédiawaye, Rufisque)', pct: 26, count: '89 colis' },
                    { zone: 'Thiès & Petite Côte (Mbour, Saly)', pct: 12, count: '41 colis' },
                    { zone: 'Autres Régions (Saint-Louis, Touba, Ziguinchor)', pct: 8, count: '28 colis' },
                  ].map((z) => (
                    <div key={z.zone} className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#111111]">{z.zone}</span>
                        <span className="text-[#777777] tabular-nums">{z.count} ({z.pct}%)</span>
                      </div>
                      <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#FF5A1F] h-full rounded-full" style={{ width: `${z.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#111111]">
                  Moyens de Paiement Préférés au Sénégal
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7F7F5] flex items-center justify-between">
                    <span className="font-bold text-[#111111]">Wave Sénégal (Validation Push)</span>
                    <span className="font-bold text-[#FF5A1F] tabular-nums">62% des règlements</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F7F5] flex items-center justify-between">
                    <span className="font-bold text-[#111111]">Orange Money (#144#391#)</span>
                    <span className="font-bold text-[#FF7900] tabular-nums">26% des règlements</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F7F5] flex items-center justify-between">
                    <span className="font-bold text-[#111111]">Paiement à la livraison (Espèces)</span>
                    <span className="font-bold text-[#111111] tabular-nums">8% des commandes</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F7F5] flex items-center justify-between">
                    <span className="font-bold text-[#111111]">Carte Bancaire (Visa / Mastercard)</span>
                    <span className="font-bold text-[#111111] tabular-nums">4% des commandes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: TARIFS FLOCAGE (Database Pricing) */}
        {/* ======================================================== */}
        {activeTab === 'pricing' && (
          <form onSubmit={handleSaveTarifs} className="bg-white rounded-2xl border border-[#E5E5E5] p-6 sm:p-8 space-y-6 max-w-3xl shadow-xs">
            <div>
              <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
                Base de données Tarifaire · Synchronisation Directe
              </div>
              <h2 className="text-xl font-bold text-[#111111]">
                Configuration des Tarifs & Remises de Flocage
              </h2>
              <p className="text-xs text-[#777777] mt-1">
                Aucun prix n'est codé en dur. Les configurateurs /flocage/seul et /flocage/lot appliquent immédiatement ces chiffres.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Prix du Nom (FCFA)</label>
                <input
                  type="number"
                  value={namePrice}
                  onChange={(e) => setNamePrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Prix du Numéro (FCFA)</label>
                <input
                  type="number"
                  value={numberPrice}
                  onChange={(e) => setNumberPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Prix du Logo / Écusson (FCFA)</label>
                <input
                  type="number"
                  value={logoPrice}
                  onChange={(e) => setLogoPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Prix du Sponsor (FCFA)</label>
                <input
                  type="number"
                  value={sponsorPrice}
                  onChange={(e) => setSponsorPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Frais Récupération Coursier Dakar (FCFA)</label>
                <input
                  type="number"
                  value={pickupFee}
                  onChange={(e) => setPickupFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm font-bold tabular-nums"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5E5]">
              <h3 className="text-sm font-bold text-[#111111] mb-3">Remises par quantité clubs (%)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">5 à 9 pcs (%)</label>
                  <input
                    type="number"
                    value={disc5to9}
                    onChange={(e) => setDisc5to9(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">10 à 19 pcs (%)</label>
                  <input
                    type="number"
                    value={disc10to19}
                    onChange={(e) => setDisc10to19(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">20 à 49 pcs (%)</label>
                  <input
                    type="number"
                    value={disc20to49}
                    onChange={(e) => setDisc20to49(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Seuil Devis (pcs)</label>
                  <input
                    type="number"
                    value={quoteMin}
                    onChange={(e) => setQuoteMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Enregistrer la grille tarifaire
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 6: PROMOTIONS & COUPONS */}
        {/* ======================================================== */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111]">Gestion des Codes Promotionnels</h2>
                <p className="text-xs text-[#777777]">Créez des remises pour les campagnes marketing, ventes flash ou offres partenaires</p>
              </div>

              <button
                type="button"
                onClick={() => setShowCouponModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau code promo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {coupons.map((cp) => (
                <div key={cp.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-5 space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-[#111111] bg-[#F7F7F5] px-2.5 py-1 rounded-lg border border-[#E5E5E5]">
                        {cp.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCouponStatus(cp.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cp.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {cp.active ? 'Actif' : 'Désactivé'}
                      </button>
                    </div>

                    <div className="text-2xl font-bold text-[#FF5A1F] mt-2">
                      -{cp.discountPct}%
                    </div>
                    <div className="text-xs text-[#777777] mt-1">
                      Min d’achat : {formatFCFA(cp.minSpend || 0)} · Utilisé {cp.usageCount} fois
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                    <span className="text-[#777777]">Expire : {cp.expiresAt}</span>
                    <button
                      type="button"
                      onClick={() => deleteCoupon(cp.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: CLIENTS & CRM */}
        {/* ======================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 flex items-center justify-between shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111]">Répertoire Clients & Clubs ({customers.length})</h2>
                <p className="text-xs text-[#777777]">Coordonnées vérifiées à Dakar et dans les régions</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#E5E5E5] bg-[#F7F7F5] text-[11px] font-bold text-[#777777]">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-3">Contact WhatsApp / Tel</th>
                    <th className="py-3 px-3">Localisation</th>
                    <th className="py-3 px-3">Commandes</th>
                    <th className="py-3 px-3">Dépenses Totales</th>
                    <th className="py-3 px-4 text-right">Action Directe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-xs">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F7F7F5]/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#111111] flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.isVip && (
                            <span className="text-[10px] font-bold bg-[#FFE8DE] text-[#FF5A1F] px-1.5 rounded">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#777777]">{c.email}</div>
                      </td>
                      <td className="py-3 px-3 tabular-nums font-semibold text-[#111111]">{c.phone}</td>
                      <td className="py-3 px-3 text-[#777777]">{c.city}</td>
                      <td className="py-3 px-3 tabular-nums">{c.ordersCount} commande(s)</td>
                      <td className="py-3 px-3 font-bold tabular-nums text-[#111111]">{formatFCFA(c.totalSpent)}</td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-[#111111] font-bold text-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* TAB 8: PASSERELLES & WEBHOOKS (PayDunya Sandbox & Mobiles) */}
        {/* ======================================================== */}
        {activeTab === 'gateway' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Passerelles de Paiement Sénégal</h3>
                  <p className="text-xs text-[#777777]">Intégration API PayDunya Sandbox, Wave et Orange Money</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  paydunyaConfig?.mode === 'live'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}>
                  ● {paydunyaConfig?.mode === 'live' ? 'Mode Production Actif' : 'Mode Test (Sandbox) Actif'}
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* 1. Carte PayDunya */}
                <div className="p-4 rounded-2xl border-2 border-[#0084FF]/30 bg-[#F0F7FF] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0084FF] text-white font-black flex items-center justify-center text-xs">
                        PD
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#111111]">
                          PayDunya Sénégal ({paydunyaConfig?.mode === 'live' ? 'Production Live' : 'API Test / Sandbox'})
                        </div>
                        <div className="text-[11px] text-[#0084FF] font-semibold">Passerelle multi-canaux (Wave, OM, Free, Cartes)</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      paydunyaConfig?.mode === 'live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {paydunyaConfig?.mode === 'live' ? 'Live Connecté' : 'Sandbox Connecté'}
                    </span>
                  </div>

                  {/* Note rassurante pour PAYDUNYA_MODE */}
                  <div className="p-3 rounded-xl bg-white border border-blue-200/80 text-[11px] space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Tolérance automatique PAYDUNYA_MODE</span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed">
                      Si vous avez saisi <code className="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded">Mode test</code> ou <code className="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded">test</code> dans vos variables d'environnement, <strong>aucun souci !</strong> Le système reconnaît automatiquement ces variantes et active l'environnement Sandbox sans provoquer d'erreur.
                    </p>
                  </div>

                  {/* Sélecteur rapide de Mode Test / Mode Live */}
                  <div className="space-y-1.5 pt-1 border-t border-blue-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-700 font-semibold text-[11px]">Environnement actif :</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        PAYDUNYA_MODE = "{paydunyaConfig?.rawMode || 'test'}" (interprété: "{paydunyaConfig?.mode || 'test'}")
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isSwitchingPayDunyaMode}
                        onClick={() => handleSwitchPaydunyaMode('test')}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          paydunyaConfig?.mode !== 'live'
                            ? 'bg-[#0084FF] text-white border-[#0084FF] shadow-xs'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span>🧪 Mode Test (Sandbox)</span>
                        {paydunyaConfig?.mode !== 'live' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        disabled={isSwitchingPayDunyaMode}
                        onClick={() => handleSwitchPaydunyaMode('live')}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          paydunyaConfig?.mode === 'live'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span>🚀 Mode Live (Production)</span>
                        {paydunyaConfig?.mode === 'live' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Formulaire de saisie & Test des clés API PayDunya */}
                  <div className="p-3.5 rounded-xl bg-white border border-blue-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#0084FF]" />
                        <span>Identifiants API PayDunya ({paydunyaConfig?.mode === 'live' ? 'Production' : 'Compte Test Sandbox'})</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {paydunyaConfig?.isConfigured ? 'Clés actives' : 'Clés manquantes'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="block text-zinc-600 font-semibold mb-0.5">
                          Master Key : <span className="font-normal text-zinc-400">({paydunyaConfig?.keysStatus.masterKey})</span>
                        </label>
                        <input
                          type="text"
                          value={adminMasterKey}
                          onChange={(e) => setAdminMasterKey(e.target.value)}
                          placeholder="Collez la Master Key..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono focus:border-[#0084FF] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 font-semibold mb-0.5">
                          Private Key : <span className="font-normal text-zinc-400">({paydunyaConfig?.keysStatus.privateKey})</span>
                        </label>
                        <input
                          type="text"
                          value={adminPrivateKey}
                          onChange={(e) => setAdminPrivateKey(e.target.value)}
                          placeholder="Collez la Private Key..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono focus:border-[#0084FF] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 font-semibold mb-0.5">
                          Token d'application : <span className="font-normal text-zinc-400">({paydunyaConfig?.keysStatus.token})</span>
                        </label>
                        <input
                          type="text"
                          value={adminToken}
                          onChange={(e) => setAdminToken(e.target.value)}
                          placeholder="Collez le Token..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono focus:border-[#0084FF] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 font-semibold mb-0.5">
                          Public Key (Optionnel) :
                        </label>
                        <input
                          type="text"
                          value={adminPublicKey}
                          onChange={(e) => setAdminPublicKey(e.target.value)}
                          placeholder="Collez la Public Key..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono focus:border-[#0084FF] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSavePayDunyaKeys}
                        disabled={isSavingKeys}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-xs cursor-pointer transition-colors shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSavingKeys ? 'Enregistrement...' : 'Enregistrer les clés'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestLivePayDunyaConnection}
                        disabled={isTestingConnection}
                        className="px-3 py-1.5 rounded-lg bg-[#0084FF] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isTestingConnection ? 'Test en cours avec PayDunya...' : '🔍 Tester la connexion API en direct'}</span>
                      </button>
                    </div>

                    {/* Résultat du test de connexion réel */}
                    {connectionTestResult && (
                      <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                        connectionTestResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          {connectionTestResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <span>{connectionTestResult.message}</span>
                        </div>
                        {!connectionTestResult.success && (
                          <p className="mt-1 text-zinc-600">
                            👉 Connectez-vous sur votre compte <strong>PayDunya</strong> (
                            <a href="https://app.paydunya.com" target="_blank" rel="noreferrer" className="text-[#0084FF] underline">
                              app.paydunya.com
                            </a>
                            ) &gt; <strong>Intégration API</strong> &gt; <strong>Applications</strong> &gt; Mode Test pour copier vos clés exactes.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-blue-200/60 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600">Endpoint Création Facture :</span>
                      <code className="font-mono text-zinc-900 bg-white px-1.5 py-0.5 rounded border border-blue-100">
                        POST /api/paydunya/create-invoice
                      </code>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-600 shrink-0">URL Webhook IPN Callback :</span>
                      <div className="flex items-center gap-1 overflow-hidden">
                        <code className="font-mono text-zinc-900 bg-white px-1.5 py-0.5 rounded border border-blue-100 truncate text-[10px]">
                          {paydunyaConfig?.callbackUrl || '/api/paydunya/webhook'}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paydunyaConfig?.callbackUrl || `${window.location.origin}/api/paydunya/webhook`);
                            pushToast('URL IPN Copiée', 'Collez-la dans votre dashboard PayDunya (URL de rappel IPN).');
                          }}
                          className="px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold shrink-0 cursor-pointer"
                        >
                          Copier
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600">URL Portail Checkout :</span>
                      <span className="font-mono text-blue-700 truncate max-w-[240px]">
                        {paydunyaConfig?.checkoutUrl || 'https://app.paydunya.com/sandbox-checkout'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200/60">
                    <button
                      type="button"
                      onClick={handleTestPayDunyaWebhook}
                      className="px-3 py-1.5 rounded-lg bg-[#0084FF] hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Tester un Webhook IPN ({paydunyaConfig?.mode === 'live' ? 'Live' : 'Sandbox'})</span>
                    </button>
                    <a
                      href="https://developers.paydunya.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 font-semibold text-xs border border-zinc-200 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Doc PayDunya</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>
                </div>

                {/* 2. Wave Direct */}
                <div className="p-3.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F5] space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-[#111111]">Wave Sénégal Direct (Push API)</div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Actif</span>
                  </div>
                  <div className="text-[#777777]">Webhook Target : <span className="font-mono text-[11px] text-[#111111]">/api/webhooks/wave</span></div>
                  <div className="text-[11px] text-emerald-700 font-semibold">Validation push instantanée</div>
                </div>

                {/* 3. Orange Money Direct */}
                <div className="p-3.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F5] space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-[#111111]">Orange Money Merchant Gateway</div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Actif</span>
                  </div>
                  <div className="text-[#777777]">USSD Code : <span className="font-mono text-[11px] text-[#111111]">#144#391#</span></div>
                  <div className="text-[11px] text-emerald-700 font-semibold">Max It API Provider v2.1</div>
                </div>
              </div>
            </div>

            {/* Journal des Webhooks IPN */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Journal des Webhooks Récents (Logs IPN)</h3>
                  <p className="text-xs text-[#777777]">Événements de paiement reçus par le serveur en temps réel</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestPayDunyaWebhook}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  + Simuler IPN
                </button>
              </div>

              <div className="space-y-2 text-xs max-h-96 overflow-y-auto">
                {webhookLog.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#111111] flex items-center gap-1.5">
                        <span>{log.provider}</span>
                        <span className="text-[10px] text-zinc-400 font-normal font-mono">({log.event})</span>
                      </div>
                      <div className="text-[11px] text-[#777777]">
                        Commande <span className="font-semibold text-zinc-900">{log.orderNumber}</span> · Reçu à {log.time}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1 : ÉDITEUR DE PRODUIT COMPLET (Style AliExpress) */}
      {/* ======================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E5E5E5] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111111]">
                  {editingProduct ? `Modifier le produit : ${editingProduct.name}` : 'Créer un nouveau produit (Fiche Marchand)'}
                </h3>
                <p className="text-xs text-[#777777]">
                  Configurez le titre, les photos HD, les combinaisons Tailles × Couleurs et la tarification
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-[#777777] hover:bg-[#F7F7F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs inside product editor */}
            <div className="px-6 border-b border-[#E5E5E5] flex items-center gap-4 bg-[#F7F7F5] overflow-x-auto text-xs font-semibold">
              {[
                { id: 'general', label: '1. Informations Générales' },
                { id: 'media', label: `2. Photos & Médias (${formImages.length})` },
                { id: 'variants', label: `3. Matrice de Variantes (${formVariants.length})` },
                { id: 'flocage', label: '4. Flocage & Expédition' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditorActiveTab(t.id as typeof editorActiveTab)}
                  className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                    editorActiveTab === t.id
                      ? 'border-[#FF5A1F] text-[#FF5A1F] font-bold'
                      : 'border-transparent text-[#777777] hover:text-[#111111]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProductEditor} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* ONGLET 1 : GÉNÉRAL */}
              {editorActiveTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1 text-[#111111]">Titre officiel du produit *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: Maillot Pro Lions Domicile – Édition Prestige"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E5] text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#111111]">SKU Référence de base *</label>
                      <input
                        type="text"
                        required
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-[#E5E5E5] font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#111111]">Catégorie</label>
                      <select
                        value={formCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-xs font-semibold"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#111111]">Marque</label>
                      <input
                        type="text"
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#111111]">Statut du produit</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as Product['status'])}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-xs font-bold"
                      >
                        <option value="ACTIVE">Actif (En ligne)</option>
                        <option value="DRAFT">Brouillon</option>
                        <option value="OUT_OF_STOCK">Rupture de stock</option>
                        <option value="ARCHIVED">Archivé</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#111111]">Prix de vente (FCFA) *</label>
                      <input
                        type="number"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-lg border border-[#E5E5E5] font-bold tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-[#111111]">Ancien prix barré (FCFA)</label>
                      <input
                        type="number"
                        value={formOldPrice || ''}
                        onChange={(e) => setFormOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Optionnel"
                        className="w-full px-3.5 py-2 rounded-lg border border-[#E5E5E5] tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111111]">Description détaillée</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5E5E5]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111111]">Caractéristiques (1 par ligne)</label>
                    <textarea
                      rows={3}
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5E5E5]"
                    />
                  </div>
                </div>
              )}

              {/* ONGLET 2 : PHOTOS & MÉDIAS (Upload Téléphone / PC, Galerie & URLs) */}
              {editorActiveTab === 'media' && (
                <div className="space-y-6">
                  {/* Hidden native file inputs for phone & PC */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFilesSelected}
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFilesSelected}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />

                  {/* 1. ZONE PRINCIPALE D'IMPORTATION DEPUIS TÉLÉPHONE OU PC */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverMedia(true);
                    }}
                    onDragLeave={() => setIsDragOverMedia(false)}
                    onDrop={handleMediaDrop}
                    className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
                      isDragOverMedia
                        ? 'border-[#FF5A1F] bg-[#FFE8DE]/40 scale-[1.01]'
                        : 'border-zinc-300 bg-[#FBFBFA] hover:border-zinc-400 hover:bg-[#F7F7F5]'
                    }`}
                  >
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/10 text-[#FF5A1F] flex items-center justify-center mx-auto shadow-2xs">
                        <Upload className="w-7 h-7" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-[#111111]">
                          Importer des photos depuis votre téléphone ou PC
                        </h4>
                        <p className="text-xs text-[#777777] max-w-sm mx-auto leading-relaxed">
                          Sélectionnez une ou plusieurs photos depuis votre galerie, dossier ou prenez directement une photo avec votre appareil photo.
                        </p>
                      </div>

                      {/* Boutons d'action pour téléphone et ordinateur */}
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImages}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choisir des photos (PC / Téléphone)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={isUploadingImages}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4 text-[#FF5A1F]" />
                          <span>Prendre une photo (Appareil)</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-[#999999]">
                        Formats supportés : JPG, PNG, WEBP · Traitement et optimisation automatique
                      </div>

                      {isUploadingImages && (
                        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-[#FF5A1F] animate-pulse">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Optimisation et chargement des photos en cours...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. GALERIE PHOTOS HD DU PRODUIT */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                      <div>
                        <h4 className="font-bold text-sm text-[#111111]">
                          Galerie Photos HD ({formImages.length} photo{formImages.length > 1 ? 's' : ''})
                        </h4>
                        <p className="text-xs text-[#777777]">
                          La première photo est l'image principale visible sur l'accueil, la boutique et la fiche produit.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-[#FF5A1F] hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter plus</span>
                      </button>
                    </div>

                    {formImages.length === 0 ? (
                      <div className="p-8 text-center bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] text-xs text-[#777777]">
                        Aucune photo pour l'instant. Utilisez le bouton ci-dessus pour importer la première photo.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                        {formImages.map((img, idx) => (
                          <div
                            key={idx}
                            className={`relative aspect-square rounded-2xl border overflow-hidden group bg-[#F7F7F5] shadow-2xs transition-all ${
                              idx === 0 ? 'border-2 border-[#FF5A1F] ring-2 ring-[#FFE8DE]' : 'border-[#E5E5E5] hover:border-zinc-400'
                            }`}
                          >
                            <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                            <div
                              className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black shadow-xs ${
                                idx === 0 ? 'bg-[#FF5A1F] text-white' : 'bg-black/75 text-white'
                              }`}
                            >
                              {idx === 0 ? '★ Principale' : `#${idx + 1}`}
                            </div>

                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...formImages];
                                  const [moved] = updated.splice(idx, 1);
                                  updated.unshift(moved);
                                  setFormImages(updated);
                                }}
                                className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-white/95 text-[10px] font-bold text-[#111111] hover:bg-white shadow-xs cursor-pointer transition-transform active:scale-95"
                              >
                                Mettre 1ère
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setFormImages(formImages.filter((_, i) => i !== idx))}
                              title="Supprimer cette photo"
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. OPTION SECONDAIRE : AJOUTER PAR URL OU PRÉRÉGLAGES RAPIDES */}
                  <div className="pt-4 border-t border-[#E5E5E5] space-y-3 bg-[#F7F7F5] p-4 rounded-2xl">
                    <label className="font-bold block text-xs text-[#111111]">
                      Optionnel : Ajouter par URL web directe ou modèle prédéfini
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formNewImageUrl}
                        onChange={(e) => setFormNewImageUrl(e.target.value)}
                        placeholder="https://... (Lien direct vers une photo)"
                        className="flex-1 px-3 py-2 rounded-xl border border-[#E5E5E5] bg-white text-xs focus:outline-none focus:border-[#111111]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (formNewImageUrl.trim()) {
                              setFormImages([...formImages, formNewImageUrl.trim()]);
                              setFormNewImageUrl('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formNewImageUrl.trim()) {
                            setFormImages([...formImages, formNewImageUrl.trim()]);
                            setFormNewImageUrl('');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ajouter l'URL
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#777777]">
                      <span className="font-semibold text-[#111111]">Modèles de photos disponibles :</span>
                      <button type="button" onClick={() => setFormImages([...formImages, SMARTPHONE_IMAGE_URL])} className="underline hover:text-[#111111] cursor-pointer">📱 Smartphone 5G</button>
                      <span>·</span>
                      <button type="button" onClick={() => setFormImages([...formImages, EARBUDS_IMAGE_URL])} className="underline hover:text-[#111111] cursor-pointer">🎧 Écouteurs ANC</button>
                      <span>·</span>
                      <button type="button" onClick={() => setFormImages([...formImages, AIRFRYER_IMAGE_URL])} className="underline hover:text-[#111111] cursor-pointer">🍳 Air Fryer XXL</button>
                      <span>·</span>
                      <button type="button" onClick={() => setFormImages([...formImages, SMARTWATCH_IMAGE_URL])} className="underline hover:text-[#111111] cursor-pointer">⌚ Montre Ultra</button>
                      <span>·</span>
                      <button type="button" onClick={() => setFormImages([...formImages, SNEAKER_IMAGE_URL])} className="underline hover:text-[#111111] cursor-pointer">👟 Sneakers</button>
                      <span>·</span>
                      <button type="button" onClick={() => setFormImages([...formImages, HOODIE_IMAGE_URL])} className="underline hover:text-[#111111] cursor-pointer">🧥 Hoodie</button>
                      <span>·</span>
                      <button type="button" onClick={() => setFormImages([...formImages, FLOCAGE_IMAGE_URL])} className="underline hover:text-[#111111] cursor-pointer">🎨 Flocage</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 3 : MATRICE DE VARIANTES & SÉLECTEUR DE COULEURS */}
              {editorActiveTab === 'variants' && (
                <div className="space-y-6">
                  {/* 1. Configuration des Options et Couleurs */}
                  <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-5 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-[#111111]">1. Couleurs & Options actives</h4>
                          <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E5] px-2.5 py-1 rounded-xl shadow-2xs">
                            <span className="text-[11px] text-[#777777] font-medium">Catégorie :</span>
                            <select
                              value={formCategory}
                              onChange={(e) => handleCategoryChange(e.target.value)}
                              className="bg-transparent text-xs font-bold text-[#FF5A1F] focus:outline-none cursor-pointer"
                              title="Changer de catégorie adapte automatiquement les options ci-dessous"
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-[#777777] mt-1">
                          Les options et les couleurs ci-dessous génèrent automatiquement la matrice de variantes
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRegenerateVariantsMatrix}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Régénérer la matrice ({formSizes.length * formColors.length} combinaisons)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* ======================================================== */}
                      {/* COLONNE GAUCHE : COULEURS CONFIGURÉES & NUANCIER */}
                      {/* ======================================================== */}
                      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-xs text-[#111111] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                              <span>Couleurs configurées ({formColors.length})</span>
                            </span>
                            <span className="text-[11px] text-[#777777]">Teintes disponibles pour ce produit</span>
                          </div>

                          {/* Bouton pour ouvrir le menu de sélection de couleur */}
                          <button
                            type="button"
                            onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                              isColorMenuOpen
                                ? 'bg-zinc-900 text-white'
                                : 'bg-[#FF5A1F] hover:bg-zinc-900 text-white'
                            }`}
                          >
                            <Palette className="w-3.5 h-3.5" />
                            <span>{isColorMenuOpen ? 'Fermer le menu' : '+ Choisir une couleur'}</span>
                          </button>
                        </div>

                        {/* Badges des couleurs configurées actives */}
                        <div className="flex flex-wrap gap-2 min-h-9 items-center">
                          {formColors.map((col, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-semibold text-[#111111] group hover:border-[#111111] transition-all"
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span>{col.name}</span>
                              <span className="text-[10px] text-[#777777] font-mono">{col.hex}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(col.name)}
                                title={`Retirer ${col.name}`}
                                className="ml-0.5 p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 text-zinc-400 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* MENU DÉDIÉ / NUANCIER POUR CHOISIR UNE COULEUR */}
                        {isColorMenuOpen && (
                          <div className="mt-3 p-4 rounded-2xl border-2 border-[#FF5A1F]/30 bg-[#FFFDFB] space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                              <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-[#FF5A1F]" />
                                <h5 className="font-bold text-xs text-[#111111]">
                                  Menu de sélection des couleurs
                                </h5>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsColorMenuOpen(false)}
                                className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Barre de recherche et filtres de famille */}
                            <div className="space-y-2">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={colorSearchFilter}
                                  onChange={(e) => setColorSearchFilter(e.target.value)}
                                  placeholder="Filtrer (ex: Titane, Noir, Bleu, Or, Sable, Vert...)"
                                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs focus:outline-none focus:border-[#FF5A1F]"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                                {[
                                  { id: 'all', label: 'Toutes (28)' },
                                  { id: 'tech', label: '📱 Tech & Titane' },
                                  { id: 'classique', label: '👔 Mode & Neutres' },
                                  { id: 'sport', label: '⚡ Sport & Vives' },
                                  { id: 'vif', label: '🎨 Pastels & Électriques' },
                                ].map((tab) => (
                                  <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setColorFamilyFilter(tab.id as typeof colorFamilyFilter)}
                                    className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                      colorFamilyFilter === tab.id
                                        ? 'bg-[#111111] text-white'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                    }`}
                                  >
                                    {tab.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Grille des teintes disponibles dans le nuancier */}
                            <div className="max-h-48 overflow-y-auto pr-1">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {COLOR_PRESETS_CATALOG
                                  .filter((c) => {
                                    if (colorFamilyFilter !== 'all' && c.family !== colorFamilyFilter) return false;
                                    if (!colorSearchFilter.trim()) return true;
                                    return (
                                      c.name.toLowerCase().includes(colorSearchFilter.toLowerCase()) ||
                                      c.hex.toLowerCase().includes(colorSearchFilter.toLowerCase())
                                    );
                                  })
                                  .map((col, idx) => {
                                    const isAlreadyConfigured = formColors.some(
                                      (fc) => fc.name.toLowerCase() === col.name.toLowerCase()
                                    );
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAddColor({ name: col.name, hex: col.hex })}
                                        className={`p-2 rounded-xl border text-left flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                                          isAlreadyConfigured
                                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                                            : 'border-[#E5E5E5] bg-white hover:border-[#FF5A1F] hover:shadow-xs text-[#111111]'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span
                                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                            style={{ backgroundColor: col.hex }}
                                          />
                                          <div className="truncate">
                                            <div className="text-[11px] font-semibold truncate leading-tight">
                                              {col.name}
                                            </div>
                                            <div className="text-[10px] text-zinc-400 font-mono">
                                              {col.hex}
                                            </div>
                                          </div>
                                        </div>

                                        {isAlreadyConfigured ? (
                                          <span className="text-[10px] text-emerald-700 font-bold shrink-0">
                                            ✓
                                          </span>
                                        ) : (
                                          <Plus className="w-3 h-3 text-[#FF5A1F] shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>

                            {/* Sélecteur de couleur personnalisée libre (Pipette & Nom) */}
                            <div className="pt-3 border-t border-[#E5E5E5] bg-white p-3 rounded-xl border border-zinc-200 space-y-2">
                              <span className="block font-bold text-[11px] text-[#111111]">
                                Ou créer une teinte personnalisée sur-mesure :
                              </span>

                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  {/* Pipette native HTML5 */}
                                  <input
                                    type="color"
                                    value={customColorHexInput}
                                    onChange={(e) => setCustomColorHexInput(e.target.value)}
                                    className="w-9 h-8 p-0.5 rounded-lg border border-[#E5E5E5] cursor-pointer bg-white"
                                    title="Choisir la couleur sur la palette complète"
                                  />
                                  <input
                                    type="text"
                                    value={customColorHexInput}
                                    onChange={(e) => setCustomColorHexInput(e.target.value)}
                                    placeholder="#RRGGBB"
                                    className="w-20 px-2 py-1.5 rounded-lg border border-[#E5E5E5] font-mono text-xs uppercase"
                                  />
                                </div>

                                <input
                                  type="text"
                                  value={customColorNameInput}
                                  onChange={(e) => setCustomColorNameInput(e.target.value)}
                                  placeholder="Nom de la couleur (ex: Bleu Nuit)"
                                  className="flex-1 w-full px-3 py-1.5 rounded-lg border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#FF5A1F]"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddCustomColorSubmit();
                                    }
                                  }}
                                />

                                <button
                                  type="button"
                                  onClick={handleAddCustomColorSubmit}
                                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-[#FF5A1F] hover:bg-zinc-900 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                                >
                                  Ajouter cette teinte
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ======================================================== */}
                      {/* COLONNE DROITE : TAILLES & OPTIONS PAR CATÉGORIE */}
                      {/* ======================================================== */}
                      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-xs text-[#111111] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>
                                {formCategory.includes('High-Tech') || formCategory.includes('Électronique')
                                  ? `Options de Stockage / RAM (${formSizes.length})`
                                  : formCategory.includes('Maison')
                                  ? `Capacités & Volumes (${formSizes.length})`
                                  : formCategory.includes('Sports')
                                  ? `Pointures ou Boîtiers (${formSizes.length})`
                                  : formCategory.includes('Mode')
                                  ? `Tailles de vêtement (${formSizes.length})`
                                  : `Options & Tailles (${formSizes.length})`}
                              </span>
                            </span>
                            <span className="text-[11px] text-[#777777]">
                              Spécifiques à la catégorie "{formCategory}"
                            </span>
                          </div>
                        </div>

                        {/* Badges des options configurées actives */}
                        <div className="flex flex-wrap gap-1.5 min-h-9 items-center">
                          {formSizes.map((sz) => (
                            <span
                              key={sz}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] font-bold text-xs text-[#111111] group hover:border-[#111111] transition-all"
                            >
                              <span>{sz}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(sz)}
                                title={`Retirer l'option ${sz}`}
                                className="p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 text-zinc-400 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Préréglages recommandés pour la catégorie courante */}
                        <div className="space-y-1.5 pt-2 border-t border-[#E5E5E5]">
                          <span className="block font-bold text-[11px] text-[#111111]">
                            Préréglages recommandés pour "{formCategory}" :
                          </span>

                          <div className="flex flex-wrap gap-1.5">
                            {getCategoryPresets(formCategory).map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleApplyPresetBundle(preset)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-[#FF5A1F] hover:text-white text-zinc-800 text-[11px] font-semibold transition-colors cursor-pointer border border-zinc-200"
                                title={`Charger : ${preset.options.join(', ')}`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Ajout d'une option ou taille personnalisée libre */}
                        <div className="pt-2 border-t border-[#E5E5E5] space-y-1.5">
                          <span className="block font-bold text-[11px] text-[#111111]">
                            Ajouter une option / taille personnalisée libre :
                          </span>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customSizeInput}
                              onChange={(e) => setCustomSizeInput(e.target.value)}
                              placeholder={
                                formCategory.includes('High-Tech')
                                  ? 'Ex: 1 To, 2 To, 32 Go...'
                                  : formCategory.includes('Maison')
                                  ? 'Ex: 10L Pro, Cuve Double...'
                                  : formCategory.includes('Sports')
                                  ? 'Ex: 46 EU, Boîtier 49mm...'
                                  : 'Ex: 3XL, 4XL, Sur-mesure...'
                              }
                              className="flex-1 px-3 py-1.5 rounded-lg border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#FF5A1F]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSize(customSizeInput);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSize(customSizeInput)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#111111] hover:bg-[#FF5A1F] text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              + Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Matrice détaillée des Variantes */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                      <div>
                        <h4 className="font-bold text-sm text-[#111111]">
                          2. Matrice détaillée des Variantes ({formVariants.length} combinaison{formVariants.length > 1 ? 's' : ''})
                        </h4>
                        <p className="text-xs text-[#777777]">
                          Choisissez la couleur et la taille/option configurée, ou personnalisez les prix et stocks
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddManualVariantRow}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FF5A1F] hover:bg-zinc-900 text-white font-bold text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Variante sur-mesure</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyGlobalVariantPrice(formPrice)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-[#111111] hover:border-[#111111] font-semibold text-xs cursor-pointer shadow-2xs"
                        >
                          Appliquer prix {formatFCFA(formPrice)} à tous
                        </button>
                        <button
                          type="button"
                          onClick={handleAutoCalculateVariantOldPrices}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#FF5A1F]/40 text-[#FF5A1F] hover:bg-[#FFE8DE]/30 font-semibold text-xs cursor-pointer shadow-2xs"
                          title="Calcule automatiquement l'ancien prix barré de chaque variante selon la réduction de base"
                        >
                          Auto-calculer prix barrés
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyGlobalVariantStock(15)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-[#111111] hover:border-[#111111] font-semibold text-xs cursor-pointer shadow-2xs"
                        >
                          Mettre 15 pcs à tous
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAllVariantsActive(true)}
                          className="px-2 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-semibold text-[11px] cursor-pointer"
                        >
                          Tout cocher
                        </button>
                      </div>
                    </div>

                    {/* Table de la matrice */}
                    <div className="border border-[#E5E5E5] rounded-2xl overflow-x-auto max-h-80 bg-white shadow-2xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F7F7F5] text-[11px] font-bold text-[#777777] sticky top-0 z-10 border-b border-[#E5E5E5]">
                          <tr>
                            <th className="py-2.5 px-3 min-w-[190px]">Variante (Couleur × Option)</th>
                            <th className="py-2.5 px-2">Photo liée</th>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3">Prix (FCFA)</th>
                            <th className="py-2.5 px-3">Prix barré (Ancien)</th>
                            <th className="py-2.5 px-3">Stock</th>
                            <th className="py-2.5 px-3 text-center">Active</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5] text-xs">
                          {formVariants.map((v, idx) => {
                            const variantPhoto =
                              v.image || formColors.find((c) => c.name === v.color)?.image || formImages[0];

                            return (
                              <tr key={v.id || idx} className="hover:bg-[#F7F7F5]/60 transition-colors">
                                <td className="py-2 px-3 font-semibold text-[#111111]">
                                  <div className="flex flex-wrap items-center gap-1.5 min-w-[190px]">
                                    {/* Sélecteur de la couleur parmi les couleurs configurées */}
                                    <div className="flex items-center gap-1">
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                        style={{ backgroundColor: v.colorHex }}
                                      />
                                      <select
                                        value={v.color}
                                        onChange={(e) => {
                                          const selectedColor = formColors.find((c) => c.name === e.target.value);
                                          const updated = [...formVariants];
                                          updated[idx] = {
                                            ...v,
                                            color: e.target.value,
                                            colorHex: selectedColor ? selectedColor.hex : v.colorHex,
                                            image: selectedColor?.image || v.image,
                                          };
                                          setFormVariants(updated);
                                        }}
                                        className="px-2 py-1 rounded-lg border border-[#E5E5E5] bg-white text-xs font-semibold text-[#111111] hover:border-[#FF5A1F]"
                                        title="Choisir parmi les couleurs configurées"
                                      >
                                        {formColors.map((c) => (
                                          <option key={c.name} value={c.name}>
                                            {c.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <span className="text-[#999999]">/</span>

                                    {/* Sélecteur de la taille / option parmi les options configurées */}
                                    <select
                                      value={v.size}
                                      onChange={(e) => {
                                        const updated = [...formVariants];
                                        updated[idx] = { ...v, size: e.target.value };
                                        setFormVariants(updated);
                                      }}
                                      className="px-2 py-1 rounded-lg border border-[#E5E5E5] bg-white text-xs font-bold text-[#FF5A1F] hover:border-[#FF5A1F]"
                                      title="Choisir parmi les options / tailles configurées"
                                    >
                                      {formSizes.map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </td>

                                {/* Photo liée à la variante */}
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-1.5">
                                    {variantPhoto ? (
                                      <img
                                        src={variantPhoto}
                                        alt={v.color}
                                        className="w-8 h-8 rounded-lg object-cover border border-[#E5E5E5] shrink-0"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-dashed border-zinc-300 flex items-center justify-center text-[10px] text-zinc-400 shrink-0">
                                        N/A
                                      </div>
                                    )}
                                    {formImages.length > 0 && (
                                      <select
                                        value={v.image || ''}
                                        onChange={(e) => {
                                          const updated = [...formVariants];
                                          updated[idx] = { ...v, image: e.target.value || undefined };
                                          setFormVariants(updated);
                                        }}
                                        className="text-[11px] px-1.5 py-1 rounded border border-[#E5E5E5] bg-white max-w-[90px] truncate"
                                        title="Sélectionner une photo parmi les images du produit"
                                      >
                                        <option value="">Auto (Couleur)</option>
                                        {formImages.map((img, iIdx) => (
                                          <option key={iIdx} value={img}>
                                            Photo #{iIdx + 1}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                </td>

                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={v.sku}
                                    onChange={(e) => {
                                      const updated = [...formVariants];
                                      updated[idx] = { ...v, sku: e.target.value };
                                      setFormVariants(updated);
                                    }}
                                    className="w-32 px-2 py-1 rounded-lg border border-[#E5E5E5] font-mono text-[11px]"
                                  />
                                </td>

                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    value={v.price}
                                    onChange={(e) => {
                                      const updated = [...formVariants];
                                      updated[idx] = { ...v, price: Number(e.target.value) };
                                      setFormVariants(updated);
                                    }}
                                    className="w-24 px-2 py-1 rounded-lg border border-[#E5E5E5] font-bold tabular-nums"
                                  />
                                </td>

                                {/* Ancien prix barré pour la variante */}
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    placeholder="Optionnel"
                                    value={v.oldPrice || ''}
                                    onChange={(e) => {
                                      const updated = [...formVariants];
                                      const val = e.target.value ? Number(e.target.value) : undefined;
                                      updated[idx] = { ...v, oldPrice: val };
                                      setFormVariants(updated);
                                    }}
                                    className="w-24 px-2 py-1 rounded-lg border border-[#E5E5E5] text-zinc-500 line-through font-semibold tabular-nums text-xs"
                                    title="Prix barré de référence pour cette variante"
                                  />
                                </td>

                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    value={v.stock}
                                    onChange={(e) => {
                                      const updated = [...formVariants];
                                      updated[idx] = { ...v, stock: Number(e.target.value) };
                                      setFormVariants(updated);
                                    }}
                                    className="w-16 px-2 py-1 rounded-lg border border-[#E5E5E5] tabular-nums font-bold"
                                  />
                                </td>

                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={v.active}
                                    onChange={(e) => {
                                      const updated = [...formVariants];
                                      updated[idx] = { ...v, active: e.target.checked };
                                      setFormVariants(updated);
                                    }}
                                    className="w-4 h-4 rounded accent-[#FF5A1F]"
                                  />
                                </td>

                                <td className="py-2 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVariantRow(idx)}
                                    title="Supprimer cette variante spécifique"
                                    className="p-1 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 4 : FLOCAGE & EXPÉDITION */}
              {editorActiveTab === 'flocage' && (
                <div className="space-y-4">
                  <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-5 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFlocageEligible}
                        onChange={(e) => setFormFlocageEligible(e.target.checked)}
                        className="w-4 h-4 rounded text-[#FF5A1F]"
                      />
                      <div>
                        <div className="font-bold text-[#111111]">Article éligible à la personnalisation en atelier</div>
                        <div className="text-[#777777]">Affiche le badge "Flocage disponible" et le raccourci vers le configurateur de flocage</div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 text-[#111111]">Poids net estimé (kg)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={formWeightKg}
                        onChange={(e) => setFormWeightKg(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F5] font-semibold"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white font-bold transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Enregistrer les modifications' : 'Créer et publier le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2 : FICHE EXPÉDITION & BORDEREAU DE LIVRAISON */}
      {/* ======================================================== */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E5E5] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-4">
              <div>
                <span className="text-xs font-bold text-[#FF5A1F]">BORDEREAU D’EXPÉDITION DAKAR</span>
                <h3 className="text-xl font-bold text-[#111111]">Commande {viewingOrder.orderNumber}</h3>
                <div className="text-xs text-[#777777]">Date : {viewingOrder.createdAt}</div>
              </div>
              <button type="button" onClick={() => setViewingOrder(null)} className="p-1 rounded-lg text-[#777777] hover:bg-[#F7F7F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F7F5] space-y-1">
                <div className="text-[#777777] font-semibold">Destinataire :</div>
                <div className="font-bold text-[#111111]">{viewingOrder.customerName}</div>
                <div className="tabular-nums font-semibold">{viewingOrder.customerPhone}</div>
                <div>{viewingOrder.customerEmail}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F7F5] space-y-1">
                <div className="text-[#777777] font-semibold">Adresse de livraison :</div>
                <div className="font-bold text-[#111111]">{viewingOrder.shippingAddress.street}</div>
                <div>{viewingOrder.shippingAddress.city} – {viewingOrder.shippingAddress.region}</div>
                {viewingOrder.shippingAddress.instructions && (
                  <div className="text-[#FF5A1F] italic">{viewingOrder.shippingAddress.instructions}</div>
                )}
              </div>
            </div>

            {/* Tracking & Carrier assignment */}
            <div className="p-4 rounded-xl border border-[#E5E5E5] space-y-3 text-xs">
              <div className="font-bold text-[#111111]">Assignation Transporteur & Suivi Colis</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777777] mb-1">Société de livraison</label>
                  <select
                    value={orderCarrierInput}
                    onChange={(e) => setOrderCarrierInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white font-semibold"
                  >
                    <option value="Coursier Dakar Express">Coursier Dakar Express (24h)</option>
                    <option value="ChronoPoste SN">ChronoPoste Sénégal</option>
                    <option value="GP Express Régions">GP Express Régions</option>
                    <option value="Retrait Showroom Point E">Retrait Showroom Point E</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#777777] mb-1">Numéro de tracking colis</label>
                  <input
                    type="text"
                    value={orderTrackingInput}
                    onChange={(e) => setOrderTrackingInput(e.target.value)}
                    placeholder="Ex: DKR-TRK-8492"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] font-mono"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateOrderTracking(viewingOrder.id, orderTrackingInput || `DKR-TRK-${viewingOrder.orderNumber.slice(-4)}`, orderCarrierInput);
                  setViewingOrder((prev) => prev ? { ...prev, trackingNumber: orderTrackingInput, carrier: orderCarrierInput, orderStatus: 'SHIPPED' } : null);
                }}
                className="px-4 py-2 rounded-lg bg-[#111111] text-white font-semibold text-xs"
              >
                Enregistrer l'expédition & Passer en "En livraison"
              </button>
            </div>

            {/* Printable Slip Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#111111] text-xs font-bold text-[#111111] hover:bg-[#F7F7F5]"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le bordereau</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3 : CRÉER UN COUPON DE PROMOTION */}
      {/* ======================================================== */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddCouponSubmit} className="bg-white rounded-3xl border border-[#E5E5E5] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
              <h3 className="text-base font-bold text-[#111111]">Nouveau Code Promo</h3>
              <button type="button" onClick={() => setShowCouponModal(false)} className="p-1 text-[#777777]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#111111]">Code (ex: TABASKI20, DAKAR15)</label>
              <input
                type="text"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                placeholder="PROMO20"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] uppercase font-mono font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#111111]">Remise (%)</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  required
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111111]">Achat Min (FCFA)</label>
                <input
                  type="number"
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#111111]">Date d'expiration</label>
              <input
                type="text"
                value={newCouponExpiry}
                onChange={(e) => setNewCouponExpiry(e.target.value)}
                placeholder="Ex: 31 Décembre 2026"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Créer et activer le coupon
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : GUIDE DÉPLOIEMENT DOCKER & SERVEUR PERSONNEL     */}
      {/* ======================================================== */}
      {showDockerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white rounded-3xl border border-[#E5E5E5] max-w-2xl w-full shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    Déploiement Docker sur Votre Propre Serveur
                  </h3>
                  <p className="text-xs text-[#777777]">
                    Tous les fichiers Docker et Nginx sont déjà configurés et prêts à l'emploi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDockerModal(false)}
                className="p-1.5 rounded-lg text-[#777777] hover:bg-[#F7F7F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] space-y-2">
                <span className="font-bold text-[#111111] flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Commande unique de lancement (Docker Compose) :</span>
                </span>
                <div className="flex items-center justify-between gap-2 bg-[#111111] text-emerald-400 p-3 rounded-xl font-mono text-[11px]">
                  <code>docker compose up -d --build</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('docker compose up -d --build');
                      pushToast('Copié !', 'Commande Docker copiée dans le presse-papiers.');
                    }}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Copier
                  </button>
                </div>
                <p className="text-[11px] text-[#777777]">
                  Votre boutique sera accessible immédiatement sur : <span className="font-mono text-[#111111]">http://IP-DE-VOTRE-SERVEUR:3000</span>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#111111]">Fichiers préparés dans votre projet :</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl border border-zinc-200 bg-white">
                    <span className="font-mono font-bold text-[#111111]">Dockerfile</span>
                    <p className="text-zinc-500 mt-0.5">Build Node.js + Serveur Nginx Alpine ultra-léger (&lt; 20 Mo de RAM).</p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-zinc-200 bg-white">
                    <span className="font-mono font-bold text-[#111111]">docker-compose.yml</span>
                    <p className="text-zinc-500 mt-0.5">Configuration du port 3000, redémarrage auto, healthchecks et logs.</p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-zinc-200 bg-white">
                    <span className="font-mono font-bold text-[#111111]">nginx.conf</span>
                    <p className="text-zinc-500 mt-0.5">Routage SPA complet, compression Gzip mobile, en-têtes de sécurité.</p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-zinc-200 bg-white">
                    <span className="font-mono font-bold text-[#111111]">DEPLOY_DOCKER.md</span>
                    <p className="text-zinc-500 mt-0.5">Guide pas-à-pas avec nom de domaine et SSL gratuit (Certbot).</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <span>💡</span> Astuce pour le port 80 direct :
                </span>
                <p>
                  Pour lancer directement sur le port web standard 80 sans taper :3000 dans l'adresse, lancez simplement :
                  <br />
                  <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-amber-950">PORT=80 docker compose up -d --build</code>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E5E5] flex justify-end">
              <button
                type="button"
                onClick={() => setShowDockerModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-bold transition-colors cursor-pointer"
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
