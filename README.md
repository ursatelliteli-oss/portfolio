# Li Sixuan — Portfolio

A static portfolio website featuring selected design projects and complete project pages.

Open `index.html` locally or serve this directory with any static file server. Project pages are in `projects/`, with their images in `assets/figma-projects/`.

For GitHub Pages, publish the root of the `main` branch. The site uses relative paths so it also works at `https://ursatelliteli-oss.github.io/portfolio/`.

## Cloudflare Workers

The repository includes `wrangler.toml` for an assets-only Worker named `portfolio`. In Cloudflare Workers Builds, use the repository root, leave the build command empty, and set the deploy command to `npx wrangler deploy`. Wrangler serves only the files in `public/`, keeping source materials and repository files out of the public website.

After editing the root website files, run `node scripts/build-public.mjs` and commit the refreshed `public/` directory before pushing. GitHub Pages continues to publish the root website files.
