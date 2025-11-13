import React, { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

const adSizes = {
  TOP_BANNER: {
    desktop: 'h-[90px]',
    mobile: 'h-[50px]',
  },
  BOTTOM_BANNER: {
    desktop: 'h-[90px]',
    mobile: 'h-[50px]',
  },
  HERO_SLIDE: {
    desktop: 'h-[400px]',
    mobile: 'h-[300px]',
  },
};

export default function AdBanner({
  ad,
  position = 'TOP_BANNER',
  onImpression,
  onClick,
}) {
  useEffect(() => {
    // Track impression when ad is rendered
    if (onImpression && ad) {
      onImpression(ad.id);
    }
  }, [ad, onImpression]);

  if (!ad) return null;

  const handleClick = () => {
    if (onClick) {
      onClick(ad.id);
    }
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const sizeClass = adSizes[position] || adSizes.TOP_BANNER;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 my-4">
      <div
        className={`
          max-w-7xl mx-auto rounded-lg overflow-hidden
          bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900
          ${sizeClass.desktop} ${sizeClass.mobile}
          cursor-pointer hover:opacity-90 transition-opacity
          relative group
        `}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        {/* Ad Image */}
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Ad Label */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
          Реклама
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
