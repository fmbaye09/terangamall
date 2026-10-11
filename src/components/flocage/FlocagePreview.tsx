import React from 'react';
import { Eye, ShieldCheck } from 'lucide-react';

interface FlocagePreviewProps {
  garmentType: 'Maillot' | 'T-shirt' | 'Autre';
  garmentBgColor?: string;
  playerName: string;
  playerNumber: string;
  fontStyle: string;
  textColorHex: string;
  position: string;
  logoDataUrl?: string;
  sponsorDataUrl?: string;
  logoPosition?: string;
}

export const FlocagePreview: React.FC<FlocagePreviewProps> = ({
  garmentType,
  garmentBgColor = '#111111',
  playerName,
  playerNumber,
  fontStyle,
  textColorHex,
  position,
  logoDataUrl,
  sponsorDataUrl,
  logoPosition = 'Poitrine',
}) => {
  const getFontClass = () => {
    switch (fontStyle) {
      case 'Football Pro':
        return 'font-display font-bold tracking-wider uppercase';
      case 'Athlétique Block':
        return 'font-mono-num font-bold tracking-widest uppercase';
      case 'Moderne':
        return 'font-sans font-semibold tracking-tight uppercase';
      default:
        return 'font-serif font-bold tracking-wide uppercase';
    }
  };

  const displayName = (playerName || 'MBAYE').toUpperCase().slice(0, 14);
  const displayNumber = (playerNumber || '10').slice(0, 3);

  return (
    <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#FF5A1F]" />
          <span className="text-xs font-semibold text-[#111111]">
            Aperçu indicatif en temps réel
          </span>
        </div>
        <span className="text-xs text-[#777777]">
          {garmentType} · {position}
        </span>
      </div>

      {/* Interactive SVG Jersey / T-Shirt Canvas */}
      <div className="relative aspect-square max-w-[340px] mx-auto flex items-center justify-center bg-white rounded-xl border border-[#E5E5E5] p-6 overflow-hidden">
        {/* Subtle studio grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111111 1px, transparent 1px), linear-gradient(to bottom, #111111 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Garment Silhouette */}
        <svg
          viewBox="0 0 300 320"
          className="w-full h-full drop-shadow-md transition-colors duration-200"
          aria-label="Silhouette du vêtement personnalisé"
        >
          {/* Jersey Body & Sleeves */}
          <path
            d="M85,30 L115,30 C125,48 175,48 185,30 L215,30 L275,80 L248,125 L215,102 L215,285 C215,292 210,296 203,296 L97,296 C90,296 85,292 85,285 L85,102 L52,125 L25,80 Z"
            fill={garmentBgColor}
            stroke="#E5E5E5"
            strokeWidth="2"
          />

          {/* Collar Trim */}
          <path
            d="M113,30 C125,52 175,52 187,30"
            fill="none"
            stroke="#FF5A1F"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Sleeve Cuffs */}
          <line
            x1="272"
            y1="82"
            x2="246"
            y2="123"
            stroke="#FF5A1F"
            strokeWidth="4"
          />
          <line
            x1="28"
            y1="82"
            x2="54"
            y2="123"
            stroke="#FF5A1F"
            strokeWidth="4"
          />
        </svg>

        {/* Dynamic Overlay Layer inside the Jersey */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-12">
          {/* Sleeve Badge if Manche */}
          {logoDataUrl && logoPosition === 'Manche' && (
            <div className="absolute top-[28%] right-[17%] w-8 h-8 rounded bg-white/90 p-0.5 shadow-xs flex items-center justify-center overflow-hidden">
              <img
                src={logoDataUrl}
                alt="Logo manche"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Chest Logo if Poitrine */}
          {logoDataUrl && logoPosition !== 'Manche' && (
            <div
              className={`w-10 h-10 rounded-md bg-white/95 p-1 shadow-xs flex items-center justify-center overflow-hidden mb-1 ${
                position === 'Poitrine' ? 'self-end mr-8 -mt-6' : 'mb-2'
              }`}
            >
              <img
                src={logoDataUrl}
                alt="Logo personnalisé"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Player Name */}
          <div
            className={`${getFontClass()} text-center transition-all duration-150 select-none ${
              position === 'Poitrine'
                ? 'text-xs mt-1'
                : position === 'Manche'
                ? 'text-[11px] translate-x-16 -translate-y-8'
                : 'text-base sm:text-lg -mt-2'
            }`}
            style={{
              color: textColorHex,
              textShadow:
                textColorHex.toUpperCase() === '#FFFFFF' && garmentBgColor === '#FFFFFF'
                  ? '0 1px 3px rgba(0,0,0,0.45)'
                  : '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            {displayName}
          </div>

          {/* Player Number */}
          <div
            className={`${getFontClass()} leading-none text-center transition-all duration-150 select-none tabular-nums ${
              position === 'Poitrine'
                ? 'text-2xl mt-1'
                : position === 'Manche'
                ? 'text-xl translate-x-16 -translate-y-7'
                : 'text-5xl sm:text-6xl mt-1.5'
            }`}
            style={{
              color: textColorHex,
              textShadow:
                textColorHex.toUpperCase() === '#FFFFFF' && garmentBgColor === '#FFFFFF'
                  ? '0 1px 4px rgba(0,0,0,0.45)'
                  : '0 2px 4px rgba(0,0,0,0.25)',
            }}
          >
            {displayNumber}
          </div>

          {/* Sponsor Image / Banner */}
          {sponsorDataUrl && (
            <div className="mt-3 w-24 h-8 bg-white/90 rounded px-1.5 py-0.5 flex items-center justify-center overflow-hidden shadow-xs">
              <img
                src={sponsorDataUrl}
                alt="Sponsor"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Bottom Watermark Badge */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[11px] text-[#777777]">
          <span>Aperçu indicatif</span>
          <span>Police : {fontStyle}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[#777777]">
        <ShieldCheck className="w-4 h-4 text-[#FF5A1F] shrink-0" />
        <span>
          Validation finale du BAT par notre atelier de Dakar avant impression thermique.
        </span>
      </div>
    </div>
  );
};
