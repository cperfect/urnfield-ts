/**
 * The core data model and schema types for the `urnfield` library.
 *
 * These mirror the technology-agnostic data model in the specification
 * (`submodules/urnfield-spec/SPECIFICATION.md` §3 and §9). The shapes are kept
 * as plain, serializable data so that the conformance fixtures — which are
 * already this shape — can be consumed directly.
 */

/**
 * An ordered key/value map as used by a URN's `?=` query and `?+` resolvers
 * components.
 *
 * Each key maps to its **ordered** list of values; a bare key (e.g. `?+niii`)
 * maps to an empty list. The insertion order of *keys* is not significant —
 * canonical formatting sorts keys (spec §6) — but the order of *values* within a
 * key MUST be preserved.
 */
export type UrnParams = Record<string, string[]>;

/**
 * A parsed URN: the abstract value produced by {@link parse} and consumed by
 * {@link format}, {@link equals}, and {@link validate}.
 *
 * Only `nid` and `nss` bear identity (spec §8); `nssSlashDelimiter`, `query`,
 * `resolvers`, and `fragment` do not affect equivalence.
 */
export interface ParsedUrn {
  /** Namespace identifier, verbatim (original case preserved). */
  nid: string;
  /** One entry per NSS element, in order. Non-empty for a well-formed URN. */
  nss: string[];
  /** `true` if the NSS used `/` as its delimiter, `false` for `:` or a single element. */
  nssSlashDelimiter: boolean;
  /** The `?=` component. Empty when absent. */
  query: UrnParams;
  /** The `?+` component. Empty when absent. */
  resolvers: UrnParams;
  /** The `#` component, without the leading `#`. Empty when absent. */
  fragment: string;
}

/**
 * A declarative NSS schema (spec §9): a required `nid` plus a tree of element
 * matchers describing the `nss`.
 */
export interface Schema {
  /** The NID the URN's `nid` must match (exact, case-sensitive in this version). */
  nid: string;
  /** The head of the matcher continuation chain applied to the `nss` elements. */
  nss: Matcher;
}

/** A single element matcher in a schema's continuation chain (spec §9.2). */
export type Matcher =
  | ExactMatcher
  | RegexMatcher
  | OneOfStringsMatcher
  | OneOfSubschemasMatcher
  | GlobMatcher;

/** The current element MUST equal `value`. Consumes one element. */
export interface ExactMatcher {
  type: 'exact';
  value: string;
  /** The continuation, or `null` to terminate the chain. */
  next: Matcher | null;
}

/**
 * The current element MUST fully match `pattern`. Consumes one element. The
 * pattern applies to a single already-split element, so it must not span `:`/`/`.
 */
export interface RegexMatcher {
  type: 'regex';
  pattern: string;
  /** The continuation, or `null` to terminate the chain. */
  next: Matcher | null;
}

/**
 * The current element MUST be one of the keys of `alternatives`; the matched
 * key selects the continuation. The fixed-string special case of
 * {@link OneOfSubschemasMatcher}. Consumes one element.
 */
export interface OneOfStringsMatcher {
  type: 'oneOfStrings';
  /** Allowed element → continuation (or `null` to terminate). */
  alternatives: Record<string, Matcher | null>;
}

/**
 * Try each alternative in declaration order; the first that succeeds wins. No
 * backtracking once an alternative commits.
 */
export interface OneOfSubschemasMatcher {
  type: 'oneOfSubschemas';
  alternatives: Matcher[];
}

/**
 * Match all remaining elements — rejoined into the raw NSS tail with the URN's
 * own delimiter — against a glob pattern (spec §10). Always terminal.
 */
export interface GlobMatcher {
  type: 'glob';
  pattern: string;
  /** Separator chars the glob must not cross with `*`/`?`. Empty ⇒ match any char. */
  separators: string[];
}

/**
 * The result of {@link validate}: whether the URN satisfies the schema, plus a
 * descriptive reason when it does not. Validation never throws on a "no" answer
 * (spec §9).
 */
export interface ValidationResult {
  valid: boolean;
  /** A human-readable reason, present when `valid` is `false`. */
  error?: string;
}
