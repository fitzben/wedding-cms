import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let animationFrameId;

    if (window.innerWidth >= 1024) {
      const onMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      };

      window.addEventListener('mousemove', onMouseMove);

      const renderCursor = () => {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        if (cursor) {
          cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        }
        animationFrameId = requestAnimationFrame(renderCursor);
      };

      renderCursor();

      const interactables = document.querySelectorAll('a, button, input, textarea, .journey-card, .gift-card');
      const onMouseEnter = () => cursor.classList.add('w-12', 'h-12');
      const onMouseLeave = () => cursor.classList.remove('w-12', 'h-12');

      interactables.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
      });

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(animationFrameId);
        interactables.forEach((el) => {
          el.removeEventListener('mouseenter', onMouseEnter);
          el.removeEventListener('mouseleave', onMouseLeave);
        });
      };
    }
  }, []);

  return (
    <div
      ref={cursorRef}
      id="custom-cursor"
      className="hidden lg:block fixed top-0 left-0 w-8 h-8 rounded-full border border-gold/60 pointer-events-none z-[10000] mix-blend-difference transition-[width,height] duration-200 ease-out -translate-x-1/2 -translate-y-1/2 will-change-transform"
    ></div>
  );
};

export default CustomCursor;
