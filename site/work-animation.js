document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector(".work-custom-title");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsObserver = "IntersectionObserver" in window;

  // Barra fija que aparece al subir y desaparece al bajar.
  const header = document.querySelector(".site-header");
  if (header) {
    const spacer = document.createElement("div");
    spacer.className = "site-header-spacer";
    spacer.setAttribute("aria-hidden", "true");
    header.insertAdjacentElement("afterend", spacer);

    const syncHeaderHeight = () => {
      spacer.style.height = header.getBoundingClientRect().height + "px";
    };
    syncHeaderHeight();
    if ("ResizeObserver" in window) {
      new ResizeObserver(syncHeaderHeight).observe(header);
    } else {
      window.addEventListener("resize", syncHeaderHeight, { passive: true });
    }

    let previousY = Math.max(0, window.scrollY);
    let distance = 0;
    let previousDirection = 0;
    let queued = false;

    const handleScroll = () => {
      queued = false;
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - previousY;
      previousY = currentY;

      if (currentY <= 10) {
        header.classList.remove("is-header-hidden");
        previousDirection = 0;
        distance = 0;
        return;
      }
      if (Math.abs(delta) < 1) return;
      const direction = delta > 0 ? 1 : -1;
      if (direction !== previousDirection) {
        previousDirection = direction;
        distance = 0;
      }
      distance += Math.abs(delta);
      if (distance < 6) return;
      distance = 0;

      if (direction > 0 && currentY > header.offsetHeight) {
        header.classList.add("is-header-hidden");
      } else if (direction < 0) {
        header.classList.remove("is-header-hidden");
      }
    };
    window.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(handleScroll);
    }, { passive: true });
    window.addEventListener("pageshow", () => {
      previousY = Math.max(0, window.scrollY);
      header.classList.toggle("is-header-hidden", previousY > header.offsetHeight);
      syncHeaderHeight();
    });
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
