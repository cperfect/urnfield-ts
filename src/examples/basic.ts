/**
 * Basic usage: parse a URN, inspect the model, format it back, and compare two
 * URNs for equivalence.
 *
 * Run with: `npx tsx src/examples/basic.ts`
 */
import { parse, tryParse, format, equals } from '../index.js';

// Parse a URN string into the plain data model.
const urn = parse('urn:ietf:rfc:2648?=foo=bar&quux=wibble#section-3');
console.log('nid:     ', urn.nid); // 'ietf'
console.log('nss:     ', urn.nss); // ['rfc', '2648']
console.log('query:   ', urn.query); // { foo: ['bar'], quux: ['wibble'] }
console.log('fragment:', urn.fragment); // 'section-3'

// Format the model back to its canonical string (query keys sorted).
console.log('canonical:', format(urn));

// tryParse returns null instead of throwing on invalid input.
console.log('tryParse bad:', tryParse('not-a-urn')); // null

// Equivalence ignores case of the NID and ignores query/resolvers/fragment.
console.log('equivalent:', equals(parse('urn:ISBN:045145'), parse('urn:isbn:045145#x'))); // true
console.log('different: ', equals(parse('urn:isbn:1'), parse('urn:isbn:2'))); // false
