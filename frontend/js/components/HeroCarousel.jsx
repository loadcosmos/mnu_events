import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel({ slides = [], autoRotate = true, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const carouselRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Handle swipe functionality
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    if (!autoRotate || isPaused || slides.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoRotate, isPaused, nextSlide, interval, slides.length]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];
  const isAdSlide = currentSlide?.isAd;

  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={carouselRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container with Transform Animation */}
      <div
        className="relative w-full h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 0.5s ease-in-out',
          display: 'flex'
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            {/* Background Image */}
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-7xl mx-auto">
                {slide.isAd && (
                  <div className="inline-block bg-purple-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white mb-3">
                    Реклама
                  </div>
                )}

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {slide.title}
                </h2>

                {slide.description && (
                  <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl drop-shadow">
                    {slide.description}
                  </p>
                )}

                {slide.buttonText && (
                  <button
                    onClick={() => slide.onClick && slide.onClick()}
                    className="
                      px-6 py-3 rounded-lg font-medium
                      bg-purple-500 hover:bg-purple-600 text-white
                      transform hover:scale-105 transition-all
                      shadow-lg hover:shadow-xl
                    "
                  >
                    {slide.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="
              absolute left-4 top-1/2 -translate-y-1/2 z-20
              w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm
              hover:bg-black/50 transition-colors duration-300
              flex items-center justify-center text-white
              shrink-0
            "
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="
              absolute right-4 top-1/2 -translate-y-1/2 z-20
              w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm
              hover:bg-black/50 transition-colors duration-300
              flex items-center justify-center text-white
              shrink-0
            "
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 pb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
