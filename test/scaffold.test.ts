import { expect } from 'chai';
import { UrnParseError, UrnFormatError } from '../src/index.js';
import { loadParse, loadFormat, loadEquals, loadValidate } from './helpers/conformance.js';

describe('scaffold', () => {
  it('exports typed errors', () => {
    expect(new UrnParseError('bad', 'urn:x')).to.be.instanceOf(Error);
    expect(new UrnParseError('bad', 'urn:x').input).to.equal('urn:x');
    expect(new UrnFormatError('bad')).to.be.instanceOf(Error);
  });

  it('can load every conformance fixture for spec v1.0.0', () => {
    for (const fixture of [loadParse(), loadFormat(), loadEquals(), loadValidate()]) {
      expect(fixture.version).to.equal('1.0.0');
      expect(fixture.cases).to.be.an('array').that.is.not.empty;
    }
  });
});
