// Progressive enhancement: the photo stays visible without JavaScript or animation support.
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (motion.matches || !entry.target.animate) continue;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(30px) scale(.97)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { duration: 800, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      motion.addEventListener('change', () => { if (motion.matches) animation.cancel(); }, { once: true });
    }
  }, { threshold: .15 });
  document.querySelectorAll('.project-next-visual-photo').forEach((photo) => observer.observe(photo));
})();
