import { expect } from 'chai';
import { parse, tryParse, UrnParseError } from '../src/index.js';
import { loadParse } from './helpers/conformance.js';

describe('parse (conformance parse.yaml)', () => {
  for (const testCase of loadParse().cases) {
    it(testCase.desc, () => {
      if (testCase.ok) {
        // deep.equal compares query/resolvers maps structurally, ignoring key order.
        expect(parse(testCase.input)).to.deep.equal(testCase.expected);
        expect(tryParse(testCase.input)).to.deep.equal(testCase.expected);
      } else {
        expect(() => parse(testCase.input)).to.throw(UrnParseError);
        expect(tryParse(testCase.input)).to.equal(null);
      }
    });
  }
});
