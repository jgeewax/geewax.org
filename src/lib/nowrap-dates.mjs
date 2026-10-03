// Markdown (Satteri hast) plugin: keeps date ranges like "Jan 2026 - present"
// or "2005 - 2008" on one line, so a narrow screen never starts a line with
// "- present" (which reads like a bullet). Wraps each in <span class="nowrap">.

const RANGE = /((?:[A-Z][a-z]{2} )?\d{4} - (?:(?:[A-Z][a-z]{2} )?\d{4}|present))/;
const SKIP = new Set(['code', 'pre', 'script', 'style']);

export default {
  name: 'nowrap-dates',
  text(node, ctx) {
    if (!RANGE.test(node.value)) return;
    const parent = ctx.parent(node);
    if (parent?.type === 'element') {
      if (SKIP.has(parent.tagName)) return;
      const cls = parent.properties?.className;
      if (parent.tagName === 'span' && (Array.isArray(cls) ? cls.includes('nowrap') : cls === 'nowrap')) return;
    }
    const parts = node.value.split(RANGE);
    ctx.replaceNode(
      node,
      parts
        .map((value, i) =>
          i % 2 === 1
            ? { type: 'element', tagName: 'span', properties: { className: ['nowrap'] }, children: [{ type: 'text', value }] }
            : { type: 'text', value },
        )
        .filter((n) => n.type === 'element' || n.value),
    );
  },
};
