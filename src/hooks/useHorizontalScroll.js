import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook for horizontal scroll functionality
 * Manages scroll state and provides scroll controls
 * 
 * @param {number} scrollAmount - Amount to scroll on each action
 * @returns {Object} Scroll state and control functions
 */
export const useHorizontalScroll = (scrollAmount = 200) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /**
   * Updates scroll button visibility based on scroll position
   * Memoized with useCallback to prevent unnecessary re-renders
   */
  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScrollLeft = scrollWidth - clientWidth - 1;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScrollLeft);
  }, []);

  /**
   * Scrolls the container in specified direction
   * @param {'left' | 'right'} direction - Direction to scroll
   */
  const scroll = useCallback(
    (direction) => {
      if (!scrollContainerRef.current) return;

      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    },
    [scrollAmount]
  );

  /**
   * Set up event listeners for scroll and resize
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    
    // Initial check
    updateScrollButtons();

    if (!container) return;

    // Add passive event listeners for better performance
    container.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    // Cleanup
    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  return {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    scroll,
  };
};
