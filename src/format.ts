/**
 * Canonical formatting (spec §6): the inverse of {@link parse}.
 */
import type { ParsedUrn, UrnParams } from './types.js';
import { UrnFormatError } from './errors.js';
import { isWellFormed } from './wellformed.js';

/**
 * Render a `?=` / `?+` key/value map (spec §6). Keys are emitted in ascending
 * lexicographic (codepoint) order; an empty value list emits the bare key,
 * otherwise each value emits a `key=value` unit. Units are joined with `&`.
 * Returns the empty string for an empty map (so the component is omitted).
 *
 * Keys contain only ASCII kv-chars, so the default string sort (UTF-16 code
 * units) coincides with codepoint/byte order.
 */
function renderParams(params: UrnParams): string {
  const units: string[] = [];
  for (const key of Object.keys(params).sort()) {
    const values = params[key];
    if (values.length === 0) {
      units.push(key);
    } else {
      for (const value of values) {
        units.push(`${key}=${value}`);
      }
    }
  }
  return units.join('&');
}

/**
 * Format a {@link ParsedUrn} into its canonical string form (spec §6). Throws
 * {@link UrnFormatError} if `urn` is not well-formed (spec §7).
 */
export function format(urn: ParsedUrn): string {
  if (!isWellFormed(urn)) {
    throw new UrnFormatError('cannot format a URN that is not well-formed (needs a non-empty nid and nss)');
  }
  const delimiter = urn.nssSlashDelimiter ? '/' : ':';
  let out = `urn:${urn.nid}:${urn.nss.join(delimiter)}`;

  const query = renderParams(urn.query);
  if (query.length > 0) {
    out += `?=${query}`;
  }
  const resolvers = renderParams(urn.resolvers);
  if (resolvers.length > 0) {
    out += `?+${resolvers}`;
  }
  if (urn.fragment.length > 0) {
    out += `#${urn.fragment}`;
  }
  return out;
}
