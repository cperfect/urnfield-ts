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
 * values (e.g. an empty `nss`, or a `null`/non-object passed by a JS caller)
 * rather than panicking (spec §7).
 */
export function isWellFormed(urn: ParsedUrn): boolean {
  // Guard before dereferencing so the boolean contract holds for JS callers
  // that may pass null/undefined or a non-object.
  if (urn === null || typeof urn !== 'object') {
    return false;
  }
  return (
    typeof urn.nid === 'string' &&
    urn.nid.length > 0 &&
    Array.isArray(urn.nss) &&
    urn.nss.length > 0
  );
}
