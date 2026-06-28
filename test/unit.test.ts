/**
 * Unit tests for behaviour the conformance fixtures do not pin: error types and
 * messages, the tryParse null path, round-trip properties, the glob dialect
 * operators, and the schema builders.
 */
import { expect } from 'chai';
import {
  parse,
  tryParse,
  format,
  equals,
  isWellFormed,
  validate,
  matchesGlob,
  exact,
  regex,
  glob,
  oneOfStrings,
  oneOfSubschemas,
  schema,
  UrnParseError,
  UrnFormatError,
  type ParsedUrn,
} from '../src/index.js';

describe('parse / tryParse error handling', () => {
  it('parse throws a typed UrnParseError carrying the input', () => {
    let thrown: unknown;
    try {
      parse('not-a-urn');
    } catch (err) {
      thrown = err;
    }
    expect(thrown).to.be.instanceOf(UrnParseError);
    expect((thrown as UrnParseError).input).to.equal('not-a-urn');
    expect((thrown as UrnParseError).name).to.equal('UrnParseError');
    expect((thrown as Error).message).to.contain('not-a-urn');
  });

  it('tryParse returns null instead of throwing', () => {
    expect(tryParse('not-a-urn')).to.equal(null);
    expect(tryParse('urn:isbn')).to.equal(null);
    expect(tryParse('urn:isbn:0451450523')).to.not.equal(null);
  });

  it('rejects empty query/resolver items and empty keys', () => {
    expect(tryParse('urn:example:x?=&&foo')).to.equal(null); // empty items
    expect(tryParse('urn:example:x?==bar')).to.equal(null); // empty key
    expect(tryParse('urn:example:x?=foo&')).to.equal(null); // trailing &
    expect(tryParse('urn:example:x?=&foo')).to.equal(null); // leading &
    expect(tryParse('urn:example:x?+=bar')).to.equal(null); // empty key in resolvers
    expect(() => parse('urn:example:x?=&&foo')).to.throw(UrnParseError);
    // a non-empty value with an empty-looking tail is still fine
    expect(tryParse('urn:example:x?=foo=&bar')).to.not.equal(null); // foo -> [''], bar bare
  });
});

describe('isWellFormed', () => {
  const base: ParsedUrn = {
    nid: 'isbn',
    nss: ['x'],
    nssSlashDelimiter: false,
    query: {},
    resolvers: {},
    fragment: '',
  };

  it('is true for a non-empty nid and nss', () => {
    expect(isWellFormed(base)).to.equal(true);
  });

  it('is false (never throws) for empty nss or empty nid', () => {
    expect(isWellFormed({ ...base, nss: [] })).to.equal(false);
    expect(isWellFormed({ ...base, nid: '' })).to.equal(false);
  });

  it('is false (never throws) for null/undefined/non-object inputs', () => {
    const bad = (value: unknown): (() => boolean) => () => isWellFormed(value as ParsedUrn);
    for (const value of [null, undefined, 'urn:x:y', 42]) {
      expect(bad(value)).to.not.throw();
      expect(isWellFormed(value as unknown as ParsedUrn)).to.equal(false);
    }
    // format() therefore reports UrnFormatError (not a raw TypeError) for these.
    expect(() => format(null as unknown as ParsedUrn)).to.throw(UrnFormatError);
  });
});

describe('format error handling', () => {
  const base: ParsedUrn = {
    nid: 'isbn',
    nss: ['x'],
    nssSlashDelimiter: false,
    query: {},
    resolvers: {},
    fragment: '',
  };

  it('throws UrnFormatError on a non-well-formed model', () => {
    expect(() => format({ ...base, nss: [] })).to.throw(UrnFormatError);
    expect(() => format({ ...base, nid: '' })).to.throw(UrnFormatError);
  });

  it('rejects NSS elements that would not round-trip', () => {
    // element carrying the active delimiter -> would be re-split
    expect(() => format({ ...base, nss: ['a:b'] })).to.throw(UrnFormatError);
    expect(() => format({ ...base, nss: ['a', 'b'], nssSlashDelimiter: true })).to.not.throw();
    // slash-delimited element carrying ':' -> a re-parse prefers ':'
    expect(() => format({ ...base, nss: ['a', 'b:c'], nssSlashDelimiter: true })).to.throw(UrnFormatError);
    // lone ':'-delimited element carrying '/' -> a re-parse would split on '/'
    expect(() => format({ ...base, nss: ['a/b'] })).to.throw(UrnFormatError);
    // but '/' inside a multi-element ':'-delimited NSS is preserved and round-trips
    const okWithInnerSlash: ParsedUrn = { ...base, nss: ['a', 'b/c'] };
    expect(format(okWithInnerSlash)).to.equal('urn:isbn:a:b/c');
    expect(parse(format(okWithInnerSlash))).to.deep.equal(okWithInnerSlash);
  });

  it('rejects malformed component shapes as UrnFormatError (not TypeError)', () => {
    const bad = (over: Partial<Record<string, unknown>>): (() => string) =>
      () => format({ ...base, ...over } as unknown as ParsedUrn);
    expect(bad({ query: undefined })).to.throw(UrnFormatError);
    expect(bad({ query: null })).to.throw(UrnFormatError);
    expect(bad({ resolvers: 'nope' })).to.throw(UrnFormatError);
    expect(bad({ query: { k: 'not-an-array' } })).to.throw(UrnFormatError);
    expect(bad({ query: { k: [42] } })).to.throw(UrnFormatError);
    expect(bad({ fragment: 123 })).to.throw(UrnFormatError);
    expect(bad({ nss: ['ok', 7] })).to.throw(UrnFormatError);
  });

  it('rejects components that cannot be losslessly encoded', () => {
    // nid / nss / fragment with characters outside the grammar
    expect(() => format({ ...base, nid: 'a b' })).to.throw(UrnFormatError);
    expect(() => format({ ...base, nid: 'a:b' })).to.throw(UrnFormatError);
    expect(() => format({ ...base, nss: ['a?b'] })).to.throw(UrnFormatError);
    expect(() => format({ ...base, fragment: 'a b' })).to.throw(UrnFormatError);
    expect(() => format({ ...base, fragment: 'a#b' })).to.throw(UrnFormatError);
    // query key/value with the structural '=' or '&' that parse would mis-split
    expect(() => format({ ...base, query: { 'a&b': [] } })).to.throw(UrnFormatError);
    expect(() => format({ ...base, query: { 'a=b': [] } })).to.throw(UrnFormatError);
    expect(() => format({ ...base, query: { k: ['a&b'] } })).to.throw(UrnFormatError);
    expect(() => format({ ...base, query: { k: ['a=b'] } })).to.throw(UrnFormatError);
    // an nss that renders to an empty string
    expect(() => format({ ...base, nss: [''] })).to.throw(UrnFormatError);
  });

  it('still formats (and round-trips) genuinely encodable components', () => {
    const ok: ParsedUrn = {
      ...base,
      nid: 'x-test',
      nss: ['a.b', 'c-d'],
      query: { 'foo-bar_*': ['v*'], bare: [] },
      fragment: 'sec/3(a)',
    };
    expect(() => format(ok)).to.not.throw();
    expect(parse(format(ok))).to.deep.equal(ok);
  });
});

describe('round-trip properties', () => {
  const canonical = [
    'urn:isbn:0451450523',
    'urn:ietf:rfc:2648',
    'urn:lex:eu/council/directive',
    'urn:ietf:rfc:2648?=foo=bar&quux=wibble?+niii&sparrow=african#some/fragment()',
  ];

  for (const input of canonical) {
    it(`format(parse(${input})) === input`, () => {
      expect(format(parse(input))).to.equal(input);
    });
  }

  it('parse(format(u)) deep-equals u (keys sorted on format, order-insensitive)', () => {
    const model: ParsedUrn = {
      nid: 'ietf',
      nss: ['rfc', '2648'],
      nssSlashDelimiter: false,
      query: { quux: [], foo: ['bar', 'zoing'] },
      resolvers: {},
      fragment: '',
    };
    expect(format(model)).to.equal('urn:ietf:rfc:2648?=foo=bar&foo=zoing&quux');
    expect(parse(format(model))).to.deep.equal(model);
  });
});

describe('equals reflexivity', () => {
  it('a URN equals itself', () => {
    const urn = parse('urn:ietf:rfc:2648?=x=y#frag');
    expect(equals(urn, urn)).to.equal(true);
  });
});

describe('glob dialect operators', () => {
  it('* spans everything when no separators are configured', () => {
    expect(matchesGlob('*', [], 'a:b:c')).to.equal(true);
  });

  it('* does not cross a configured separator, ** does', () => {
    expect(matchesGlob('*', [':'], 'a:b')).to.equal(false);
    expect(matchesGlob('**', [':'], 'a:b')).to.equal(true);
  });

  it('? matches a single non-separator character', () => {
    expect(matchesGlob('a?c', [], 'abc')).to.equal(true);
    expect(matchesGlob('a?c', [], 'ac')).to.equal(false);
    expect(matchesGlob('?', [':'], ':')).to.equal(false);
  });

  it('[a-z] character ranges and [!..] negation', () => {
    expect(matchesGlob('[a-z]', [], 'm')).to.equal(true);
    expect(matchesGlob('[a-z]', [], '1')).to.equal(false);
    expect(matchesGlob('[!a]', [], 'b')).to.equal(true);
    expect(matchesGlob('[!a]', [], 'a')).to.equal(false);
  });

  it('treats ^ inside a class as a literal, not a negation marker', () => {
    // [^a] is the set { '^', 'a' }, not "anything but a".
    expect(matchesGlob('[^a]', [], '^')).to.equal(true);
    expect(matchesGlob('[^a]', [], 'a')).to.equal(true);
    expect(matchesGlob('[^a]', [], 'b')).to.equal(false);
    // negation via ! still excludes a literal ^ when listed
    expect(matchesGlob('[!^]', [], 'x')).to.equal(true);
    expect(matchesGlob('[!^]', [], '^')).to.equal(false);
  });

  it('{a,b,c} alternation', () => {
    expect(matchesGlob('{foo,bar}.zip', ['/'], 'bar.zip')).to.equal(true);
    expect(matchesGlob('{foo,bar}.zip', ['/'], 'baz.zip')).to.equal(false);
  });

  it('matches the whole tail (anchored)', () => {
    expect(matchesGlob('abc', [], 'abcd')).to.equal(false);
  });
});

describe('schema builders', () => {
  // The IETF namespace from spec §9.3, built with the fluent helpers.
  const ietf = schema(
    'ietf',
    oneOfSubschemas(
      exact('rfc', regex('^[0-9]+$')),
      exact('params', glob('*', [])),
      regex('^[0-9a-zA-Z-]+$'),
    ),
  );

  it('validates via a builder-constructed schema', () => {
    expect(validate(ietf, parse('urn:ietf:rfc:2648')).valid).to.equal(true);
    expect(validate(ietf, parse('urn:ietf:params:xml:ns:allocationToken-1.0')).valid).to.equal(true);
    expect(validate(ietf, parse('urn:ietf:any-string123')).valid).to.equal(true);
  });

  it('reports a descriptive error (never throws) on failure', () => {
    const result = validate(ietf, parse('urn:ietf:rfc:abc'));
    expect(result.valid).to.equal(false);
    expect(result.error).to.be.a('string').that.is.not.empty;
  });

  it('returns invalid (never throws) for a malformed regex pattern', () => {
    const sch = schema('x', regex('([')); // unbalanced group -> RegExp would throw
    let result: ReturnType<typeof validate> | undefined;
    expect(() => {
      result = validate(sch, parse('urn:x:anything'));
    }).to.not.throw();
    expect(result?.valid).to.equal(false);
    expect(result?.error).to.contain('invalid regex pattern');
  });

  it('returns invalid (never throws) for a malformed glob pattern', () => {
    const sch = schema('x', glob('[z-a]', [])); // out-of-order range -> RegExp would throw
    let result: ReturnType<typeof validate> | undefined;
    expect(() => {
      result = validate(sch, parse('urn:x:anything'));
    }).to.not.throw();
    expect(result?.valid).to.equal(false);
    expect(result?.error).to.contain('invalid glob pattern');
  });

  it('oneOfStrings selects the continuation by element', () => {
    const sch = schema('x', oneOfStrings({ foo: regex('^[0-9]+$'), bar: null }));
    expect(validate(sch, parse('urn:x:foo:123')).valid).to.equal(true);
    expect(validate(sch, parse('urn:x:bar')).valid).to.equal(true);
    expect(validate(sch, parse('urn:x:bar:extra')).valid).to.equal(false);
    expect(validate(sch, parse('urn:x:nope')).valid).to.equal(false);
  });
});
