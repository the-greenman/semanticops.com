// @ts-check
import { defineConfig, fontProviders } from "astro/config";

// Static output only: dist/ is a plain site any static host can serve.
// Fonts are self-hosted: the local provider reads the woff2 files of the installed @fontsource
// packages (so a build never touches a font CDN) and Astro emits them with the build.
const plex = (name, cssVariable, pkg, slug, weights, fallbacks) => ({
  name,
  cssVariable,
  provider: fontProviders.local(),
  options: {
    variants: weights.map((weight) => ({
      weight,
      style: "normal",
      src: [`${pkg}/files/${slug}-latin-${weight}-normal.woff2`],
    })),
  },
  fallbacks,
});

export default defineConfig({
  site: "https://semanticops.com",
  output: "static",
  build: { format: "directory" },
  fonts: [
    plex("IBM Plex Sans", "--font-plex-sans", "@fontsource/ibm-plex-sans", "ibm-plex-sans", [300, 400, 500, 700], ["system-ui", "sans-serif"]),
    plex("IBM Plex Mono", "--font-plex-mono", "@fontsource/ibm-plex-mono", "ibm-plex-mono", [400, 500], ["ui-monospace", "monospace"]),
  ],
  markdown: {
    // Shiki's css-variables theme emits var(--astro-code-*): src/styles/base.css maps them to tokens.
    shikiConfig: { theme: "css-variables" },
  },
});
