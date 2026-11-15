document.addEventListener('DOMContentLoaded', () => {
  const caption = document.querySelector('.is-energizar .energizar-motion-caption');
  if (!caption) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    caption.classList.add('is-highlighted');
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      caption.classList.add('is-highlighted');
      observer.disconnect();
    }
  }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
  observer.observe(caption);
});
