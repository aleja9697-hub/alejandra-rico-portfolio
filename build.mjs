// Static site generator for the portfolio. No dependencies.
// Usage: node build.mjs   ->   writes HTML pages into ./site
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { site, projects, homeRows } from './content/site.mjs';

// Image sizes are read automatically from the files in site/img/<project>/.
// Name files 01, 02, 03... (or cover) (.webp, .jpg, .jpeg or .png). No size list to maintain.
function imageSize(buf) {
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const t = buf.toString('ascii', 12, 16);
    if (t === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (t === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (t === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) }; }
  }
  if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}
const IMG_DIR = new URL('./site/img/', import.meta.url);
const images = {};
for (const d of readdirSync(IMG_DIR, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const files = readdirSync(new URL(d.name + '/', IMG_DIR)).filter((f) => /^(\d+|cover)\.(webp|jpe?g|png)$/i.test(f)).sort();
  const stems = files.map((f) => f.replace(/\.[^.]+$/, ''));
  const dup = stems.find((x, i) => stems.indexOf(x) !== i);
  if (dup) throw new Error(`img/${d.name} has two files named ${dup} with different extensions. Delete the old one so only one ${dup} remains.`);
  images[d.name] = files.map((f) => {
    const size = imageSize(readFileSync(new URL(d.name + '/' + f, IMG_DIR)));
    if (!size) throw new Error(`Cannot read the size of img/${d.name}/${f}. Use a normal .webp, .jpg or .png file.`);
    return { src: `img/${d.name}/${f}`, w: size.w, h: size.h };
  });
}
const OUT = new URL('./site/', import.meta.url);
const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const img = (slug, n) => images[slug]?.[n - 1];
const coverOf = (p) =>
  p.coverImage ? images[p.slug][0] : img(p.slug, p.cover || 1);

const icon = {
  arrowUpRight:
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  arrowLeft:
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  arrowRight:
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  mail:
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>',
  linkedin:
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
};

// Her signature spark, redrawn from the PDF portfolio
const spark =
  '<svg class="spark" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20 0l3.2 12.4L33.5 4.6l-6.1 11.2L40 20l-12.6 4.2 6.1 11.2-10.3-7.8L20 40l-3.2-12.4-10.3 7.8 6.1-11.2L0 20l12.6-4.2L6.5 4.6l10.3 7.8z"/></svg>';

function layout({ title, description, root, body, ogImage, bodyClass = '' }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.role}`;
  const og = ogImage ? `${site.url}/${ogImage}` : `${site.url}/img/al-centro/01.webp`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.description)}">
<meta name="theme-color" content="#1F543B">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:image" content="${esc(og)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap">
<link rel="stylesheet" href="${root}assets/styles.css">
<script src="${root}work-animation.js" defer></script></head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${root}">${spark}<span>${esc(site.name)}</span></a>
    <nav aria-label="Main">
      <ul class="nav">
        <li><a href="${root}#work">Work</a></li>
        <li><a href="${root}about/">About</a></li>
        <li><a href="${root}#contact">Contact</a></li>
      </ul>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
${contactBlock()}
<footer class="site-footer">
  <div class="wrap footer-inner">
    <p>${esc(site.fullName)}, ${esc(site.role)}. ${esc(site.location)}.</p>
    <p><a href="${root}#top">Back to top</a></p>
  </div>
</footer>
</body>
</html>
`;
}

// Original line icons for capabilities, with a loose hand-drawn character.
const capabilityArt = [
  // Visual identity: pen nib with anchor-point detail.
  '<path d="M32 8 53 29 40 51 24 54 10 40 13 24Z"/><path d="M32 8v14M10 40l15-15M40 51l-9-9"/><circle cx="31" cy="33" r="5"/><path d="m31 38-7 16"/>',
  // Editorial: open two-page publication with typographic lines.
  '<path d="M32 17c-7-5-16-5-25-2v35c9-3 18-3 25 2 7-5 16-5 25-2V15c-9-3-18-3-25 2Z"/><path d="M32 17v35M13 23c4-1 8-1 13 1M13 31c4-1 8-1 13 1M38 24c4-2 8-2 13-1M38 32c4-2 8-2 13-1"/><path d="M13 39c4-1 8-1 13 1"/>',
  // Social media: recognizable phone, heart and message bubble.
  '<rect x="17" y="7" width="30" height="50" rx="6"/><path d="M27 12h10M28 51h8"/><path d="M32 39c-6-4-11-8-8-13 2-4 7-3 8 0 2-3 7-4 9 0 3 5-2 9-9 13Z"/>',
  // Video and motion: clapper board and a play button.
  '<rect x="9" y="22" width="46" height="34" rx="3"/><path d="M9 22 7 14 52 7l2 10-45 7M17 12l7 10M31 10l7 10M45 8l6 10"/><path d="m27 31 13 8-13 8V31Z"/>',
  // Print and POP: layered poster sheets and print registration mark.
  '<path d="M15 14h33v41H15zM21 9h33v41"/><path d="M22 22h18v11H22zM22 39h18M22 45h12"/><path d="M44 16h7m-3-3v7"/>',
  // Web & UX: browser interface, layout and cursor arrow.
  '<rect x="7" y="10" width="50" height="43" rx="4"/><path d="M7 21h50M14 16h2M21 16h2M28 16h2M15 30h18v13H15z"/><path d="m39 30 11 13-7-1-3 6-4-16Z"/>'
];
const selectedServiceIcons = [
  'visual-identity',
  'editorial-design',
  'social-media',
  'video-and-motion',
  'print-and-pop',
  'web-and-ux',
];
function capabilityIcon(index) {
  const stem = selectedServiceIcons[index];
  // Los archivos descargados de Flaticon se pueden anadir posteriormente con sus licencias.
  for (const ext of ['svg', 'png']) {
    const relative = `assets/icons/services/${stem}.${ext}`;
    if (existsSync(new URL('./site/' + relative, import.meta.url))) {
      return `<img class="service-art service-art-file" src="/${relative}" alt="" aria-hidden="true" loading="lazy">`;
    }
  }
  const drawing = capabilityArt[index % capabilityArt.length];
  return `<svg class="service-art" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawing}</svg>`;
}

function skillsMarquee() {
  return `<div class="skills-marquee" role="region" aria-label="Graphic design skills">
  <div class="skills-marquee-track">
    ${[0,1].map((copy) => `<div class="skills-marquee-set" ${copy === 1 ? 'aria-hidden="true"' : ''}>
      ${["VISUAL IDENTITY","EDITORIAL DESIGN","SOCIAL MEDIA","VIDEO EDITING","PRINT & POP","WEB & UX"].map((name) => `<span class="skills-marquee-item"><img class="skills-marquee-star" src="/assets/img/estrella-marquee.svg" alt="" aria-hidden="true" width="22" height="23" loading="eager">${name}</span>`).join('')}
    </div>`).join('')}
  </div>
</div>`;
}

function contactBlock() {
  return `<section class="contact" id="contact" aria-labelledby="contact-title">
  <img class="contact-side-star contact-side-star--left" src="/assets/img/star-side-left.svg" alt="" aria-hidden="true" width="1203" height="955">
  <img class="contact-side-star contact-side-star--right" src="/assets/img/star-side-right.svg" alt="" aria-hidden="true" width="802" height="1100">
  <div class="wrap">
    <h2 class="contact-title" id="contact-title">LET’S WOORK TOGETHEER</h2>
    <img class="contact-accent-star" src="/assets/img/estrella-marquee.svg" alt="" aria-hidden="true" width="140" height="140" loading="lazy" decoding="async">
    <p class="contact-lede">Open to graphic design, multimedia and content design roles in the Greater Toronto Area.</p>
    <a class="contact-email" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
    <ul class="contact-links">
      <li><a href="mailto:${esc(site.email)}">${icon.mail}<span>Email</span></a></li>
      <li><a href="${esc(site.linkedin)}" target="_blank" rel="noopener">${icon.linkedin}<span>LinkedIn</span></a></li>
      <li class="contact-place">${esc(site.location)}</li>
    </ul>
  </div>
</section>`;
}

function picture(im, alt, { sizes = '100vw', eager = false, cls = '', style = '' } = {}) {
  return `<img class="${cls}" src="${im.src.startsWith('img/') ? '{ROOT}' + im.src : im.src}" width="${im.w}" height="${im.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${style ? ` style="${style}"` : ''}>`;
}

// ---------------- Home ----------------
function home() {
  const root = '';
  const count = projects.length;
  const rows = homeRows
    .map(
      (row) => `<div class="work-row">
${row
  .map(([slug, span]) => {
    const p = bySlug[slug];
    if (!p) throw new Error(`homeRows references unknown project "${slug}"`);
    const c = coverOf(p);
    // Mostrar otra imagen real del mismo proyecto dentro de la lente.
    const alternateNumber = p.reveal ?? p.gallery?.flat().find((n) => n !== (p.cover || 1));
    const alternate = alternateNumber ? img(p.slug, alternateNumber) : null;
    const alt = p.coverImage ? `${p.title}: a selection of posts` : (p.alts?.[(p.cover || 1) - 1] || p.title);
    return `  <a class="work-item span-${span}${slug === 'cali-film-commission' ? ' is-featured-wide' : ''}${p.coverFit === 'contain' ? ' is-contain' : ''}" href="work/${p.slug}/" style="--span:${span}">
    <span class="work-media">${picture(c, alt, { sizes: `(max-width: 760px) 100vw, ${Math.round((span / 12) * 100)}vw`, eager: slug === 'al-centro' || slug === 'mandato-centro', style: p.coverPosition ? `object-position:${p.coverPosition}` : '' })}${alternate ? `<img class="work-lens-image" src="${alternate.src}" width="${alternate.w}" height="${alternate.h}" alt="" aria-hidden="true" loading="lazy" decoding="async">` : ''}</span>
    <span class="work-caption">
      <span class="work-title">${esc(p.shortTitle || p.title)}</span>   
<span class="work-meta">
  <span class="work-tag"><span class="work-tag-discipline">${esc(p.discipline)}</span>${slug === 'accountability-report-2025' || slug === 'accountability-report-2024' ? '' : `<span class="work-tag-year">${esc(p.year)}</span>`}</span>
</span>
    </span>
  </a>`;
  })
  .join('\n')}
</div>`
    )
    .join('\n');

  const portrait = images.about[0];


const body = `<section class="hero hero-image-section hero-custom-grid" id="top" aria-labelledby="hero-custom-title">
  <div class="hero-intro-overlay" aria-hidden="true"><img class="hero-intro-star" src="/assets/img/estrella-marquee.svg" width="220" height="220" alt="" fetchpriority="high"></div>
  <div class="hero-grid-art" aria-hidden="true"></div>
  <img class="hero-side-star hero-side-star--left" src="/assets/img/star-side-left.svg" alt="" aria-hidden="true" width="1203" height="955">
  <img class="hero-side-star hero-side-star--right" src="/assets/img/star-side-right.svg" alt="" aria-hidden="true" width="802" height="1100">
  <div class="hero-grid-content">
    <h1 class="hero-grid-title" id="hero-custom-title">
      <span class="hero-grid-line hero-grid-line--first"><span class="hero-name-fit">ALLEJANNDRA</span></span>
      <span class="hero-grid-line hero-grid-line--second"><span class="hero-name-fit">RICCO</span><img class="hero-grid-star" src="/assets/img/estrella-marquee.svg" width="128" height="128" alt="" aria-hidden="true"></span>
    </h1>
    <div class="hero-grid-details hero-grid-details--html">
      <div class="hero-bio-card hero-enter hero-enter--bio">
        Graphic designer for visual identity, editorial and social content. Five years shaping public, institutional and political communication in Cali, Colombia. <span class="hero-bio-emphasis">Now based in the Greater Toronto Area.</span>
      </div>
      <div class="hero-info-card hero-enter hero-enter--facts" aria-label="Professional details">
        <div class="hero-info-pill"><span class="hero-pill-icon"><svg viewBox="0 0 44 44" aria-hidden="true"><path d="M12 33 V23 C12 12 19 7 22 7 C25 7 32 12 32 23 V33 M14 20 L22 31 L30 20 M17 35 H27 M17 39 H27 M10 7 L13 7 M22 3 V7 M31 7 L34 7"/><circle cx="12" cy="7" r="2"/><circle cx="22" cy="3" r="2"/><circle cx="32" cy="7" r="2"/></svg></span><span>Identity, editorial, social, web</span></div>
        <div class="hero-info-pill"><span class="hero-pill-icon"><svg viewBox="0 0 44 44" aria-hidden="true"><path d="M22 36 C20 33 10 24 10 18 A12 12 0 1 1 34 18 C34 24 24 34 22 36 Z"/><circle cx="22" cy="18" r="4"/><path d="M13 34 C4 37 12 41 22 41 C32 41 40 37 31 34"/></svg></span><span>Toronto, Ontario</span></div>
        <a class="hero-info-pill" href="mailto:aleja.9697@gmail.com"><span class="hero-pill-icon"><svg viewBox="0 0 44 44" aria-hidden="true"><rect x="6" y="11" width="32" height="23" rx="3"/><path d="M7 13 L22 25 L37 13"/></svg></span><span>aleja.9697@gmail.com</span></a>
      </div>
    </div>
  </div>
</section>

${skillsMarquee()}

<section class="work" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="work-title" class="section-title work-custom-title"><span class="work-highlight-base">SEELECTED WOORK</span><span class="work-highlight-reveal" aria-hidden="true">SEELECTED WOORK</span></h2>
      <p class="section-note">${count} projects in visual identity, editorial, social media and web, 2024 to 2026.</p>
    </div>
${rows}
  </div>
</section>

<section class="about results-section" id="results" aria-labelledby="results-title">
  <div class="wrap impact-wrap">
    <h2 class="cv-title about-drawn-title" id="results-title"><span>RESUULTS</span><svg class="about-underline" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M4 12 C 41 3, 71 17, 105 10 S 168 6, 198 10 S 259 15, 296 7" pathLength="100" /></svg></h2>
    <dl class="impact">
      ${site.impact.map((m) => `<div class="impact-item"><dt class="impact-value">${esc(m.value)}</dt><dd class="impact-label">${esc(m.label)}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</section>

<section class="about about-teaser" id="about" aria-labelledby="about-title">
  <div class="wrap about-grid">
    <figure class="about-portrait about-portrait--animated">
      ${picture(portrait, `Portrait of ${site.fullName}`, { sizes: '(max-width: 760px) 80vw, 30vw' })}
      <img class="about-portrait-star" src="/assets/img/estrella-marquee.svg" alt="" aria-hidden="true" width="130" height="130" loading="lazy" decoding="async">
      <img class="about-portrait-star about-portrait-star--second" src="/assets/img/estrella-marquee.svg" alt="" aria-hidden="true" width="130" height="130" loading="lazy" decoding="async">
    </figure>
    <div class="about-body">
      <h2 id="about-title" class="section-title about-drawn-title"><span>ABOOUT</span><svg class="about-underline" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M4 12 C 41 3, 71 17, 105 10 S 168 6, 198 10 S 259 15, 296 7" pathLength="100" /></svg></h2>
      <p class="lede">${esc(site.about[0])}</p>
      <a class="about-cta" href="about/">Get to know me <span aria-hidden="true">↗</span></a>
    </div>
  </div>
</section>
<section class="quote-motion-section" aria-label="GREEAT DESIGN HAS SOOMETHING TO SAY.">
  <div class="quote-motion-band">
    <div class="quote-motion-track" aria-hidden="true">
      <div class="quote-motion-group"><span class="quote-motion-item"><img src="/assets/img/estrella-marquee.svg" width="42" height="42" alt="" aria-hidden="true"><span>GREEAT DESIGN HAS SOOMETHING TO SAY.</span><img src="/assets/img/estrella-marquee.svg" width="42" height="42" alt="" aria-hidden="true"></span><span class="quote-motion-item"><img src="/assets/img/estrella-marquee.svg" width="42" height="42" alt="" aria-hidden="true"><span>GREEAT DESIGN HAS SOOMETHING TO SAY.</span><img src="/assets/img/estrella-marquee.svg" width="42" height="42" alt="" aria-hidden="true"></span></div>
      <div class="quote-motion-group"><span class="quote-motion-item"><img src="/assets/img/estrella-marquee.svg" width="42" height="42" alt="" aria-hidden="true"><span>GREEAT DESIGN HAS SOOMETHING TO SAY.</span><img src="/assets/img/estrella-marquee.svg" width="42" height="42" alt="" aria-hidden="true"></span><span class="quote-motion-item"><img src="/assets/img/estrella-marquee.svg" width="42" height="42" alt="" aria-hidden="true"><span>GREEAT DESIGN HAS SOOMETHING TO SAY.</span><img src="/assets/img/estrella-marquee.svg" width="42" height="42" alt="" aria-hidden="true"></span></div>
    </div>
  </div>
</section>
<section class="services-section" id="services" aria-labelledby="services-title">
  <div class="wrap">
    <div class="services-heading">
      <span class="services-eyebrow">What I bring to every project</span>
      <h2 class="services-title about-drawn-title" id="services-title"><span>WHATT I DOO</span><svg class="about-underline" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M4 12 C 41 3, 71 17, 105 10 S 168 6, 198 10 S 259 15, 296 7" pathLength="100" /></svg></h2>
    </div>
    <div class="services-grid">
      ${site.capabilities.map((capability, i) => `<article class="service-card service-card--${i % 6}">
        <span class="service-number">${String(i + 1).padStart(2, '0')}</span>
        ${capabilityIcon(i)}
        <div class="service-content">
          <h3 class="service-name">${esc(capability.title)}</h3>
          <p class="service-description">${esc(capability.text)}</p>
        </div>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>

${skillsMarquee()}`;
  return layout({ root, body, bodyClass: 'is-home' }).replaceAll('{ROOT}', root);
}

// ---------------- About page ----------------
function aboutPage() {
  const root = '../';
  const portrait = images.about[0];
  const body = `<section class="about about-detail" id="about" aria-labelledby="about-title">
    <div class="wrap about-detail-intro">
      <a class="about-back" href="../#about">← Back to home</a>
      <span class="about-eyebrow">The person behind the work</span>
      <h1 id="about-title" class="section-title about-drawn-title"><span>MORE ABOOUT ME</span><svg class="about-underline" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M4 12 C 41 3, 71 17, 105 10 S 168 6, 198 10 S 259 15, 296 7" pathLength="100" /></svg></h1>
      <div class="about-detail-lead">
        <figure class="about-portrait about-portrait--detail-stars">
          ${picture(portrait, `Portrait of ${site.fullName}`, { sizes: '(max-width: 760px) 85vw, 32vw', eager: true })}
          <img class="detail-portrait-star detail-portrait-star--first" src="/assets/img/estrella-marquee.svg" alt="" aria-hidden="true" width="130" height="130" loading="eager" decoding="async">
          <img class="detail-portrait-star detail-portrait-star--second" src="/assets/img/estrella-marquee.svg" alt="" aria-hidden="true" width="130" height="130" loading="eager" decoding="async">
        </figure>
        <div class="about-detail-copy">
          ${site.about.slice(1).map(p => `<p>${esc(p)}</p>`).join('\n          ')}
        </div>
      </div>
    </div>
  <div class="wrap cv">
    <div class="cv-block cv-experience">
      <h3 class="cv-title">Experience</h3>
      <ol class="exp-list">
        ${site.experience
          .map(
            (e) => `<li class="exp">
          <p class="exp-role"><span class="exp-role-base">${esc(e.role)}</span><span class="exp-role-highlight" aria-hidden="true">${esc(e.role)}</span></p>
          <p class="exp-org">${esc(e.org)}, ${esc(e.place)}</p>
          <ul>${e.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
        </li>`
          )
          .join('\n        ')}
      </ol>
    </div>
    <div class="cv-side">
      <div class="cv-block">
        <h3 class="cv-title">Education</h3>
        <ul class="plain-list">
          ${site.education.map((e) => `<li><span class="strong">${esc(e.title)}</span><span>${esc(e.org)}${e.note ? `, ${esc(e.note)}` : ''}</span></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="cv-block">
        <h3 class="cv-title">Languages</h3>
        <p class="tool-line">${site.languages.map(esc).join('<br>')}</p>
      </div>
    </div>
  </div>

  <section class="tools-showcase wrap" aria-labelledby="tools-showcase-title">
    <h2 class="cv-title" id="tools-showcase-title">Tools</h2>
    <div class="tools-showcase-grid">
      ${[
        { name: 'Adobe Illustrator', color: '#FF9A00', icon: 'illustrator', mark: 'Ai', length: 86 },
        { name: 'Adobe Premiere Pro', color: '#E976B9', icon: 'premierepro', mark: 'Pr', length: 78 },
        { name: 'Adobe After Effects', color: '#D490C5', icon: 'aftereffects', mark: 'Ae', length: 70 },
        { name: 'Adobe Photoshop', color: '#31A8FF', icon: 'photoshop', mark: 'Ps', length: 84 },
        { name: 'Adobe Lightroom', color: '#31A8FF', icon: 'lightroom', mark: 'Lr', length: 72 },
        { name: 'Office Suites', color: '#EA3E23', icon: 'microsoft365', mark: '✦', length: 80 },
        { name: 'CapCut', color: '#191919', icon: 'capcut', mark: '✂', length: 77 },
        { name: 'Canva', color: '#00C4CC', icon: 'canva', mark: 'C', length: 88 },
      ].map((tool) => `<div class="tool-skill" style="--tool-brand-color:${esc(tool.color)}">
        <span class="tool-skill-icon" aria-hidden="true"><img class="tool-brand-logo" src="/assets/icons/tools/${esc(tool.icon)}.svg" alt="" loading="lazy" decoding="async"></span>
        <div class="tool-skill-info">
          <span class="tool-skill-name">${esc(tool.name)}</span>
          <span class="tool-skill-track" aria-hidden="true"><span class="tool-skill-fill" style="--fill-width:${tool.length}%"></span></span>
        </div>
      </div>`).join('\n      ')}
    </div>
  </section>

  </section>`;
  return layout({ title: 'About', description: site.about.join(' '), root, body, bodyClass: 'is-about' }).replaceAll('{ROOT}', root);
}

// ---------------- Project page ----------------
function projectPage(p, i) {
  const root = '../../';
  const next = projects[(i + 1) % projects.length];
  const meta = [
    ['Discipline', p.discipline],
    ['Client', p.client],
    ['Year', p.year],
    ['Role', p.role],
    p.tools?.length ? ['Tools', p.tools.join(', ')] : null,
  ].filter(Boolean);

  let galleryHtml = '';
  if (p.galleryMode === 'carousel' && p.gallery) {
    const photoNumbers = p.gallery.flat();
    galleryHtml = `<section class="project-carousel" aria-labelledby="project-carousel-title">
  <div class="wrap">
    <div class="project-carousel-heading">
      <div>
        <span class="project-section-eyebrow">SELECTED IMAGES</span>
        <h2 id="project-carousel-title">A closer look</h2>
      </div>
      <div class="project-carousel-controls">
        <span class="project-carousel-counter" aria-live="polite">01 / ${String(photoNumbers.length).padStart(2, '0')}</span>
        <button class="project-carousel-arrow" type="button" data-carousel-prev aria-label="Previous image">${icon.arrowLeft}</button>
        <button class="project-carousel-arrow" type="button" data-carousel-next aria-label="Next image">${icon.arrowRight}</button>
      </div>
    </div>
    <div class="project-carousel-track" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(p.title)} project photography">
${photoNumbers.map((n, k) => {
  const im = img(p.slug, n);
  if (!im) throw new Error(${p.slug}: image ${n} missing`);
  return `      <figure class="project-carousel-slide" aria-label="Image ${k + 1} of ${photoNumbers.length}">
        ${picture(im, p.alts?.[n - 1] || p.title, { sizes: '(max-width: 760px) 90vw, 74vw' })}
      </figure>`;
}).join('\n')}
    </div>
  </div>
</section>`;
  }

  if (p.gallery && p.galleryMode !== 'carousel') {
    galleryHtml = `<section class="gallery" aria-label="Project images">
  <div class="wrap">
${p.gallery
  .map((row) => {
    const items = row
      .map((n) => {
        const im = img(p.slug, n);
        if (!im) throw new Error(`${p.slug}: image ${n} missing`);
        const ratio = (im.w / im.h).toFixed(4);
        return `    <figure class="g-item" style="--r:${ratio}">${picture(im, p.alts?.[n - 1] || p.title, {
          sizes: `(max-width: 760px) 100vw, ${Math.round(100 / row.length)}vw`,
          eager: n === p.gallery[0][0],
        })}</figure>`;
      })
      .join('\n');
    return `   <div class="g-row">\n${items}\n   </div>`;
  })
  .join('\n')}
  </div>
</section>`;
  }

  if (p.groups) {
    galleryHtml = p.groups
      .map(
        (g) => `<section class="social-group" aria-labelledby="${g.key}">
  <div class="wrap">
    <div class="social-head">
      <h2 id="${g.key}" class="social-name">${esc(g.name)}</h2>
      <p class="social-note">${esc(g.note)}</p>
    </div>
    <ul class="post-grid">
${images[g.key]
  .map(
    (im, k) =>
      `      <li>${picture(im, `${g.name} social media post ${k + 1}`, { sizes: '(max-width: 760px) 33vw, 16vw' })}</li>`
  )
  .join('\n')}
    </ul>
  </div>
</section>`
      )
      .join('\n');
  }


  // The editorial case-study layout is opted into by content, not by project slug.
  const isEditorial = p.pageStyle === 'editorial';
  const heroIndex = p.heroImage || p.cover || 1;
  const heroPhoto = isEditorial ? img(p.slug, heroIndex) : null;
  if (isEditorial && !heroPhoto) throw new Error(`${p.slug}: hero image ${heroIndex} missing`);
  const editorialHero = isEditorial ? `<header class="editorial-hero" aria-label="${esc(p.title)} project introduction">
    ${picture(heroPhoto, p.alts?.[heroIndex - 1] || p.title, { sizes: '100vw', eager: true, cls: 'editorial-hero-image' })}
    <div class="editorial-hero-shade" aria-hidden="true"></div>
    <div class="editorial-hero-inner wrap">
      <a class="editorial-back" href="${root}#work">${icon.arrowLeft}<span>All work</span></a>
      <div class="editorial-hero-bottom">
        <span class="editorial-category editorial-category-pill">${esc(p.discipline)} · ${esc(p.year)}</span>
        <h1 class="editorial-title">${esc(p.title)}<img src="${root}assets/img/estrella-marquee.svg" class="editorial-title-star" alt="" aria-hidden="true" width="140" height="140"></h1>
        <p class="editorial-subtitle">${esc(p.summary)}</p>
      </div>
    </div>
  </header>` : '';

  const flipbookHtml = p.flipbook ? `<section class="project-flipbook" aria-labelledby="project-flipbook-title">
    <div class="wrap">
      <div class="project-flipbook-heading">
        <span class="project-section-eyebrow">THE PUBLICATION</span>
        <h2 id="project-flipbook-title">Flip through the book</h2>
        <p>Explore the complete publication, page by page.</p>
      </div>
      <div class="project-flipbook-frame">
        <iframe src="${esc(p.flipbook)}" title="${esc(p.title)} interactive publication" loading="lazy" allowfullscreen></iframe>
      </div>
      <a class="project-flipbook-link" href="${esc(p.flipbook)}" target="_blank" rel="noopener noreferrer">Open the full book ${icon.arrowUpRight}</a>
    </div>
  </section>` : '';

  const body = `<article class="project ${isEditorial ? 'project--editorial' : ''}">
  ${editorialHero}
  <header class="project-head ${isEditorial ? 'project-head--editorial' : ''}">
    <div class="wrap">
${isEditorial ? '' : `<a class="back" href="${root}#work">${icon.arrowLeft}<span>All work</span></a>
      <h1 class="project-title">${esc(p.title)}</h1>
      <p class="project-summary">${esc(p.summary)}</p>`}
      <dl class="project-meta">
        ${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('\n        ')}
      </dl>
      ${p.links?.length ? `<p class="project-links">${p.links.map((l) => `<a class="pill-link" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}${icon.arrowUpRight}</a>`).join(' ')}</p>` : ''}
    </div>
  </header>

  <section class="project-story" aria-label="Project overview">
    <div class="wrap story-grid">
      ${p.sections.map(([h, t]) => `<div class="story"><h2 class="story-title">${esc(h)}</h2><p>${esc(t)}</p></div>`).join('\n      ')}
      ${p.palette ? `<div class="palette" aria-label="Brand colors"><h2 class="story-title">Palette</h2><ul>${p.palette.map((c) => `<li><span class="swatch" style="background:${c}"></span><span class="hex">${c}</span></li>`).join('')}</ul></div>` : ''}
    </div>
  </section>

  ${flipbookHtml}

  ${galleryHtml}

  <nav class="next" aria-label="Next project">
    <div class="wrap">
      <a class="next-link" href="${root}work/${next.slug}/">
        <span class="next-title">${esc(next.shortTitle || next.title)}</span>
        <span class="next-label">Next project ${icon.arrowRight}</span>
      </a>
    </div>
  </nav>
</article>`;
  const og = coverOf(p).src;
  return layout({ title: p.title, description: p.summary, root, body, ogImage: og, bodyClass: isEditorial ? `is-project is-editorial-project${p.slug === 'mandato-centro' ? ' is-mandato' : ''}` : 'is-project' }).replaceAll('{ROOT}', root);
}

function notFound() {
  const root = '/';
  const body = `<section class="hero hero-404"><div class="wrap">
    <h1 class="hero-name"><span class="line"><span>Not</span></span><span class="line"><span>found</span></span></h1>
    <p class="hero-statement">This page does not exist. <a href="/">Go to the portfolio home</a>.</p>
  </div></section>`;
  return layout({ title: 'Page not found', root, body }).replaceAll('{ROOT}', root);
}

// ---------------- Write ----------------
const write = (rel, html) => {
  const url = new URL(rel, OUT);
  mkdirSync(new URL('./', url), { recursive: true });
  writeFileSync(url, html);
};
if (existsSync(new URL('work/', OUT))) rmSync(new URL('work/', OUT), { recursive: true });
write('index.html', home());
write('about/index.html', aboutPage());
projects.forEach((p, i) => write(`work/${p.slug}/index.html`, projectPage(p, i)));
write('404.html', notFound());
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${site.url}/</loc></url>\n<url><loc>${site.url}/about/</loc></url>\n${projects
    .map((p) => `<url><loc>${site.url}/work/${p.slug}/</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`Built ${projects.length + 2} pages into ./site`);
