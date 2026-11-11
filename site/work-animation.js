document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector(".work-custom-title");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsObserver = "IntersectionObserver" in window;

  // Mostrar el menu cuando se sube; ocultarlo al bajar.
  const header = document.querySelector(".site-header");
  if (header) {
    let lastY = Math.max(0, window.scrollY);
    let movement = 0;
    let direction = 0;
    let pending = false;

    const updateHeader = () => {
      pending = false;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      if (y <= 8) {
        header.classList.remove("is-header-hidden");
        movement = 0;
        direction = 0;
        return;
      }

      // Ignorar oscilaciones minimas de trackpads y pantallas tactiles.
      if (Math.abs(delta) < 1) return;
      const nextDirection = delta > 0 ? 1 : -1;
      if (direction !== nextDirection) {
        direction = nextDirection;
        movement = 0;
      }
      movement += Math.abs(delta);

      if (movement < 8) return;
      if (nextDirection > 0 && y > header.offsetHeight) {
        header.classList.add("is-header-hidden");
      } else if (nextDirection < 0) {
        header.classList.remove("is-header-hidden");
      }
      movement = 0;
    };

    window.addEventListener("scroll", () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
    window.addEventListener("pageshow", updateHeader);
  }

  // Conservar el titulo en una sola linea.
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

  const items = [...document.querySelectorAll(".work .work-item")];
  if (reduceMotion || !supportsObserver || items.length === 0) return;

  // Esperar a que las portadas prioritarias esten listas para mostrarlas juntas.
  const imageReady = (img) => {
    if (!img) return Promise.resolve();
    if (img.complete) {
      return typeof img.decode === "function" ? img.decode().catch(() => {}) : Promise.resolve();
    }
    return new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    }).then(() => typeof img.decode === "function" ? img.decode().catch(() => {}) : undefined);
  };

  const firstPair = items.slice(0, 2);
  const readyFirstPair = Promise.all(firstPair.map((item) => imageReady(item.querySelector(".work-media img"))));
  let firstPairEntered = false;
  let firstPairRevealed = false;
  const entered = new Set();

  const reveal = (item) => {
    item.classList.add("is-visible");
    observer.unobserve(item);
  };

  const maybeReveal = () => {
    if (!firstPairEntered || firstPairRevealed) return;
    readyFirstPair.then(() => {
      if (firstPairRevealed) return;
      firstPairRevealed = true;
      firstPair.forEach(reveal);
      // Permitir el resto solo despues de las dos primeras fotografias.
      for (const item of entered) {
        if (!firstPair.includes(item)) reveal(item);
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const item = entry.target;
      entered.add(item);
      if (firstPair.includes(item)) firstPairEntered = true;
      // Si se salta directamente mas abajo, la primera fila ya paso.
      if (!firstPairEntered && firstPair.every((first) => first.getBoundingClientRect().bottom <= 0)) {
        firstPairEntered = true;
      }
      if (firstPairRevealed && !firstPair.includes(item)) reveal(item);
    }
    maybeReveal();
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

  for (const item of items) {
    const rect = item.getBoundingClientRect();
    if (rect.bottom <= 0 || (rect.top < window.innerHeight * 0.75 && rect.bottom > 0)) {
      // Si la primera fila esta visible al cargar, no ocultarla.
      if (firstPair.includes(item)) firstPairEntered = true;
      continue;
    }
    item.classList.add("reveal-ready");
    observer.observe(item);
  }

  if (firstPairEntered) maybeReveal();
});
