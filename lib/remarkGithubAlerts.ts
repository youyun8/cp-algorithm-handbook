type MdastNode = {
  type: string;
  children?: MdastNode[];
  value?: string;
  data?: unknown;
};

const kAlertPattern = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i;

function tagAlert(blockquote: MdastNode) {
  const first_paragraph = blockquote.children?.[0];
  if (!first_paragraph || first_paragraph.type !== 'paragraph') {
    return;
  }

  const first_text = first_paragraph.children?.[0];
  if (!first_text || first_text.type !== 'text' || typeof first_text.value !== 'string') {
    return;
  }

  const match = first_text.value.match(kAlertPattern);
  if (!match) {
    return;
  }

  const alert_type = match[1].toLowerCase();
  const remainder = first_text.value.slice(match[0].length);

  if (remainder) {
    first_text.value = remainder;
  } else {
    first_paragraph.children!.shift();
    // A hard break (two trailing spaces / backslash) right after the marker
    // line would otherwise leave a leading blank line in the callout body.
    if (first_paragraph.children![0]?.type === 'break') {
      first_paragraph.children!.shift();
    }
  }

  if (first_paragraph.children!.length === 0) {
    blockquote.children!.shift();
  }

  blockquote.data = {
    hName: 'blockquote',
    hProperties: { className: ['markdown-alert', `markdown-alert-${alert_type}`] }
  };
}

function walk(node: MdastNode) {
  if (node.type === 'blockquote') {
    tagAlert(node);
  }
  node.children?.forEach(walk);
}

/**
 * GitHub renders a blockquote whose first line is `[!NOTE]`, `[!TIP]`,
 * `[!IMPORTANT]`, `[!WARNING]`, or `[!CAUTION]` as a colored callout instead
 * of a plain blockquote. This is a GitHub UI convention layered on top of
 * markdown, not part of the CommonMark/GFM parsing spec, so remark-gfm
 * doesn't handle it. This remark plugin walks the parsed tree, strips the
 * `[!TYPE]` marker line from matching blockquotes, and tags them with a
 * `markdown-alert markdown-alert-<type>` class (mirroring GitHub's own DOM
 * output) so `MarkdownBlock`'s `blockquote` component can render the
 * styled callout instead of the default blockquote.
 */
export function remarkGithubAlerts() {
  return (tree: MdastNode) => {
    walk(tree);
  };
}
