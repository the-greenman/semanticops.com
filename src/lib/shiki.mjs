/**
 * The one Shiki configuration. Every code block on the site is highlighted with the css-variables
 * theme, which emits var(--astro-code-*): tokens-components.css maps those to semantic tokens, so
 * code follows light, dark and ink with no second theme. Read by astro.config.mjs (markdown),
 * lib/markdown.ts (record fields) and CodeSample.astro, so the three can never disagree.
 */
export const shikiConfig = /** @type {const} */ ({ theme: "css-variables" });
