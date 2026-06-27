/**
 * Canonical formatting (spec §6): the inverse of {@link parse}.
 */
import type { ParsedUrn, UrnParams } from './types.js';
import { UrnFormatError } from './errors.js';
import { isWellFormed } from './wellformed.js';

/**
 * Assert that joining `nss` with its chosen delimiter produces a string that
 * {@link parse} would split back into exactly `nss` with the same delimiter.
 *
 * `isWellFormed` only checks presence, so it would accept elements that cannot
 * be serialized faithfully. Parsing re-derives the delimiter from the joined
 * NSS, **preferring `:`** (spec §5 step 3), so an element carrying a structural
 * delimiter can be silently re-split. We reject those cases up front:
 *
 * - any element containing the **active** delimiter would be over-split;
 * - for a `/`-delimited NSS, any element containing `:` would make a re-parse
 *   split on `:` instead of `/`;
 * - for a `:`-delimited NSS, only a *single* element matters: if it contains
 *   `/` (so the joined string has no `:`), a re-parse would split on `/`.
 *   With two or more elements the joining `:` keeps `:` the chosen delimiter,
 *   so an inner `/` is preserved and round-trips.
 */
function assertNssRoundTrips(nss: string[], slashDelimiter: boolean): void {
  const active = slashDelimiter ? '/' : ':';
  for (const element of nss) {
    if (typeof element !== 'string') {
      throw new UrnFormatError('every nss element must be a string');
    }
    if (element.includes(active)) {
      throw new UrnFormatError(
        `nss element ${JSON.stringify(element)} contains its delimiter ${JSON.stringify(active)} ` +
          'and would not round-trip',
      );
    }
  }
  if (slashDelimiter) {
    for (const element of nss) {
      if (element.includes(':')) {
        throw new UrnFormatError(
          `nss element ${JSON.stringify(element)} contains ':', which a re-parse would treat as the delimiter`,
        );
      }
    }
  } else if (nss.length === 1 && nss[0].includes('/')) {
    throw new UrnFormatError(
      `single nss element ${JSON.stringify(nss[0])} contains '/', which a re-parse would treat as the delimiter`,
    );
  }
}

/**
 * Render a `?=` / `?+` key/value map (spec §6). Keys are emitted in ascending
 * lexicographic (codepoint) order; an empty value list emits the bare key,
 * otherwise each value emits a `key=value` unit. Units are joined with `&`.
 * Returns the empty string for an empty map (so the component is omitted).
 *
 * Keys contain only ASCII kv-chars, so the default string sort (UTF-16 code
 * units) coincides with codepoint/byte order. `params` is validated here so a
 * malformed shape surfaces as a {@link UrnFormatError} rather than a TypeError.
 */
function renderParams(label: string, params: UrnParams): string {
  if (params === null || typeof params !== 'object') {
    throw new UrnFormatError(`${label} must be an object`);
  }
  const units: string[] = [];
  for (const key of Object.keys(params).sort()) {
    const values = params[key];
    if (!Array.isArray(values)) {
      throw new UrnFormatError(`${label} key "${key}" must map to an array of strings`);
    }
    if (values.length === 0) {
      units.push(key);
    } else {
      for (const value of values) {
        if (typeof value !== 'string') {
          throw new UrnFormatError(`${label} key "${key}" must map to an array of strings`);
        }
        units.push(`${key}=${value}`);
      }
    }
  }
  return units.join('&');
}

/**
 * Format a {@link ParsedUrn} into its canonical string form (spec §6). Throws
 * {@link UrnFormatError} if `urn` is not well-formed (spec §7), if any NSS
 * element would not round-trip, or if a component has an invalid shape.
 */
export function format(urn: ParsedUrn): string {
  if (!isWellFormed(urn)) {
    throw new UrnFormatError('cannot format a URN that is not well-formed (needs a non-empty nid and nss)');
  }
  const delimiter = urn.nssSlashDelimiter ? '/' : ':';
  assertNssRoundTrips(urn.nss, urn.nssSlashDelimiter);

  // Validate every component before concatenating so failures are typed.
  const query = renderParams('query', urn.query);
  const resolvers = renderParams('resolvers', urn.resolvers);
  if (typeof urn.fragment !== 'string') {
    throw new UrnFormatError('fragment must be a string');
  }

  let out = `urn:${urn.nid}:${urn.nss.join(delimiter)}`;
  if (query.length > 0) {
    out += `?=${query}`;
  }
  if (resolvers.length > 0) {
    out += `?+${resolvers}`;
  }
  if (urn.fragment.length > 0) {
    out += `#${urn.fragment}`;
  }
  return out;
}
