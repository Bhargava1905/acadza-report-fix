/**
 * Question HTML is intentionally rich (including MathML), so escaping it would
 * break the faculty preview. Strip executable/browser-navigation primitives
 * before sending it to React's HTML renderer instead.
 */
export function sanitizeQuestionHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return html;
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script, iframe, object, embed, link, style').forEach((node) => node.remove());
  document.querySelectorAll('*').forEach((node) => {
    for (const attribute of [...node.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on') || (['href', 'src', 'xlink:href'].includes(name) && /^(javascript|data):/.test(value))) {
        node.removeAttribute(attribute.name);
      }
    }
  });
  return document.body.innerHTML;
}
