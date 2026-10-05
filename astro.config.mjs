// @ts-check
import { defineConfig, fontProviders } from "astro/config";

// Static output only: dist/ is a plain site any static host can serve.
// Fonts are self-hosted: the local provider reads the woff2 files of the installed @fontsource
// packages (so a build never touches a font CDN) and Astro emits them with the build.
/**
 * @param {string} name
 * @param {string} cssVariable
 * @param {string} pkg
 * @param {string} slug
 * @param {[number, ...number[]]} weights
 * @param {string[]} fallbacks
 */
const plex = (name, cssVariable, pkg, slug, [first, ...rest], fallbacks) => {
  const variant = (/** @type {number} */ weight) => ({
    weight,
    style: /** @type {const} */ ("normal"),
    src: /** @type {[string]} */ ([`${pkg}/files/${slug}-latin-${weight}-normal.woff2`]),
  });
  return {
    name,
    cssVariable,
    provider: fontProviders.local(),
    options: { variants: /** @type {[ReturnType<typeof variant>, ...ReturnType<typeof variant>[]]} */ ([variant(first), ...rest.map(variant)]) },
    fallbacks,
  };
};

export default defineConfig({
  site: "https://semanticops.com",
  output: "static",
  build: { format: "directory" },
  fonts: [
    plex("IBM Plex Sans", "--font-plex-sans", "@fontsource/ibm-plex-sans", "ibm-plex-sans", [300, 400, 500, 700], ["system-ui", "sans-serif"]),
    plex("IBM Plex Mono", "--font-plex-mono", "@fontsource/ibm-plex-mono", "ibm-plex-mono", [400, 500], ["ui-monospace", "monospace"]),
  ],
  markdown: {
    // Shiki's css-variables theme emits var(--astro-code-*): src/styles/tokens-components.css maps them to tokens.
    shikiConfig: { theme: "css-variables" },
  },
});
