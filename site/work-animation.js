
document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector(".work-custom-title");

  if (!title) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          title.classList.add("is-highlighted");
          observer.unobserve(title);
        }
      });
    },
    {
      threshold: 0.5
    }
  );

  observer.observe(title);
});
