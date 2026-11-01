import React, { useState, useEffect, useRef } from 'react';

export default function TaglineReveal() {
  const containerRef = useRef(null);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const words = [
    "Always", "be", "at", "the", "right", "place",
    "at", "the", "exact", "right", "time", "to",
    "capture", "the", "scenes", "you", "imagine."
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start reveal when container enters lower viewport
      const startTrigger = windowHeight * 0.85;
      const endTrigger = windowHeight * 0.25;

      if (rect.top <= startTrigger && rect.bottom >= endTrigger) {
        const totalDistance = startTrigger - endTrigger;
        const currentDistance = startTrigger - rect.top;
        const progress = Math.min(1, Math.max(0, currentDistance / totalDistance));
        const currentWord = Math.floor(progress * words.length);
        setActiveWordIndex(currentWord);
      } else if (rect.top > startTrigger) {
        setActiveWordIndex(0);
      } else if (rect.bottom < endTrigger) {
        setActiveWordIndex(words.length);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [words.length]);

  return (
    <section ref={containerRef} className="py-20 px-4 flex flex-col items-center justify-center text-center">
      <div className="max-w-[680px]">
        <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan mb-4 block">
          ASTRONOMICAL ALIGNMENT PHILOSOPHY
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight select-none">
          {words.map((word, idx) => {
            const isRevealed = idx <= activeWordIndex;
            return (
              <span
                key={idx}
                className="inline-block mr-2.5 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  color: isRevealed ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                  textShadow: isRevealed ? '0 0 20px rgba(18, 214, 199, 0.25)' : 'none'
                }}
              >
                {word}
              </span>
            );
          })}
        </h2>
        <p className="mt-6 text-sm text-slate-400 font-normal">
          From solar flares and moonlit arches to high-speed orbital ISS transits and pinpoint Milky Way cores.
        </p>
      </div>
    </section>
  );
}
