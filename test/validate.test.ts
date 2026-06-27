import { expect } from 'chai';
import { parse, validate } from '../src/index.js';
import { loadValidate } from './helpers/conformance.js';

describe('validate (conformance validate.yaml)', () => {
  const fixture = loadValidate();
  for (const testCase of fixture.cases) {
    it(testCase.desc, () => {
      // The fixture schema objects are already in Schema shape (nid + matcher tree).
      const schema = fixture.schemas[testCase.schema];
      const result = validate(schema, parse(testCase.input));
      expect(result.valid).to.equal(testCase.ok);
    });
  }
});
