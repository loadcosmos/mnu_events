import React, { useEffect } from 'react';
import { ExternalLink, Eye } from 'lucide-react';

export default function NativeAd({ ad, onImpression, onClick }) {
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

  return (
    <div
      onClick={handleClick}
      className="
        group cursor-pointer
        bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900
        backdrop-blur-xl rounded-2xl overflow-hidden
        border-2 border-purple-200/50 dark:border-purple-500/30
        hover:border-purple-400/50 dark:hover:border-purple-500/50
        shadow-lg hover:shadow-xl
        transform hover:-translate-y-1
        transition-all duration-300
        relative
      "
    >
      {/* Ad Label */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/80 backdrop-blur-sm text-xs text-white">
          <Eye className="w-3 h-3" />
          <span>Реклама</span>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {ad.title}
        </h3>

        {ad.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {ad.description}
          </p>
        )}

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="
            w-full px-4 py-2 rounded-lg
            bg-gradient-to-r from-purple-500 to-blue-500
            hover:from-purple-600 hover:to-blue-600
            text-white font-medium text-sm
            transform hover:scale-105 transition-all
            shadow-md hover:shadow-lg
            flex items-center justify-center gap-2
          "
        >
          <span>Узнать больше</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Sponsored Text */}
      <div className="px-5 pb-3 text-xs text-gray-500 dark:text-gray-500 flex items-center justify-between">
        <span>Спонсируется</span>
        <span className="text-purple-600 dark:text-purple-400">Продвижение</span>
      </div>
    </div>
  );
}
