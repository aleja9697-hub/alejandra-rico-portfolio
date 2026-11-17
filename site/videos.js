(() => {
  const background = document.querySelector('.video-hero-video');
  const toggle = document.querySelector('.video-background-toggle');
  const backgroundMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (background && toggle) {
    const updateToggle = () => {
      toggle.textContent = background.paused ? 'Play video' : 'Pause video';
      toggle.setAttribute('aria-label', background.paused ? 'Play background video' : 'Pause background video');
    };
    const showFallback = () => {
      background.classList.remove('is-playing');
      toggle.hidden = true;
    };
    const playBackground = async () => {
      background.muted = true;
      background.defaultMuted = true;
      const source = background.querySelector('source');
      if (!source.getAttribute('src')) {
        source.src = source.dataset.src;
        background.load();
      }
      try {
        await background.play();
      } catch {
        // Keep the real image visible if autoplay is denied or the file fails.
        background.classList.remove('is-playing');
        toggle.hidden = !!background.error;
      }
      updateToggle();
    };
    background.addEventListener('playing', () => {
      background.classList.add('is-playing');
      toggle.hidden = false;
      updateToggle();
    });
    background.addEventListener('pause', updateToggle);
    background.addEventListener('error', showFallback);
    background.querySelector('source').addEventListener('error', showFallback);
    toggle.addEventListener('click', () => {
      if (background.paused) playBackground();
      else background.pause();
    });
    backgroundMotion.addEventListener('change', () => {
      if (backgroundMotion.matches) {
        background.pause();
        background.classList.remove('is-playing');
      }
    });
    if (!backgroundMotion.matches) playBackground();
  }
  const dialog = document.querySelector('#video-gallery');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const heading = dialog.querySelector('#video-gallery-title');
  const content = dialog.querySelector('.video-gallery-content');
  const closeButton = dialog.querySelector('[data-video-close]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let trigger = null;
  let closing = false;
  let previousOverflow = '';

  const pauseVideos = () => content.querySelectorAll('video').forEach((video) => video.pause());
  const finishClose = () => {
    if (!dialog.open) return;
    dialog.close();
  };
  const close = () => {
    if (!dialog.open || closing) return;
    closing = true;
    pauseVideos();
    if (motion.matches || !dialog.animate) return finishClose();
    const animation = dialog.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(18px)' },
    ], { duration: 180, easing: 'ease-in', fill: 'forwards' });
    animation.finished.then(finishClose, finishClose);
  };

  document.querySelectorAll('[data-video-category]').forEach((button) => {
    button.addEventListener('click', () => {
      const template = document.getElementById(`video-template-${button.dataset.videoCategory}`);
      if (!template || dialog.open) return;
      trigger = button;
      closing = false;
      dialog.getAnimations().forEach((animation) => animation.cancel());
      heading.textContent = template.dataset.title;
      content.replaceChildren(template.content.cloneNode(true));
      // Only the active category enters the live DOM; media never autoplays.
      content.querySelectorAll('video').forEach((video) => {
        video.addEventListener('play', () => {
          content.querySelectorAll('video').forEach((other) => {
            if (other !== video) other.pause();
          });
        });
      });
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
      dialog.scrollTop = 0;
      closeButton.focus({ preventScroll: true });
    });
  });
  closeButton.addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('close', () => {
    pauseVideos();
    content.replaceChildren();
    document.documentElement.style.overflow = previousOverflow;
    closing = false;
    trigger?.focus({ preventScroll: true });
  });
  motion.addEventListener('change', () => {
    if (motion.matches && closing) finishClose();
  });

  const title = document.querySelector('.is-videos .about-drawn-title');
  if (!title) return;
  if (motion.matches || !('IntersectionObserver' in window)) {
    title.classList.add('is-drawn');
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      title.classList.add('is-drawn');
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(title);
  }
})();
