/**
 * The IETF namespace schema from the specification (§9.3), built with the
 * fluent matcher helpers, and used to validate a handful of URNs.
 *
 * Run with: `npx tsx src/examples/ietf-schema.ts`
 */
import { parse, validate, schema, exact, regex, glob, oneOfSubschemas } from '../index.js';

// urn:ietf:<sub-namespace>:<identifier>
//   rfc/fyi/std/bcp -> a number
//   id/mtg          -> an alphanumeric token
//   params          -> an opaque, arbitrarily deep tail (glob)
//   (fallback)      -> a single unregistered alphanumeric element
const ietf = schema(
  'ietf',
  oneOfSubschemas(
    exact('rfc', regex('^[0-9]+$')),
    exact('fyi', regex('^[0-9]+$')),
    exact('std', regex('^[0-9]+$')),
    exact('bcp', regex('^[0-9]+$')),
    exact('id', regex('^[0-9a-zA-Z-]+$')),
    exact('mtg', regex('^[0-9a-zA-Z-]+$')),
    exact('params', glob('*', [])),
    regex('^[0-9a-zA-Z-]+$'),
  ),
);

const inputs = [
  'urn:ietf:rfc:2648', // valid: rfc + digits
  'urn:ietf:params:xml:ns:allocationToken-1.0', // valid: opaque params tail
  'urn:ietf:any-string123', // valid: fallback single element
  'urn:ietf:rfc:abc', // invalid: rfc identifier is not digits
  'urn:isbn:123', // invalid: wrong NID
];

for (const input of inputs) {
  const result = validate(ietf, parse(input));
  console.log(`${result.valid ? 'OK  ' : 'FAIL'}  ${input}${result.error ? `  (${result.error})` : ''}`);
}
