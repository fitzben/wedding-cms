import { useEffect } from 'react';

/**
 * A hook that mimics the original Intersection Observer logic from the HTML template.
 * It observes all elements with the class 'obs-hide' and adds the 'active' class
 * when they scroll into view, triggering their respective entrance animations.
 */
export const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll('.obs-hide');
    elements.forEach(el => observer.observe(el));

    // Cleanup observer on unmount
    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);
};
