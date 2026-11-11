
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Animacion del titulo SEELECTED WOORK
  const title = document.querySelector(".work-custom-title");

  if (title) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      title.classList.add("is-highlighted");
    } else {
      const titleObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              title.classList.add("is-highlighted");
              titleObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      titleObserver.observe(title);
    }
  }

  // Aparicion de las fotografias
  const items = document.querySelectorAll(".work .work-item");

  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          imageObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px 60px 0px" }
  );

  items.forEach((item) => {
    // Evitar ocultar tarjetas ya visibles al cargar
    if (item.getBoundingClientRect().top < window.innerHeight) {
      return;
    }

    item.classList.add("reveal-ready");
    imageObserver.observe(item);
  });
});
