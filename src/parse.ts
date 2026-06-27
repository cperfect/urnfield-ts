/**
 * Parsing a URN string into the {@link ParsedUrn} data model (spec §5).
 */
import type { ParsedUrn, UrnParams } from './types.js';
import { UrnParseError } from './errors.js';
import { matchUrn } from './grammar.js';

/**
 * Split the NSS into elements, choosing a single delimiter (spec §5 step 3):
 * `:` wins if present, otherwise `/`, otherwise the whole NSS is one element.
 * Only one delimiter is honoured; the other remains inside elements.
 */
function splitNss(nss: string): Pick<ParsedUrn, 'nss' | 'nssSlashDelimiter'> {
  if (nss.includes(':')) {
    return { nss: nss.split(':'), nssSlashDelimiter: false };
  }
  if (nss.includes('/')) {
    return { nss: nss.split('/'), nssSlashDelimiter: true };
  }
  return { nss: [nss], nssSlashDelimiter: false };
}

/**
 * Parse a `?=` / `?+` component body: an `&`-separated list of items (spec §5
 * step 4). A bare key records an empty value list (without overwriting an
 * existing one); `key=value` appends the value; any text after a second `=` in
 * an item is discarded; repeated keys accumulate their values in order.
 */
function parseParams(body: string): UrnParams {
  const params: UrnParams = {};
  for (const item of body.split('&')) {
    const eq = item.indexOf('=');
    if (eq === -1) {
      if (!(item in params)) {
        params[item] = [];
      }
      continue;
    }
    const key = item.slice(0, eq);
    const rest = item.slice(eq + 1);
    const secondEq = rest.indexOf('=');
    const value = secondEq === -1 ? rest : rest.slice(0, secondEq);
    (params[key] ??= []).push(value);
  }
  return params;
}

/**
 * Parse a URN string into a {@link ParsedUrn}, or return `null` if the input
 * does not match the grammar (spec §4–§5). Never throws.
 */
export function tryParse(input: string): ParsedUrn | null {
  const comps = matchUrn(input);
  if (comps === null) {
    return null;
  }
  return {
    nid: comps.nid,
    ...splitNss(comps.nss),
    query: comps.query === undefined ? {} : parseParams(comps.query),
    resolvers: comps.resolvers === undefined ? {} : parseParams(comps.resolvers),
    fragment: comps.fragment ?? '',
  };
}

/**
 * Parse a URN string into a {@link ParsedUrn}, throwing {@link UrnParseError}
 * if the input does not match the grammar (spec §4–§5).
 */
export function parse(input: string): ParsedUrn {
  const result = tryParse(input);
  if (result === null) {
    throw new UrnParseError(`not a valid URN: ${JSON.stringify(input)}`, input);
  }
  return result;
}
