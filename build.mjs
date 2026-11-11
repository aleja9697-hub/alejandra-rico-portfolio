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
        <li><a href="${root}#about">About</a></li>
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

function contactBlock() {
  return `<section class="contact" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <h2 class="contact-title" id="contact-title">Let’s work together</h2>
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
  const badgeMap = {
  'al-centro': '/img/btn-visual-identity-2024.svg',
  'mandato-centro': '/img/btn-editorial-design-2024.svg'
};

  const rows = homeRows
    .map(
      (row) => `<div class="work-row">
${row
  .map(([slug, span]) => {
    const p = bySlug[slug];
    if (!p) throw new Error(`homeRows references unknown project "${slug}"`);
    const c = coverOf(p);
    // Mostrar otra imagen real del mismo proyecto dentro de la lente.
    const alternateNumber = p.gallery?.flat().find((n) => n !== (p.cover || 1));
    const alternate = alternateNumber ? img(p.slug, alternateNumber) : null;
    const badgeSrc = badgeMap[slug];
    const alt = p.coverImage ? `${p.title}: a selection of posts` : (p.alts?.[(p.cover || 1) - 1] || p.title);
    return `  <a class="work-item span-${span}${p.coverFit === 'contain' ? ' is-contain' : ''}" href="work/${p.slug}/" style="--span:${span}">
    <span class="work-media">${picture(c, alt, { sizes: `(max-width: 760px) 100vw, ${Math.round((span / 12) * 100)}vw`, eager: slug === 'al-centro' || slug === 'mandato-centro', style: p.coverPosition ? `object-position:${p.coverPosition}` : '' })}${alternate ? `<img class="work-lens-image" src="${alternate.src}" width="${alternate.w}" height="${alternate.h}" alt="" aria-hidden="true" loading="lazy" decoding="async">` : ''}</span>
    <span class="work-caption">
      <span class="work-title">${esc(p.shortTitle || p.title)}</span>   
<span class="work-meta">
  ${badgeSrc
    ? `<img class="work-badge-img" src="${badgeSrc}" alt="${esc(p.discipline)} - ${esc(p.year)}">`
    : `<span>${esc(p.discipline)}</span><span>${esc(p.year)}</span>`
  }
</span>
    </span>
  </a>`;
  })
  .join('\n')}
</div>`
    )
    .join('\n');

  const portrait = images.about[0];


const body = `<section class="hero hero-image-section" id="top">
  <div class="hero-image">
    <img
src="/img/Home1.png"
      alt="Alejandra Rico — Graphic Designer. Visual identity, editorial and social media design."
    />
  </div>
</section>

<section class="work" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="work-title" class="section-title work-custom-title"><span class="work-highlight-base">SEELECTED WOORK</span><span class="work-highlight-reveal" aria-hidden="true">SEELECTED WOORK</span></h2>
      <p class="section-note">${count} projects in visual identity, editorial, social media and web, 2024 to 2026.</p>
    </div>
${rows}
  </div>
</section>

<section class="about" id="about" aria-labelledby="about-title">
  <div class="wrap about-grid">
    <figure class="about-portrait">
      ${picture(portrait, `Portrait of ${site.fullName}`, { sizes: '(max-width: 760px) 80vw, 30vw' })}
    </figure>
    <div class="about-body">
      <h2 id="about-title" class="section-title">About</h2>
      ${site.about.map((p, i) => `<p${i === 0 ? ' class="lede"' : ''}>${esc(p)}</p>`).join('\n      ')}
    </div>
  </div>

  <div class="wrap impact-wrap">
    <h3 class="cv-title">Results</h3>
    <dl class="impact">
      ${site.impact.map((m) => `<div class="impact-item"><dt class="impact-value">${esc(m.value)}</dt><dd class="impact-label">${esc(m.label)}</dd></div>`).join('\n      ')}
    </dl>
  </div>

  <div class="wrap cv">
    <div class="cv-block cv-experience">
      <h3 class="cv-title">Experience</h3>
      <ol class="exp-list">
        ${site.experience
          .map(
            (e) => `<li class="exp">
          <p class="exp-role">${esc(e.role)}</p>
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
        <h3 class="cv-title">Tools</h3>
        <p class="tool-line">${site.tools.map(esc).join(', ')}</p>
      </div>
      <div class="cv-block">
        <h3 class="cv-title">Languages</h3>
        <p class="tool-line">${site.languages.map(esc).join('<br>')}</p>
      </div>
    </div>
  </div>

  <div class="wrap capabilities">
    <h3 class="cv-title">What I do</h3>
    <dl class="cap-list">
      ${site.capabilities.map((c) => `<div class="cap"><dt>${esc(c.title)}</dt><dd>${esc(c.text)}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</section>`;
  return layout({ root, body, bodyClass: 'is-home' }).replaceAll('{ROOT}', root);
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
  if (p.gallery) {
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

  const body = `<article class="project">
  <header class="project-head">
    <div class="wrap">
      <a class="back" href="${root}#work">${icon.arrowLeft}<span>All work</span></a>
      <h1 class="project-title">${esc(p.title)}</h1>
      <p class="project-summary">${esc(p.summary)}</p>
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
  return layout({ title: p.title, description: p.summary, root, body, ogImage: og, bodyClass: 'is-project' }).replaceAll('{ROOT}', root);
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
projects.forEach((p, i) => write(`work/${p.slug}/index.html`, projectPage(p, i)));
write('404.html', notFound());
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${site.url}/</loc></url>\n${projects
    .map((p) => `<url><loc>${site.url}/work/${p.slug}/</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`Built ${projects.length + 2} pages into ./site`);
