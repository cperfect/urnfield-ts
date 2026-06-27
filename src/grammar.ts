/**
 * The URN lexical grammar (spec §4). A single anchored regular expression
 * matches the whole input and captures the raw component substrings; the
 * parsing algorithm (spec §5, see `parse.ts`) then derives the data model from
 * them.
 *
 * Character classes mirror the ABNF exactly:
 * - NID       `ALPHA / DIGIT / "-"`
 * - NSS       `ALPHA / DIGIT / ":" / "/" / "." / "_" / "-" / ";"`
 * - kv-char   `ALPHA / DIGIT / "_" / "=" / "*" / "&" / "-"`  (query / resolvers)
 * - frag-char `ALPHA / DIGIT / "_" / "*" / "-" / "/" / "(" / ")"`
 *
 * The components, when present, MUST appear in the order query (`?=`),
 * resolvers (`?+`), then fragment (`#`). Because `?` and `#` are not NSS chars
 * and `?` is not a kv-char, each greedy segment stops at the next marker, so a
 * `?+` before `?=` simply fails to match the whole string and is rejected.
 */

/** The raw, still-textual components of a matched URN string. */
export interface UrnComponents {
  nid: string;
  nss: string;
  /** The text after `?=`, or `undefined` if the query component is absent. */
  query?: string;
  /** The text after `?+`, or `undefined` if the resolvers component is absent. */
  resolvers?: string;
  /** The text after `#`, or `undefined` if the fragment component is absent. */
  fragment?: string;
}

const NID = '[A-Za-z0-9-]+';
const NSS = '[A-Za-z0-9:/._;-]+';
const KV = '[A-Za-z0-9_=*&-]+';
const FRAG = '[A-Za-z0-9_*/()-]+';

const URN_RE = new RegExp(
  `^urn:(?<nid>${NID}):(?<nss>${NSS})` +
    `(?:\\?=(?<query>${KV}))?` +
    `(?:\\?\\+(?<resolvers>${KV}))?` +
    `(?:#(?<fragment>${FRAG}))?$`,
);

/**
 * Match `input` in full against the URN grammar, returning its raw components,
 * or `null` if it does not match (spec §5 step 1).
 */
export function matchUrn(input: string): UrnComponents | null {
  const matched = URN_RE.exec(input);
  if (matched === null || matched.groups === undefined) {
    return null;
  }
  const groups = matched.groups;
  return {
    nid: groups.nid,
    nss: groups.nss,
    query: groups.query,
    resolvers: groups.resolvers,
    fragment: groups.fragment,
  };
}
