import { expect } from 'chai';
import { parse, validate } from '../src/index.js';
import { loadValidate } from './helpers/conformance.js';

describe('validate (conformance validate.yaml)', () => {
  const fixture = loadValidate();
  for (const testCase of fixture.cases) {
    it(testCase.desc, () => {
      // The fixture schema objects are already in Schema shape (nid + matcher tree).
      // Fail fast on a typo'd schema name so it reads as a fixture-contract error
      // rather than a confusing validate() failure.
      const schema = fixture.schemas[testCase.schema];
      expect(schema, `case references unknown schema "${testCase.schema}"`).to.exist;
      const result = validate(schema, parse(testCase.input));
      expect(result.valid).to.equal(testCase.ok);
    });
  }
});
