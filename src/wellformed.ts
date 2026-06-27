/**
 * Well-formedness check (spec §7).
 */
import type { ParsedUrn } from './types.js';

/**
 * Return `true` iff `urn` is well-formed: its `nid` is a non-empty string and
 * its `nss` has at least one element. `query`, `resolvers`, and `fragment`
 * impose no constraints.
 *
 * This never throws — it returns `false` for otherwise-empty or malformed
 * values (e.g. an empty `nss`) rather than panicking (spec §7).
 */
export function isWellFormed(urn: ParsedUrn): boolean {
  return (
    typeof urn.nid === 'string' &&
    urn.nid.length > 0 &&
    Array.isArray(urn.nss) &&
    urn.nss.length > 0
  );
}
