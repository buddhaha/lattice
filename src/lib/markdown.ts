function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInline(text: string) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

function isPlainHeadingCandidate(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > 90) return false;
  if (/[.,?!:]$/.test(trimmed)) return false;
  if (/^[-*]\s+/.test(trimmed)) return false;
  if (/^\d+\.\s+/.test(trimmed)) return false;
  if (trimmed === '"""') return false;
  return /^[A-Z0-9"'(][A-Za-z0-9"'()/:,+&\-\s]+$/.test(trimmed);
}

function isCodeLike(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > 140) return false;
  if (/^(What changed|What’s wrong|Getting Started|Resources|Security|Courses|Talks & Tools)/.test(trimmed)) return false;
  return /(^@|=>|->|::|^\w+\s*=|^\)|^\(|^\]|\[$|^\}|\{$|await |return |async |def |class |if |for |while |Literal\[|find_one|to_list|count_documents|update_one|jsonrpc|params|method)/.test(trimmed);
}

export function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const chunks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const codeStart = line.match(/^```([\w-]*)\s*$/);
    if (codeStart) {
      const lang = codeStart[1];
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      chunks.push(`<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      chunks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    const prevLine = lines[i - 1] || '';
    let nextNonEmpty = '';
    for (let j = i + 1; j < lines.length; j += 1) {
      if (lines[j].trim()) {
        nextNonEmpty = lines[j];
        break;
      }
    }

    const isPlainHeading =
      isPlainHeadingCandidate(line) &&
      !prevLine.trim() &&
      !isPlainHeadingCandidate(nextNonEmpty);

    if (isPlainHeading) {
      chunks.push(`<h2>${renderInline(line.trim())}</h2>`);
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        if (!lines[i].trim()) {
          if (/^[-*]\s+/.test(lines[i + 1] || '')) {
            i += 1;
            continue;
          }
          break;
        }
        if (!/^[-*]\s+/.test(lines[i])) break;
        items.push(`<li>${renderInline(lines[i].replace(/^[-*]\s+/, ''))}</li>`);
        i += 1;
      }
      chunks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        if (!lines[i].trim()) {
          if (/^\d+\.\s+/.test(lines[i + 1] || '')) {
            i += 1;
            continue;
          }
          break;
        }
        if (!/^\d+\.\s+/.test(lines[i])) break;
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      chunks.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    if (/^>\s+/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s+/.test(lines[i])) {
        quote.push(renderInline(lines[i].replace(/^>\s+/, '')));
        i += 1;
      }
      chunks.push(`<blockquote><p>${quote.join('<br>')}</p></blockquote>`);
      continue;
    }

    if (isCodeLike(line)) {
      const codeLines: string[] = [];
      let codeLikeCount = 0;
      while (i < lines.length && lines[i].trim()) {
        codeLines.push(lines[i]);
        if (isCodeLike(lines[i])) codeLikeCount += 1;
        i += 1;
      }
      if (codeLines.length >= 3 && codeLikeCount >= Math.max(2, Math.ceil(codeLines.length * 0.6))) {
        chunks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        continue;
      }
      chunks.push(`<p>${codeLines.map((part) => renderInline(part.trim())).join('<br>')}</p>`);
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('```') &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^>\s+/.test(lines[i]) &&
      !(
        isPlainHeadingCandidate(lines[i]) &&
        !(lines[i - 1] || '').trim() &&
        !isPlainHeadingCandidate(lines[i + 1] || '')
      ) &&
      !isCodeLike(lines[i])
    ) {
      paragraph.push(renderInline(lines[i].trim()));
      i += 1;
    }
    if (paragraph.length === 0) {
      chunks.push(`<p>${renderInline(line.trim())}</p>`);
      i += 1;
      continue;
    }
    chunks.push(`<p>${paragraph.join('<br>')}</p>`);
  }

  return chunks.join('\n');
}
