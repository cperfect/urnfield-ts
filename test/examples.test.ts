/**
 * Runs each example under `src/examples/` as a child process (the way a user
 * would, via tsx) and asserts its output, so the examples stay correct as the
 * API evolves. A non-zero exit makes execFileSync throw and fails the test.
 */
import { expect } from 'chai';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TSX = resolve(ROOT, 'node_modules/tsx/dist/esm/index.mjs');

// Bound each spawned example independently; execFileSync blocks the event loop,
// so Mocha's own timeout can't interrupt a hung process. Kept under the suite
// timeout below so a stuck example is killed (throwing) rather than stalling.
const EXAMPLE_TIMEOUT_MS = 20_000;

function runExample(name: string): string {
  return execFileSync(process.execPath, ['--import', TSX, resolve(ROOT, 'src/examples', name)], {
    encoding: 'utf8',
    timeout: EXAMPLE_TIMEOUT_MS,
  });
}

describe('examples', function () {
  // Each case spawns node + tsx, so allow generous startup time.
  this.timeout(30000);

  it('basic.ts prints parsed fields, the canonical form, and equality results', () => {
    const out = runExample('basic.ts');
    expect(out).to.contain('canonical: urn:ietf:rfc:2648?=foo=bar&quux=wibble#section-3');
    expect(out).to.contain('tryParse bad: null');
    expect(out).to.contain('equivalent: true');
    expect(out).to.contain('different:  false');
  });

  it('ietf-schema.ts validates the documented URNs (and rejects the bad ones)', () => {
    const out = runExample('ietf-schema.ts');
    expect(out).to.contain('OK    urn:ietf:rfc:2648');
    expect(out).to.contain('OK    urn:ietf:params:xml:ns:allocationToken-1.0');
    expect(out).to.contain('OK    urn:ietf:any-string123');
    expect(out).to.contain('FAIL  urn:ietf:rfc:abc');
    expect(out).to.contain('FAIL  urn:isbn:123');
  });

  it('struct-field.ts builds a valid Document and rejects an off-schema asset', () => {
    const out = runExample('struct-field.ts');
    expect(out).to.contain('asset kind: doc');
    expect(out).to.contain('asset canonical: urn:asset:doc:9c3a11d9-9669');
    expect(out).to.contain('rejected: invalid asset URN urn:asset:audio:123');
  });
});
