import React, { useEffect } from 'react';

/**
 * Bottom Sheet for advanced filters on mobile
 * Slides up from bottom with filter options
 */
const FilterSheet = ({ isOpen, onClose, children, title = 'Filters' }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-2xl z-50 md:hidden max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#2a2a2a] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <h2 id="filter-sheet-title" className="text-xl font-bold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#a0a0a0] hover:text-white transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-safe">
          {children}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-[#2a2a2a] p-4 pb-safe">
          <button
            onClick={onClose}
            className="w-full bg-[#d62e1f] hover:bg-[#b91c1c] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSheet;
