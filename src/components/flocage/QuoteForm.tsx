import React, { useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Upload, Send } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface QuoteFormProps {
  defaultQuantity?: number;
  defaultGarmentType?: string;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  defaultQuantity = 50,
  defaultGarmentType = 'Maillots',
}) => {
  const { submitQuoteRequest } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [garmentType, setGarmentType] = useState(defaultGarmentType);
  const [message, setMessage] = useState('');
  const [logoName, setLogoName] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;

    submitQuoteRequest({
      name,
      phone,
      email,
      quantity: Math.max(1, Number(quantity)),
      garmentType,
      message:
        message ||
        `Demande de devis personnalisée pour ${quantity} ${garmentType}.`,
      logoName: logoName || undefined,
      excelFileName: excelFileName || undefined,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-[#F7F7F5] border border-[#E5E5E5] rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FFE8DE] text-[#FF5A1F] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-[#111111]">
          Votre demande de devis a bien été transmise
        </h3>
        <p className="text-sm text-[#777777] max-w-md mx-auto">
          Merci <span className="text-[#111111] font-semibold">{name}</span>. Notre responsable Atelier & Clubs à Dakar vous recontacte au{' '}
          <span className="text-[#111111] font-semibold tabular-nums">{phone}</span> sous 2 heures ouvrées avec une proposition chiffrée.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="px-5 py-2.5 rounded-lg border border-[#111111] text-xs font-semibold text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-5"
    >
      <div>
        <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
          Service Grands Comptes, Clubs & Événements
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#111111]">
          Vous avez 50 maillots ou plus ? Demandez un devis personnalisé
        </h3>
        <p className="text-sm text-[#777777] mt-1">
          Tarifs préférentiels dégressifs pour académies, clubs de navétanes, écoles, entreprises et événements au Sénégal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
            Nom complet ou Structure *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: ASC Jaraaf / Moussa Diop"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#111111]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
            Téléphone (WhatsApp) *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+221 77 000 00 00"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm tabular-nums focus:outline-none focus:border-[#111111]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
            Adresse Email *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@votreclub.sn"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#111111]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              Nombre de pièces *
            </label>
            <input
              type="number"
              min={10}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm tabular-nums focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              Type de vêtement
            </label>
            <select
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5E5] text-sm bg-white focus:outline-none focus:border-[#111111]"
            >
              <option value="Maillots">Maillots</option>
              <option value="T-shirts">T-shirts</option>
              <option value="Polos / Sweats">Polos / Sweats</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* File uploads for Logo and Excel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-[#E5E5E5] hover:border-[#111111] cursor-pointer bg-[#F7F7F5]/60 transition-colors">
          <Upload className="w-4 h-4 text-[#FF5A1F] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#111111] truncate">
              {logoName ? logoName : 'Joindre votre logo / sponsor'}
            </div>
            <div className="text-[11px] text-[#777777]">PNG, JPG ou SVG (Max 5 Mo)</div>
          </div>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setLogoName(file.name);
            }}
          />
        </label>

        <label className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-[#E5E5E5] hover:border-[#111111] cursor-pointer bg-[#F7F7F5]/60 transition-colors">
          <FileSpreadsheet className="w-4 h-4 text-[#FF5A1F] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#111111] truncate">
              {excelFileName ? excelFileName : 'Joindre une liste Excel / CSV'}
            </div>
            <div className="text-[11px] text-[#777777]">Liste des joueurs, numéros & tailles</div>
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setExcelFileName(file.name);
            }}
          />
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
          Précisions sur votre projet (positions souhaitées, délais, livraison...)
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Indiquez si vous fournissez les maillots ou si vous souhaitez nos maillots + flocage..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#111111]"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#FF5A1F] hover:bg-[#111111] text-white text-sm font-semibold transition-colors"
      >
        <Send className="w-4 h-4" />
        <span>DEMANDER UN DEVIS</span>
      </button>
    </form>
  );
};
