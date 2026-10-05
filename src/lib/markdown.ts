import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { shikiConfig } from "./shiki.mjs";

/**
 * The one markdown renderer for record fields (`lede`, `body`, `explanation`). Its output is
 * trusted: the source pipeline's lint (scripts/source/build-source.mjs) rejects raw HTML and
 * non-http(s) link schemes in those fields. Code is highlighted with the shared Shiki config.
 *
 * `@astrojs/markdown-remark` is the processor Astro itself uses and is pinned to the exact version
 * astro pins. Keep it in step with astro: when astro is upgraded, set this dependency to the
 * version that `npm ls @astrojs/markdown-remark` reports under astro, so there is one copy.
 */
let processor: ReturnType<typeof createMarkdownProcessor> | undefined;

/** Markdown to HTML (blocks). */
export async function markdown(source: string): Promise<string> {
  processor ??= createMarkdownProcessor({ shikiConfig });
  return (await (await processor).render(source)).code;
}

/** Markdown to inline HTML: a single paragraph loses its <p>, so it can sit in a heading or a lede. */
export async function markdownInline(source: string): Promise<string> {
  const html = (await markdown(source)).trim();
  const m = html.match(/^<p>([\s\S]*)<\/p>$/);
  return m && !m[1].includes("<p>") ? m[1] : html;
}
