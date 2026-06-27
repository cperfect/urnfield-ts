/**
 * Declarative NSS schema validation (spec §9) plus ergonomic builders for
 * constructing matcher trees.
 *
 * The matcher objects are plain data identical to the conformance fixture
 * shape, so a schema can equally be written as a literal or with the builders
 * below.
 */
import type {
  ParsedUrn,
  Schema,
  Matcher,
  ExactMatcher,
  RegexMatcher,
  OneOfStringsMatcher,
  OneOfSubschemasMatcher,
  GlobMatcher,
  ValidationResult,
} from './types.js';
import { matchesGlob } from './glob.js';

const VALID: ValidationResult = { valid: true };

function invalid(error: string): ValidationResult {
  return { valid: false, error };
}

/** Full-match a single already-split element against a regex pattern (spec §9.2). */
function regexFullMatch(pattern: string, element: string): boolean {
  return new RegExp(`^(?:${pattern})$`).test(element);
}

/**
 * Continue the matcher chain with `remaining` elements: a `null` continuation
 * is terminal (success iff no elements remain), otherwise recurse (spec §9.1).
 */
function continueChain(next: Matcher | null, remaining: string[], delimiter: string): ValidationResult {
  if (next === null) {
    return remaining.length === 0 ? VALID : invalid('too many elements');
  }
  return walk(next, remaining, delimiter);
}

/** Apply an `exact`/`regex` matcher, which consumes exactly one element. */
function matchSingle(
  matcher: ExactMatcher | RegexMatcher,
  elements: string[],
  delimiter: string,
): ValidationResult {
  if (elements.length === 0) {
    return invalid('not enough elements');
  }
  const head = elements[0];
  let matched: boolean;
  if (matcher.type === 'exact') {
    matched = head === matcher.value;
  } else {
    // A malformed pattern must not escape the ValidationResult contract.
    try {
      matched = regexFullMatch(matcher.pattern, head);
    } catch {
      return invalid(`invalid regex pattern /${matcher.pattern}/`);
    }
  }
  if (!matched) {
    const expected = matcher.type === 'exact' ? `"${matcher.value}"` : `/${matcher.pattern}/`;
    return invalid(`element "${head}" does not match ${expected}`);
  }
  return continueChain(matcher.next, elements.slice(1), delimiter);
}

/** Walk a matcher against the remaining `elements` (spec §9.1–§9.2). */
function walk(matcher: Matcher, elements: string[], delimiter: string): ValidationResult {
  switch (matcher.type) {
  case 'exact':
  case 'regex':
    return matchSingle(matcher, elements, delimiter);
  case 'oneOfStrings': {
    if (elements.length === 0) {
      return invalid('not enough elements');
    }
    const head = elements[0];
    if (!Object.prototype.hasOwnProperty.call(matcher.alternatives, head)) {
      return invalid(`"${head}" is not one of the allowed values`);
    }
    return continueChain(matcher.alternatives[head], elements.slice(1), delimiter);
  }
  case 'oneOfSubschemas': {
    // First alternative that succeeds wins; no backtracking once it commits.
    for (const alternative of matcher.alternatives) {
      const result = walk(alternative, elements, delimiter);
      if (result.valid) {
        return result;
      }
    }
    return invalid('no alternative subschema matched');
  }
  case 'glob': {
    // Glob consumes all remaining elements, rejoined into the raw NSS tail.
    const tail = elements.join(delimiter);
    let matched: boolean;
    // A malformed pattern (e.g. an out-of-order range) must not escape the contract.
    try {
      matched = matchesGlob(matcher.pattern, matcher.separators, tail);
    } catch {
      return invalid(`invalid glob pattern "${matcher.pattern}"`);
    }
    return matched ? VALID : invalid(`"${tail}" does not match glob "${matcher.pattern}"`);
  }
  }
}

/**
 * Validate a {@link ParsedUrn} against a {@link Schema} (spec §9). Returns a
 * {@link ValidationResult}; never throws on a validation failure.
 *
 * Only `nid` and `nss` are considered — `query`, `resolvers`, and `fragment`
 * are ignored.
 */
export function validate(schema: Schema, urn: ParsedUrn): ValidationResult {
  if (urn.nid !== schema.nid) {
    return invalid(`nid "${urn.nid}" does not match schema nid "${schema.nid}"`);
  }
  if (urn.nss.length === 0) {
    return invalid('cannot validate an empty nss');
  }
  const delimiter = urn.nssSlashDelimiter ? '/' : ':';
  return walk(schema.nss, urn.nss, delimiter);
}

// --- Matcher builders -------------------------------------------------------

/** Build an {@link ExactMatcher}. */
export const exact = (value: string, next: Matcher | null = null): ExactMatcher => ({
  type: 'exact',
  value,
  next,
});

/** Build a {@link RegexMatcher}. */
export const regex = (pattern: string, next: Matcher | null = null): RegexMatcher => ({
  type: 'regex',
  pattern,
  next,
});

/** Build a {@link OneOfStringsMatcher}. */
export const oneOfStrings = (
  alternatives: Record<string, Matcher | null>,
): OneOfStringsMatcher => ({ type: 'oneOfStrings', alternatives });

/** Build a {@link OneOfSubschemasMatcher} from alternatives in priority order. */
export const oneOfSubschemas = (...alternatives: Matcher[]): OneOfSubschemasMatcher => ({
  type: 'oneOfSubschemas',
  alternatives,
});

/** Build a {@link GlobMatcher}. */
export const glob = (pattern: string, separators: string[] = []): GlobMatcher => ({
  type: 'glob',
  pattern,
  separators,
});

/** Build a {@link Schema} from a NID and the head matcher of its NSS chain. */
export const schema = (nid: string, nss: Matcher): Schema => ({ nid, nss });
