import React, { useEffect, useState } from 'react';
import { Shirt } from 'lucide-react';
import { cdnImageUrl, cdnSrcSet } from '../../utils/imageCdn';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  /** Largeur affichée de l'image (attribut `sizes`), ex. "(min-width: 1024px) 25vw, 50vw". */
  sizes?: string;
  /** Largeur maximale à générer, en pixels (ex. 160 pour une miniature). */
  maxWidth?: number;
  /** Image visible au premier affichage (hero, image principale) : chargée en priorité. */
  priority?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  sizes = '100vw',
  maxWidth = 1920,
  priority = false,
}) => {
  // 0 = version optimisée via le CDN, 1 = image originale, 2 = échec définitif
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setAttempt(0);
  }, [src]);

  if (attempt >= 2 || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F7F7F5] text-[#777777] p-6 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Shirt className="w-10 h-10 text-[#111111]/30 mb-2 stroke-[1.5]" />
        <span className="text-xs font-medium text-center text-[#111111]/60 line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  const useCdn = attempt === 0;
  const srcSet = useCdn ? cdnSrcSet(src, maxWidth) : undefined;

  return (
    <img
      src={useCdn ? cdnImageUrl(src, Math.min(maxWidth, 960)) : src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setAttempt((a) => a + 1)}
      className={className}
    />
  );
};
