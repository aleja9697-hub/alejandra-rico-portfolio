# Alejandra Rico, portfolio

Static portfolio site for Alejandra Rico Gómez, graphic designer. Plain HTML, CSS and images: no framework, no server code, runs on any static host.

## Structure

- `site/` the complete, ready-to-publish website (this folder is what gets hosted)
- `content/site.mjs` all text: bio, experience, projects, captions, links
- `build.mjs` regenerates the HTML in `site/` from `content/site.mjs` and reads image sizes automatically (Vercel runs it on every publish)
- `site/assets/styles.css` all styling
- `site/img/<project>/` project images (WebP)
- `tools/prepare_images.py` one-time script used to extract images from the PDF portfolio (not needed for edits)

## Edit text or projects

1. Edit `content/site.mjs`.
2. Run `node build.mjs` (Node 18 or newer).
3. Open `site/index.html` in a browser, or publish the `site/` folder.

## Add or replace images

Put WebP, JPG or PNG files in `site/img/<project-slug>/` named `01`, `02`, ... (same names replace the old image; sizes are read automatically). To add or remove images, also update the `gallery` rows and `alts` for that project in `content/site.mjs`.

## Hosting

- Vercel: `vercel.json` runs `node build.mjs` and publishes the `site/` folder. Every change pushed to GitHub publishes automatically.
- Netlify, GitHub Pages, Cloudflare Pages or any web host: upload the contents of `site/`.
