import { useEffect } from 'react';

/**
 * A hook that mimics the original Intersection Observer logic from the HTML template.
 * It observes all elements with the class 'obs-hide' and adds the 'active' class
 * when they scroll into view, triggering their respective entrance animations.
 */
export const useScrollReveal = (deps = []) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.obs-hide:not(.active)');
    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
