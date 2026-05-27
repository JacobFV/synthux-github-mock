// Tiny regex-based highlighter. Returns HTML-safe markup with spans of
// class .tok-keyword .tok-string .tok-comment .tok-number .tok-function.
// Good enough to *look* like github.com syntax highlighting.

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const LANG_BY_EXT = {
  py: 'python',
  ts: 'ts',
  tsx: 'ts',
  js: 'ts',
  mjs: 'ts',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'md',
};

const KEYWORDS = {
  python: [
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not',
    'and', 'or', 'is', 'None', 'True', 'False', 'class', 'import', 'from',
    'as', 'try', 'except', 'finally', 'raise', 'with', 'pass', 'lambda',
    'yield', 'global', 'nonlocal', 'assert', 'break', 'continue',
  ],
  ts: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for',
    'while', 'do', 'switch', 'case', 'default', 'break', 'continue',
    'import', 'from', 'export', 'class', 'extends', 'implements', 'new',
    'this', 'super', 'try', 'catch', 'finally', 'throw', 'typeof',
    'instanceof', 'async', 'await', 'true', 'false', 'null', 'undefined',
    'void', 'interface', 'type', 'enum', 'as', 'in', 'of',
  ],
};

export function extOf(path) {
  const i = path.lastIndexOf('.');
  return i === -1 ? '' : path.slice(i + 1).toLowerCase();
}

export function langOf(path) {
  return LANG_BY_EXT[extOf(path)] || 'plain';
}

// Tokenize a single line of code by finding spans (start, end, class)
// for comments/strings, then keywords/numbers/functions in the gaps.
function highlightLine(line, lang) {
  if (lang === 'plain' || lang === 'md') return escape(line);

  const spans = []; // {start, end, cls, text}

  function tryRegex(re, cls) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (spans.some((s) => start < s.end && end > s.start)) continue;
      spans.push({ start, end, cls, text: m[0] });
      if (m[0].length === 0) re.lastIndex++;
    }
  }

  // 1. Comments first (eat to end of line).
  if (lang === 'python' || lang === 'yaml') {
    tryRegex(/#.*$/g, 'tok-comment');
  }
  if (lang === 'ts' || lang === 'json') {
    tryRegex(/\/\/.*$/g, 'tok-comment');
  }

  // 2. Strings.
  tryRegex(/"(?:[^"\\]|\\.)*"/g, 'tok-string');
  tryRegex(/'(?:[^'\\]|\\.)*'/g, 'tok-string');
  if (lang === 'ts') tryRegex(/`(?:[^`\\]|\\.)*`/g, 'tok-string');

  // 3. Keywords.
  const kws = KEYWORDS[lang];
  if (kws) {
    const kwRe = new RegExp(`\\b(?:${kws.join('|')})\\b`, 'g');
    tryRegex(kwRe, 'tok-keyword');
  }

  // 4. Function calls: identifier followed by '('.
  tryRegex(/\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g, 'tok-function');

  // 5. Numbers.
  tryRegex(/\b\d+(?:\.\d+)?\b/g, 'tok-number');

  // 6. YAML keys: 'key:' at start of trimmed line.
  if (lang === 'yaml') {
    tryRegex(/^\s*[A-Za-z_][A-Za-z0-9_-]*(?=:)/g, 'tok-keyword');
  }

  // 7. JSON keys: "key" followed by ':'.
  if (lang === 'json') {
    tryRegex(/"[^"\\]*"(?=\s*:)/g, 'tok-keyword');
  }

  spans.sort((a, b) => a.start - b.start);
  let out = '';
  let cursor = 0;
  for (const s of spans) {
    if (s.start < cursor) continue;
    out += escape(line.slice(cursor, s.start));
    out += `<span class="${s.cls}">${escape(s.text)}</span>`;
    cursor = s.end;
  }
  out += escape(line.slice(cursor));
  return out;
}

export function highlight(source, path) {
  const lang = langOf(path);
  const lines = source.split('\n');
  return lines.map((l) => highlightLine(l, lang));
}
