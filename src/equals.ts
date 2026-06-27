/**
 * URN equivalence (spec §8).
 */
import type { ParsedUrn } from './types.js';

/**
 * Return `true` iff `left` and `right` are equivalent URNs (spec §8): their
 * `nid` values are equal case-insensitively and their `nss` element lists are
 * equal case-sensitively, element-for-element. `nssSlashDelimiter`, `query`,
 * `resolvers`, and `fragment` do not affect identity.
 *
 * NIDs contain only ASCII characters (spec §4), so `toLowerCase` performs the
 * required ASCII case folding.
 */
export function equals(left: ParsedUrn, right: ParsedUrn): boolean {
  if (left.nid.toLowerCase() !== right.nid.toLowerCase()) {
    return false;
  }
  if (left.nss.length !== right.nss.length) {
    return false;
  }
  return left.nss.every((element, i) => element === right.nss[i]);
}
