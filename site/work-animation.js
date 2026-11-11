document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector(".work-custom-title");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsObserver = "IntersectionObserver" in window;

  // Mantener la tipografia Stretch Pro en una linea sin recortarla.
  if (title) {
    const fitTitle = () => {
      title.style.fontSize = "";
      const base = title.querySelector(".work-highlight-base");
      if (!base) return;
      const available = title.parentElement.clientWidth;
      const actual = base.scrollWidth;
      if (available > 0 && actual > available) {
        const current = parseFloat(getComputedStyle(title).fontSize);
        title.style.fontSize = Math.max(14, current * available / actual * 0.99) + "px";
      }
    };

    fitTitle();
    document.fonts?.ready?.then(fitTitle);
    window.addEventListener("resize", fitTitle, { passive: true });

    if (reduceMotion || !supportsObserver) {
      title.classList.add("is-highlighted");
    } else {
      const titleObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          title.classList.add("is-highlighted");
          titleObserver.unobserve(entry.target);
        }
      }, { threshold: 0.35, rootMargin: "0px 0px -10% 0px" });
      titleObserver.observe(title);
    }
  }

  // Preparar tarjetas que aun no han entrado en el viewport.
  const items = document.querySelectorAll(".work .work-item");
  if (reduceMotion || !supportsObserver) return;

  const imageObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      imageObserver.unobserve(entry.target);
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

  for (const item of items) {
    const rect = item.getBoundingClientRect();
    // No ocultar las tarjetas que ya estan visiblemente en pantalla.
    if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) continue;
    if (rect.bottom <= 0) continue;
    item.classList.add("reveal-ready");
    imageObserver.observe(item);
  }
});
