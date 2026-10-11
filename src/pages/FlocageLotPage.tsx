import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../services/payment';
import { PlayerCustomizationRow } from '../types';
import { FlocagePreview } from '../components/flocage/FlocagePreview';
import { QuoteForm } from '../components/flocage/QuoteForm';

const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const FlocageLotPage: React.FC = () => {
  const {
    navigateTo,
    flocagePricing,
    calculateVolumeDiscountPct,
    addToCartFlocage,
    pushToast,
  } = useStore();

  const [garmentType, setGarmentType] = useState<'Maillot' | 'T-shirt' | 'Autre'>('Maillot');
  const [garmentBgColor, setGarmentBgColor] = useState<string>('#0E5A36');
  const [defaultFont, setDefaultFont] = useState<string>('Football Pro');
  const [defaultColor, setDefaultColor] = useState<string>('Blanc');

  const [players, setPlayers] = useState<PlayerCustomizationRow[]>([
    { id: 'pl-1', name: 'MBAYE', number: '10', size: 'L', color: 'Blanc', font: 'Football Pro' },
    { id: 'pl-2', name: 'SARR', number: '7', size: 'M', color: 'Blanc', font: 'Football Pro' },
    { id: 'pl-3', name: 'NDIAYE', number: '11', size: 'XL', color: 'Blanc', font: 'Football Pro' },
    { id: 'pl-4', name: 'KOUYATE', number: '8', size: 'L', color: 'Blanc', font: 'Football Pro' },
    { id: 'pl-5', name: 'MENDY', number: '1', size: 'XL', color: 'Blanc', font: 'Football Pro' },
  ]);

  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');

  // Logo d'équipe & Sponsor
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [logoName, setLogoName] = useState<string>('');
  const [logoPosition, setLogoPosition] = useState<'Poitrine' | 'Manche' | 'Dos' | 'Autre'>('Poitrine');

  const [sponsorDataUrl, setSponsorDataUrl] = useState<string | undefined>(undefined);
  const [sponsorName, setSponsorName] = useState<string>('');

  const quantity = players.length;
  const isQuoteVolume = quantity >= flocagePricing.volumeDiscounts.quoteMinQty;

  // Téléchargement du modèle Excel / CSV officiel
  const handleDownloadCsvTemplate = () => {
    const csvContent = [
      'Nom,Numéro,Taille,Couleur,Police',
      'Mbaye,10,L,Blanc,Football Pro',
      'Sarr,7,M,Blanc,Football Pro',
      'Ndiaye,11,XL,Blanc,Football Pro',
      'Mane,10,M,Blanc,Football Pro',
      'Koulibaly,3,XL,Blanc,Football Pro',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modele_flocage_lot_terangatrend.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushToast('Modèle téléchargé', 'Fichier modele_flocage_lot_terangatrend.csv prêt à remplir.');
  };

  // Parser & valider un fichier CSV / Excel texte
  const parseAndValidateRows = (rawText: string, sourceFileName: string) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setImportErrors(['Le fichier importé est vide.']);
      return;
    }

    const errors: string[] = [];
    const parsedRows: PlayerCustomizationRow[] = [];

    lines.forEach((line, index) => {
      // Ignorer l'en-tête s'il contient "Nom"
      if (index === 0 && line.toLowerCase().includes('nom')) {
        return;
      }

      const cols = line.split(/[;,]/).map((c) => c.trim());
      const rawName = (cols[0] || '').toUpperCase();
      const rawNumber = cols[1] || '';
      const rawSize = (cols[2] || 'L').toUpperCase();
      const rawColor = cols[3] || defaultColor;
      const rawFont = cols[4] || defaultFont;

      let rowError: string | undefined = undefined;
      if (!rawName) {
        errors.push(`Ligne ${index + 1} : Nom du joueur manquant.`);
        rowError = 'Nom manquant';
      }
      if (rawNumber && !/^\d{1,3}$/.test(rawNumber)) {
        errors.push(`Ligne ${index + 1} (${rawName}) : Numéro "${rawNumber}" invalide (chiffres uniquement).`);
        rowError = 'Numéro invalide';
      }
      const normalizedSize = VALID_SIZES.includes(rawSize as typeof VALID_SIZES[number])
        ? (rawSize as PlayerCustomizationRow['size'])
        : 'L';

      if (!VALID_SIZES.includes(rawSize as typeof VALID_SIZES[number])) {
        errors.push(
          `Ligne ${index + 1} (${rawName}) : Taille "${rawSize}" non reconnue, remplacée par "L".`
        );
      }

      parsedRows.push({
        id: `imp-${Date.now()}-${index}`,
        name: rawName || `JOUEUR ${index}`,
        number: rawNumber || '10',
        size: normalizedSize,
        color: rawColor,
        font: rawFont,
        error: rowError,
      });
    });

    setImportErrors(errors);
    if (parsedRows.length > 0) {
      setPlayers(parsedRows);
      setSelectedPreviewIndex(0);
      setImportSuccessMsg(
        `${parsedRows.length} joueur(s) importés avec succès depuis ${sourceFileName}.`
      );
      pushToast(
        'Importation réussie',
        `${parsedRows.length} lignes chargées dans le tableau.`
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        parseAndValidateRows(reader.result, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemoSquad15 = () => {
    const sample15 = [
      'Nom,Numéro,Taille,Couleur,Police',
      'MENDY,1,XL,Blanc,Football Pro',
      'KOULIBALY,3,XL,Blanc,Football Pro',
      'DIALLO,22,L,Blanc,Football Pro',
      'NIAKHATE,19,L,Blanc,Football Pro',
      'JAKOBS,14,M,Blanc,Football Pro',
      'GUEYE,5,M,Blanc,Football Pro',
      'SARR,17,M,Blanc,Football Pro',
      'CAMARA,6,S,Blanc,Football Pro',
      'KOUYATE,8,L,Blanc,Football Pro',
      'MBAYE,10,L,Blanc,Football Pro',
      'NDIAYE,13,M,Blanc,Football Pro',
      'SARR,7,L,Blanc,Football Pro',
      'JACKSON,15,L,Blanc,Football Pro',
      'DIENG,9,L,Blanc,Football Pro',
      'CISSE,4,XL,Blanc,Football Pro',
    ].join('\n');
    parseAndValidateRows(sample15, 'effectif_complet_15_joueurs.csv');
  };

  const handleAddPlayer = () => {
    const nextNum = String(players.length + 1);
    setPlayers((prev) => [
      ...prev,
      {
        id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: `JOUEUR ${prev.length + 1}`,
        number: nextNum,
        size: 'L',
        color: defaultColor,
        font: defaultFont,
      },
    ]);
    setSelectedPreviewIndex(players.length);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 1) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setSelectedPreviewIndex(0);
  };

  const handleUpdatePlayer = (
    id: string,
    field: keyof PlayerCustomizationRow,
    value: string
  ) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: field === 'name' ? value.toUpperCase() : value,
              error: undefined,
            }
          : p
      )
    );
  };

  const handleAdjustSquadCount = (targetCount: number) => {
    const safeCount = Math.max(1, targetCount);
    if (safeCount > players.length) {
      const toAdd: PlayerCustomizationRow[] = [];
      for (let i = players.length; i < safeCount; i++) {
        toAdd.push({
          id: `pl-auto-${Date.now()}-${i}`,
          name: `JOUEUR ${i + 1}`,
          number: String(i + 1),
          size: 'L',
          color: defaultColor,
          font: defaultFont,
        });
      }
      setPlayers((prev) => [...prev, ...toAdd]);
    } else if (safeCount < players.length) {
      setPlayers((prev) => prev.slice(0, safeCount));
      setSelectedPreviewIndex(0);
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'LOGO' | 'SPONSOR'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (type === 'LOGO') {
          setLogoDataUrl(reader.result);
          setLogoName(file.name);
        } else {
          setSponsorDataUrl(reader.result);
          setSponsorName(file.name);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Calcul tarifaire dynamique par joueur et par volume
  const unitFlocagePrice =
    flocagePricing.namePrice +
    flocagePricing.numberPrice +
    (logoDataUrl ? flocagePricing.logoPrice : 0) +
    (sponsorDataUrl ? flocagePricing.sponsorPrice : 0);

  const discountPercent = calculateVolumeDiscountPct(quantity);
  const grossTotal = unitFlocagePrice * quantity;
  const discountAmount = Math.round((grossTotal * discountPercent) / 100);
  const netTotal = Math.max(0, grossTotal - discountAmount);

  const activePreviewPlayer = players[selectedPreviewIndex] || players[0];
  const activeColorHex =
    flocagePricing.availableColors.find((c) => c.name === activePreviewPlayer?.color)
      ?.hex || '#FFFFFF';

  const handleAddLotToCart = () => {
    addToCartFlocage({
      id: `floc-lot-${Date.now()}`,
      mode: 'LOT',
      garmentType,
      fontStyle: activePreviewPlayer?.font || defaultFont,
      textColor: activePreviewPlayer?.color || defaultColor,
      textColorHex: activeColorHex,
      position: 'Dos',
      hasLogo: Boolean(logoDataUrl),
      logoDataUrl,
      logoName: logoName || undefined,
      hasSponsor: Boolean(sponsorDataUrl),
      sponsorDataUrl,
      sponsorName: sponsorName || undefined,
      logoPosition,
      depositMode: 'DEPOT_ATELIER',
      quantity,
      players,
      unitPrice: unitFlocagePrice,
      discountPercent,
      totalPrice: netTotal,
      createdAt: new Date().toLocaleDateString('fr-FR'),
    });
    navigateTo('cart');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
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
          onClick={() => navigateTo('flocage')}
          className="hover:text-[#111111]"
        >
          Flocage
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111111] font-medium">Flocage en Lot (Équipes & Clubs)</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
            Configurateur Professionnel Clubs & Séries · URL : /flocage/lot
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">
            Flocage en Lot (Équipes, Clubs & Événements)
          </h1>
          <p className="text-sm text-[#777777] mt-1">
            Gérez la liste de vos joueurs, importez votre fichier Excel/CSV et visualisez le rendu en direct.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('flocage-seul')}
          className="px-4 py-2.5 rounded-xl border border-[#111111] text-xs font-semibold text-[#111111] hover:bg-[#111111] hover:text-white transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          ← Flocage à l’unité
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left: Step-by-Step Team Configurator */}
        <div className="lg:col-span-7 space-y-6">
          {/* ÉTAPE 1 : Nombre de vêtements & Type */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-5">
            <h2 className="text-sm font-bold text-[#111111]">
              Étape 1 · Nombre de vêtements & Support
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#777777]">
                  Nombre de joueurs :
                </span>
                <div className="flex items-center border border-[#E5E5E5] rounded-xl bg-[#F7F7F5] h-11 px-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustSquadCount(quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#111111]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={quantity}
                    onChange={(e) => handleAdjustSquadCount(Number(e.target.value))}
                    className="w-14 text-center text-sm font-bold bg-transparent tabular-nums focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustSquadCount(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#111111]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(['Maillot', 'T-shirt', 'Autre'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGarmentType(t)}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      garmentType === t
                        ? 'border-[#FF5A1F] bg-[#FFE8DE] text-[#FF5A1F]'
                        : 'border-[#E5E5E5] bg-[#F7F7F5] text-[#111111]'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Couleur du maillot d'équipe pour le preview */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
              <span className="text-xs text-[#777777]">Couleur maillot aperçu :</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Vert Lions', hex: '#0E5A36' },
                  { label: 'Noir', hex: '#111111' },
                  { label: 'Blanc', hex: '#FFFFFF' },
                  { label: 'Bleu', hex: '#1E3A8A' },
                  { label: 'Rouge', hex: '#991B1B' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setGarmentBgColor(c.hex)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      garmentBgColor === c.hex ? 'border-[#FF5A1F] scale-110' : 'border-[#E5E5E5]'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* IMPORT EXCEL / CSV POUR LES LOTS */}
          <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Vous avez beaucoup de joueurs ? Importez votre liste</span>
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Formats acceptés : .csv, .xlsx (Colonnes : Nom, Numéro, Taille)
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadDemoSquad15}
                className="text-xs font-semibold text-[#FF5A1F] hover:underline text-left sm:text-right"
              >
                Charger un exemple de 15 joueurs
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#111111] hover:bg-[#111111] hover:text-white text-xs font-semibold text-[#111111] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le modèle Excel (.csv)</span>
              </button>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Importer un fichier (.csv / .xlsx)</span>
                <input
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importSuccessMsg && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {importErrors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Remarques de validation lors de l’import :</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {importErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ÉTAPE 2 : Tableau dynamique des joueurs */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#111111]">
                  Étape 2 · Liste des joueurs ({players.length})
                </h2>
                <p className="text-xs text-[#777777]">
                  Cliquez sur une ligne pour prévisualiser le maillot correspondant à droite.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddPlayer}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un joueur</span>
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#E5E5E5] text-[11px] font-semibold text-[#777777]">
                    <th className="py-2.5 pr-2">#</th>
                    <th className="py-2.5 px-2">Nom sur le maillot</th>
                    <th className="py-2.5 px-2 w-20">Numéro</th>
                    <th className="py-2.5 px-2 w-24">Taille</th>
                    <th className="py-2.5 px-2 w-32">Couleur</th>
                    <th className="py-2.5 px-2 w-36">Police</th>
                    <th className="py-2.5 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-xs">
                  {players.map((player, idx) => {
                    const isSelected = idx === selectedPreviewIndex;
                    return (
                      <tr
                        key={player.id}
                        onClick={() => setSelectedPreviewIndex(idx)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#FFE8DE]/40' : 'hover:bg-[#F7F7F5]'
                        }`}
                      >
                        <td className="py-2.5 pr-2 font-mono-num text-[#777777]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) =>
                              handleUpdatePlayer(player.id, 'name', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded border border-[#E5E5E5] bg-white text-xs font-semibold uppercase"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            maxLength={3}
                            value={player.number}
                            onChange={(e) =>
                              handleUpdatePlayer(
                                player.id,
                                'number',
                                e.target.value.replace(/[^0-9]/g, '')
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded border border-[#E5E5E5] bg-white text-xs font-bold tabular-nums text-center"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={player.size}
                            onChange={(e) =>
                              handleUpdatePlayer(player.id, 'size', e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded border border-[#E5E5E5] bg-white text-xs font-medium"
                          >
                            {VALID_SIZES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={player.color}
                            onChange={(e) =>
                              handleUpdatePlayer(player.id, 'color', e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded border border-[#E5E5E5] bg-white text-xs"
                          >
                            {flocagePricing.availableColors.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={player.font}
                            onChange={(e) =>
                              handleUpdatePlayer(player.id, 'font', e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded border border-[#E5E5E5] bg-white text-xs"
                          >
                            {flocagePricing.availableFonts.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePlayer(player.id);
                            }}
                            aria-label="Supprimer ce joueur"
                            className="p-1.5 text-[#777777] hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ÉTAPE 3 : Logo d'équipe & Sponsor */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-5">
            <h2 className="text-sm font-bold text-[#111111]">
              Étape 3 · Logo d’équipe & Sponsor
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#111111]">Votre logo d’équipe</span>
                  <span className="text-[#FF5A1F] font-semibold tabular-nums">
                    +{formatFCFA(flocagePricing.logoPrice)} / maillot
                  </span>
                </div>
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-[#E5E5E5] hover:border-[#111111] bg-[#F7F7F5] cursor-pointer">
                  <Upload className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span className="text-xs font-medium text-[#111111] truncate">
                    {logoName || 'Importer écusson (PNG, JPG, SVG)'}
                  </span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={(e) => handleImageUpload(e, 'LOGO')}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#111111]">Logo Sponsor</span>
                  <span className="text-[#FF5A1F] font-semibold tabular-nums">
                    +{formatFCFA(flocagePricing.sponsorPrice)} / maillot
                  </span>
                </div>
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-[#E5E5E5] hover:border-[#111111] bg-[#F7F7F5] cursor-pointer">
                  <Upload className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span className="text-xs font-medium text-[#111111] truncate">
                    {sponsorName || 'Importer sponsor (PNG, JPG, SVG)'}
                  </span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={(e) => handleImageUpload(e, 'SPONSOR')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2">
                Position du logo d’équipe
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Poitrine', 'Manche', 'Dos', 'Autre'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setLogoPosition(pos)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                      logoPosition === pos
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
        </div>

        {/* Right: Live Squad Member Preview & Bulk Pricing Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <FlocagePreview
            garmentType={garmentType}
            garmentBgColor={garmentBgColor}
            playerName={activePreviewPlayer?.name || 'MBAYE'}
            playerNumber={activePreviewPlayer?.number || '10'}
            fontStyle={activePreviewPlayer?.font || defaultFont}
            textColorHex={activeColorHex}
            position="Dos"
            logoDataUrl={logoDataUrl}
            sponsorDataUrl={sponsorDataUrl}
            logoPosition={logoPosition}
          />

          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111111]">
                Récapitulatif du lot ({quantity} {garmentType.toLowerCase()}s)
              </h3>
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-[#FF5A1F] bg-[#FFE8DE] px-2.5 py-1 rounded-md tabular-nums">
                  Remise -{discountPercent}%
                </span>
              )}
            </div>

            {isQuoteVolume ? (
              <div className="p-4 rounded-xl bg-[#FFE8DE] text-[#111111] space-y-2 text-xs">
                <div className="font-bold text-[#FF5A1F]">
                  Volume Grand Compte ({quantity} pièces ≥ {flocagePricing.volumeDiscounts.quoteMinQty})
                </div>
                <p>
                  Pour les commandes de 50 pièces et plus, vous bénéficiez d’un tarif sur-mesure négocié. Remplissez le formulaire de devis ci-dessous.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 text-xs sm:text-sm border-b border-[#E5E5E5] pb-4">
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Prix unitaire flocage (Nom + N°)</span>
                    <span className="font-semibold text-[#111111] tabular-nums">
                      {formatFCFA(flocagePricing.namePrice + flocagePricing.numberPrice)}
                    </span>
                  </div>
                  {logoDataUrl && (
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Option Logo d’équipe</span>
                      <span className="font-semibold text-[#111111] tabular-nums">
                        +{formatFCFA(flocagePricing.logoPrice)} / u
                      </span>
                    </div>
                  )}
                  {sponsorDataUrl && (
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Option Sponsor</span>
                      <span className="font-semibold text-[#111111] tabular-nums">
                        +{formatFCFA(flocagePricing.sponsorPrice)} / u
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Total brut ({quantity} joueurs)</span>
                    <span className="font-semibold text-[#111111] tabular-nums">
                      {formatFCFA(grossTotal)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#FF5A1F] font-semibold">
                      <span>Remise par quantité (-{discountPercent}%)</span>
                      <span className="tabular-nums">-{formatFCFA(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-[#111111]">TOTAL LOT</span>
                  <span className="text-2xl font-bold text-[#FF5A1F] tabular-nums">
                    {formatFCFA(netTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddLotToCart}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>AJOUTER LE LOT AU PANIER</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section Devis pour 50+ maillots */}
      <div className="pt-8 border-t border-[#E5E5E5]">
        <QuoteForm defaultQuantity={Math.max(50, quantity)} defaultGarmentType={`${garmentType}s`} />
      </div>
    </div>
  );
};
