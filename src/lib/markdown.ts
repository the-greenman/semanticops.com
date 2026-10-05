import { createMarkdownProcessor } from "@astrojs/markdown-remark";

/**
 * The one markdown renderer for record fields (`lede`, `body`, `explanation`). The processor
 * ships with Astro; the code theme is the same css-variables theme as the rest of the site, so
 * fenced code follows light, dark and ink through the tokens.
 */
let processor: ReturnType<typeof createMarkdownProcessor> | undefined;

/** Markdown to HTML (blocks). */
export async function markdown(source: string): Promise<string> {
  processor ??= createMarkdownProcessor({ shikiConfig: { theme: "css-variables" } });
  return (await (await processor).render(source)).code;
}

/** Markdown to inline HTML: a single paragraph loses its <p>, so it can sit in a heading or a lede. */
export async function markdownInline(source: string): Promise<string> {
  const html = (await markdown(source)).trim();
  const m = html.match(/^<p>([\s\S]*)<\/p>$/);
  return m && !m[1].includes("<p>") ? m[1] : html;
}
