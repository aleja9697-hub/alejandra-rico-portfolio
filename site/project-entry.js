// Brief project entry, independent of slow or failed remote assets.
(() => {
  const loader = document.querySelector('.project-loader');
  if (!loader) return;
  const finish = () => loader.remove();
  loader.classList.add('is-active');
  let ready = document.readyState !== 'loading';
  let minimumElapsed = false;
  const maybeFinish = () => { if (ready && minimumElapsed) finish(); };
  requestAnimationFrame(() => {
    setTimeout(() => { minimumElapsed = true; maybeFinish(); }, 600);
  });
  document.addEventListener('DOMContentLoaded', () => {
    ready = true;
    maybeFinish();
  }, { once: true });
  window.addEventListener('pageshow', (event) => { if (event.persisted) finish(); });
  setTimeout(finish, 2500);
})();
