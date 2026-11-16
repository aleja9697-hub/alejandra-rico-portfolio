// Ad-free portfolio flipbook. Renders nearby PDF pages only when needed.
// The external FlipHTML5 embed remains as a fallback until the PDF is uploaded.
import { getDocument, GlobalWorkerOptions } from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs';

GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

async function loadPageFlip() {
  if (window.St && window.St.PageFlip) return window.St.PageFlip;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js';
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
  const lazy = container.hasAttribute('data-book-lazy');
  if (!mount || !pdfUrl) return;

  // Do not replace the working external reader until the local PDF exists.
  const response = await fetch(pdfUrl, { method: 'HEAD' });
  if (!response.ok) {
    if (lazy && loading) loading.textContent = 'The reader is unavailable. Open the full PDF below.';
    return;
  }

  try {
    const [PageFlip, pdf] = await Promise.all([
      loadPageFlip(),
      getDocument({ url: pdfUrl }).promise,
    ]);
    const firstPage = await pdf.getPage(1);
    const pageViewport = firstPage.getViewport({ scale: 1 });
    const pageRatio = pageViewport.width / pageViewport.height;
    const maxPageWidth = 600;
    const minPageWidth = lazy ? Math.min(280, mount.clientWidth) : 280;
    container.style.setProperty('--book-page-ratio', pageRatio);

    const sheets = Array.from({ length: pdf.numPages }, (_, i) => {
      const page = document.createElement('div');
      page.className = 'project-book-sheet';
      page.setAttribute('aria-label', 'Page ' + (i + 1));
      const image = document.createElement('img');
      image.alt = (container.dataset.bookTitle || 'Mandato Centro') + ' — page ' + (i + 1);
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
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(1, mount.clientWidth);
        const displayWidth = Math.min(maxPageWidth, availableWidth / (availableWidth >= minPageWidth * 2 ? 2 : 1));
        const scale = lazy ? Math.min(2.06, displayWidth * Math.min(2, Math.max(1.5, devicePixelRatio || 1)) / baseViewport.width) : 2.06;
        const viewport = page.getViewport({ scale });
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
      for (let i = Math.max(0, index - (lazy ? 1 : 2)); i <= Math.min(pdf.numPages - 1, index + (lazy ? 3 : 5)); i++) {
        renderSheet(i).catch((err) => console.warn('Book page loading failed:', err));
      }
    }

    // Render an initial page before showing the new reader.
    await renderSheet(0);
    await Promise.all([renderSheet(1), renderSheet(2)]);

    // PageFlip measures the mount on creation; it must not be display:none.
    // Keep the current reader visible until the replacement has initialized.
    container.hidden = false;
    container.style.visibility = 'hidden';
    const pageFlip = new PageFlip(mount, {
      width: maxPageWidth,
      height: maxPageWidth / pageRatio,
      size: 'stretch',
      minWidth: minPageWidth,
      maxWidth: maxPageWidth,
      minHeight: minPageWidth / pageRatio,
      maxHeight: maxPageWidth / pageRatio,
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
      const end = lazy && pageFlip.getOrientation() === 'landscape' && current > 0 ? Math.min(current + 1, pdf.numPages - 1) : current;
      counter.textContent = end > current ? 'Pages ' + (current + 1) + '–' + (end + 1) + ' of ' + pdf.numPages : 'Page ' + (current + 1) + ' of ' + pdf.numPages;
      prev.disabled = current === 0;
      next.disabled = (lazy ? end : current) === pdf.numPages - 1;
      near(current);
    }
    pageFlip.on('flip', (event) => update(event.data));
    if (lazy) pageFlip.on('changeOrientation', () => update(pageFlip.getCurrentPageIndex()));
    pageFlip.loadFromHTML(sheets.map((sheet) => sheet.page));

    prev.addEventListener('click', () => pageFlip.flipPrev('bottom'));
    next.addEventListener('click', () => pageFlip.flipNext('bottom'));
    mount.tabIndex = 0;
    mount.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); pageFlip.flipPrev('bottom'); }
      if (event.key === 'ArrowRight') { event.preventDefault(); pageFlip.flipNext('bottom'); }
    });
    if (loading) loading.hidden = true;
    if (frame) frame.hidden = true;
    container.style.visibility = '';
    update(0);
  } catch (error) {
    // Keep existing FlipHTML5 embed as a fallback when libraries fail.
    console.error('Unable to initialize portfolio book:', error);
    if (lazy) {
      container.hidden = false;
      container.style.visibility = '';
      mount.hidden = true;
      if (loading) {
        loading.hidden = false;
        loading.textContent = 'The reader is unavailable. Open the full PDF below.';
      }
      prev.disabled = true;
      next.disabled = true;
      counter.textContent = 'Reader unavailable';
      return;
    }
    container.hidden = true;
    container.style.visibility = '';
    if (frame) frame.hidden = false;
  }
}

document.querySelectorAll('.project-flipbook-custom[data-pdf]').forEach((container) => {
  const start = () => setupBook(container).catch((error) => {
    console.warn('Local book is not ready yet:', error);
  });
  if (container.hasAttribute('data-book-lazy') && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      start();
    }, { rootMargin: '400px 0px' });
    observer.observe(container);
  } else {
    start();
  }
});
