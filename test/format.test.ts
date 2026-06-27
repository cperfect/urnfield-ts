import { expect } from 'chai';
import { format, UrnFormatError } from '../src/index.js';
import { loadFormat } from './helpers/conformance.js';

describe('format (conformance format.yaml)', () => {
  for (const testCase of loadFormat().cases) {
    it(testCase.desc, () => {
      if (testCase.ok) {
        expect(format(testCase.input)).to.equal(testCase.expected);
      } else {
        expect(() => format(testCase.input)).to.throw(UrnFormatError);
      }
    });
  }
});
