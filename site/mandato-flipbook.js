// Ad-free portfolio flipbook. Renders nearby PDF pages only when needed.
// The external FlipHTML5 embed remains as a fallback until the PDF is uploaded.
import { getDocument, GlobalWorkerOptions } from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs';

GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

async function loadPageFlip() {
  if (window.St && window.St.PageFlip) return window.St.PageFlip;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  if (!(window.St && window.St.PageFlip)) throw new Error('Flipbook library unavailable');
  return window.St.PageFlip;
}

async function setupBook(container) {
  const frame = document.querySelector('.project-flipbook-frame');
  const mount = container.querySelector('.project-book-pages');
  const loading = container.querySelector('.project-book-loading');
  const prev = container.querySelector('[data-book-prev]');
  const next = container.querySelector('[data-book-next]');
  const counter = container.querySelector('.project-book-counter');
  const pdfUrl = container.dataset.pdf;
  if (!mount || !pdfUrl) return;

  // Do not replace the working external reader until the local PDF exists.
  const response = await fetch(pdfUrl, { method: 'HEAD' });
  if (!response.ok) return;

  try {
    const [PageFlip, pdf] = await Promise.all([
      loadPageFlip(),
      getDocument({ url: pdfUrl }).promise,
    ]);
    const sheets = Array.from({ length: pdf.numPages }, (_, i) => {
      const page = document.createElement('div');
      page.className = 'project-book-sheet';
      page.setAttribute('aria-label', 'Page ' + (i + 1));
      const image = document.createElement('img');
      image.alt = 'Mandato Centro — page ' + (i + 1);
      image.decoding = 'async';
      image.draggable = false;
      page.appendChild(image);
      mount.appendChild(page);
      return { page, image };
    });

    const imageUrls = new Map();
    const jobs = new Map();
    async function renderSheet(index) {
      if (index < 0 || index >= pdf.numPages || imageUrls.has(index)) return;
      if (jobs.has(index)) return jobs.get(index);
      const task = (async () => {
        const page = await pdf.getPage(index + 1);
        const viewport = page.getViewport({ scale: 2.06 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d', { alpha: false });
        await page.render({ canvasContext: context, viewport }).promise;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.87));
        const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/jpeg', 0.87);
        sheets[index].image.src = url;
        imageUrls.set(index, url);
        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
      })();
      jobs.set(index, task);
      try { await task; } finally { jobs.delete(index); }
    }

    function near(index) {
      for (let i = Math.max(0, index - 2); i <= Math.min(pdf.numPages - 1, index + 5); i++) {
        renderSheet(i).catch((err) => console.warn('Book page loading failed:', err));
      }
    }

    // Render an initial page before showing the new reader.
    await renderSheet(0);
    await Promise.all([renderSheet(1), renderSheet(2)]);

    const pageFlip = new PageFlip(mount, {
      width: 538,
      height: 411,
      size: 'stretch',
      minWidth: 260,
      maxWidth: 538,
      minHeight: 198,
      maxHeight: 411,
      drawShadow: true,
      maxShadowOpacity: 0.22,
      showCover: true,
      mobileScrollSupport: false,
      flippingTime: 680,
      usePortrait: true,
      autoSize: true,
    });
    function update(index) {
      const current = Math.max(0, Math.min(pdf.numPages - 1, index));
      counter.textContent = 'Page ' + (current + 1) + ' of ' + pdf.numPages;
      prev.disabled = current === 0;
      next.disabled = current === pdf.numPages - 1;
      near(current);
    }
    pageFlip.on('flip', (event) => update(event.data));
    pageFlip.loadFromHTML(sheets.map((sheet) => sheet.page));

    prev.addEventListener('click', () => pageFlip.flipPrev('bottom'));
    next.addEventListener('click', () => pageFlip.flipNext('bottom'));
    mount.tabIndex = 0;
    mount.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); pageFlip.flipPrev('bottom'); }
      if (event.key === 'ArrowRight') { event.preventDefault(); pageFlip.flipNext('bottom'); }
    });
    container.hidden = false;
    if (frame) frame.hidden = true;
    if (loading) loading.hidden = true;
    update(0);
  } catch (error) {
    // Keep existing FlipHTML5 embed as a fallback when libraries fail.
    console.error('Unable to initialize portfolio book:', error);
    container.hidden = true;
    if (frame) frame.hidden = false;
  }
}

document.querySelectorAll('.project-flipbook-custom[data-pdf]').forEach((container) => {
  setupBook(container).catch((error) => {
    console.warn('Local book is not ready yet:', error);
  });
});
