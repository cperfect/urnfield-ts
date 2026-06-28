/**
 * The pinned glob dialect (spec §10), compiled to an anchored {@link RegExp}.
 *
 * A pattern is matched against the raw NSS tail (remaining elements rejoined
 * with the URN's own delimiter). Each pattern carries an optional set of
 * separator characters that `*` and `?` may not cross; `**` always crosses.
 *
 * | Pattern        | Meaning                                                        |
 * |----------------|----------------------------------------------------------------|
 * | `*`            | any run of non-separator chars (any chars if no separators)    |
 * | `**`           | any run of chars, including separators                         |
 * | `?`            | any single non-separator char (any char if no separators)      |
 * | `[abc] [a-z]`  | one char in the set/range (`[!...]` negates)                   |
 * | `{a,b,c}`      | any one of the comma-separated alternatives                   |
 * | other          | a literal character                                            |
 */

/** Escape a single character for use as a regex literal. */
function escapeLiteral(ch: string): string {
  return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Escape separator characters for use inside a `[^...]` regex character class. */
function escapeClassChars(chars: string[]): string {
  return chars.map((ch) => ch.replace(/[\\\]^-]/g, '\\$&')).join('');
}

/**
 * Translate a glob `[...]` class body to a regex class body. Negation is spelled
 * `[!...]` in the dialect; a literal `^` must be escaped so the RegExp class does
 * not read it as its own negation marker.
 */
function translateClassBody(body: string): string {
  let inner = body;
  let prefix = '';
  if (inner.startsWith('!')) {
    prefix = '^';
    inner = inner.slice(1);
  }
  return prefix + inner.replace(/[\\^]/g, '\\$&');
}

/**
 * Index of the `}` closing the `{` at `start`, accounting for nesting; -1 if
 * unbalanced. Braces inside a `[...]` character class are literal and ignored,
 * so a class containing `}` (e.g. `{a,[}]}`) does not end the alternation early.
 */
function findBraceEnd(pattern: string, start: number): number {
  let depth = 0;
  let inClass = false;
  for (let i = start; i < pattern.length; i++) {
    const ch = pattern[i];
    if (inClass) {
      if (ch === ']') {
        inClass = false;
      }
    } else if (ch === '[') {
      inClass = true;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Split a `{a,b,c}` body on top-level commas, ignoring commas nested in `{}`
 * groups or literal inside a `[...]` character class (so the class `}`/`,`
 * characters do not affect splitting, mirroring {@link findBraceEnd}).
 */
function splitTopComma(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inClass = false;
  let current = '';
  for (const ch of body) {
    if (inClass) {
      if (ch === ']') {
        inClass = false;
      }
    } else if (ch === '[') {
      inClass = true;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
    } else if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
}

/**
 * Translate a glob pattern to a regex source fragment. `star`/`question` are the
 * separator-aware translations of `*` and `?` (precomputed by {@link compileGlob}).
 */
function globToSource(pattern: string, star: string, question: string): string {
  let out = '';
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === '*') {
      if (pattern[i + 1] === '*') {
        out += '.*'; // ** crosses separators
        i += 2;
      } else {
        out += star;
        i += 1;
      }
    } else if (ch === '?') {
      out += question;
      i += 1;
    } else if (ch === '[') {
      const end = pattern.indexOf(']', i + 1);
      if (end === -1) {
        out += '\\[';
        i += 1;
      } else {
        out += `[${translateClassBody(pattern.slice(i + 1, end))}]`;
        i = end + 1;
      }
    } else if (ch === '{') {
      const end = findBraceEnd(pattern, i);
      if (end === -1) {
        out += '\\{';
        i += 1;
      } else {
        const alts = splitTopComma(pattern.slice(i + 1, end)).map((alt) =>
          globToSource(alt, star, question),
        );
        out += `(?:${alts.join('|')})`;
        i = end + 1;
      }
    } else {
      out += escapeLiteral(ch);
      i += 1;
    }
  }
  return out;
}

/**
 * Compile a glob `pattern` with the given `separators` into an anchored RegExp
 * that matches an entire raw NSS tail (spec §10).
 */
export function compileGlob(pattern: string, separators: string[]): RegExp {
  const hasSeparators = separators.length > 0;
  const sepClass = escapeClassChars(separators);
  const star = hasSeparators ? `[^${sepClass}]*` : '.*';
  const question = hasSeparators ? `[^${sepClass}]` : '.';
  return new RegExp(`^${globToSource(pattern, star, question)}$`);
}

/** Return `true` iff `text` matches the glob `pattern` under `separators` (spec §10). */
export function matchesGlob(pattern: string, separators: string[], text: string): boolean {
  return compileGlob(pattern, separators).test(text);
}
