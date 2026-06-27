import { expect } from 'chai';
import { parse, equals } from '../src/index.js';
import { loadEquals } from './helpers/conformance.js';

describe('equals (conformance equals.yaml)', () => {
  for (const testCase of loadEquals().cases) {
    it(testCase.desc, () => {
      const result = equals(parse(testCase.a), parse(testCase.b));
      expect(result).to.equal(testCase.equivalent);
      // Equivalence is symmetric.
      expect(equals(parse(testCase.b), parse(testCase.a))).to.equal(testCase.equivalent);
    });
  }
});
