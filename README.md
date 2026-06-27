# `urnfield` — URN fields for structs and function params

A TypeScript implementation of the
[`urnfield` specification v1.0.0](https://github.com/cperfect/urnfield-spec/releases/tag/v1.0.0):
parse, format, validate, and compare URNs (`urn:<NID>:<NSS>[?=query][?+resolvers][#fragment]`) for use
as identifiers in structs, function parameters, and claims.

> The spec is included as a git submodule at `submodules/urnfield-spec`. `urnfield` deliberately
> restricts and in places diverges from [RFC 8141](https://www.rfc-editor.org/rfc/rfc8141) — see the
> [specification](submodules/urnfield-spec/SPECIFICATION.md) for the normative details.

Zero runtime dependencies. ESM only.

## Install

```sh
npm install @cperfect/urnfield
```

## Usage

```ts
import { parse, tryParse, format, equals } from '@cperfect/urnfield';

const urn = parse('urn:ietf:rfc:2648?=foo=bar&quux=wibble#section-3');
urn.nid;      // 'ietf'
urn.nss;      // ['rfc', '2648']
urn.query;    // { foo: ['bar'], quux: ['wibble'] }
urn.fragment; // 'section-3'

format(urn);  // 'urn:ietf:rfc:2648?=foo=bar&quux=wibble#section-3' (query keys sorted)

tryParse('not-a-urn'); // null  (parse() would throw UrnParseError)

// Equivalence: NID case-insensitive, NSS case-sensitive; query/resolvers/fragment/delimiter ignored.
equals(parse('urn:ISBN:045145'), parse('urn:isbn:045145#x')); // true
```

## Schema validation

A schema validates that a URN belongs to a namespace and that its NSS has the expected structure. Build
one from the matcher helpers (or as a plain object) and call `validate`:

```ts
import { parse, validate, schema, exact, regex, glob, oneOfSubschemas } from '@cperfect/urnfield';

// urn:ietf:<sub-namespace>:<identifier>  (the IETF namespace, spec §9.3)
const ietf = schema('ietf', oneOfSubschemas(
  exact('rfc', regex('^[0-9]+$')),       // rfc -> digits
  exact('params', glob('*', [])),        // params -> opaque, arbitrarily deep tail
  regex('^[0-9a-zA-Z-]+$'),              // fallback -> a single element
));

validate(ietf, parse('urn:ietf:rfc:2648')).valid; // true
validate(ietf, parse('urn:ietf:rfc:abc'));         // { valid: false, error: '...' }
```

Matchers (spec §9.2): `exact`, `regex`, `oneOfStrings`, `oneOfSubschemas`, and `glob`. The glob dialect
(spec §10) supports `*`, `**`, `?`, `[a-z]`/`[!..]`, and `{a,b,c}`, with an optional set of separator
characters that `*`/`?` may not cross.

## API

| Export | Signature | Notes |
|--------|-----------|-------|
| `parse` | `(input: string) => ParsedUrn` | Throws `UrnParseError` on invalid input. |
| `tryParse` | `(input: string) => ParsedUrn \| null` | Non-throwing variant. |
| `format` | `(urn: ParsedUrn) => string` | Canonical form; throws `UrnFormatError` if not well-formed. |
| `isWellFormed` | `(urn: ParsedUrn) => boolean` | Non-empty `nid` and `nss`. Never throws. |
| `equals` | `(left: ParsedUrn, right: ParsedUrn) => boolean` | Equivalence per spec §8. |
| `validate` | `(schema: Schema, urn: ParsedUrn) => ValidationResult` | `{ valid, error? }`. Never throws on a "no". |
| `exact`, `regex`, `oneOfStrings`, `oneOfSubschemas`, `glob`, `schema` | matcher/schema builders | Plain-data factories. |
| `matchesGlob`, `compileGlob` | glob helpers | The §10 dialect, standalone. |

Types: `ParsedUrn`, `UrnParams`, `Schema`, `Matcher` (and its variants), `ValidationResult`.

## API design decisions

The spec deliberately leaves the API shape to each implementation. This library makes the following
choices:

- **Free functions over a plain data model, not a class.** The core type is a plain `ParsedUrn`
  interface (`{ nid, nss, nssSlashDelimiter, query, resolvers, fragment }`), and `parse`, `format`,
  `equals`, and `validate` are standalone functions that operate on it. This keeps the model trivially
  serializable, mirrors the way the specification describes operations over a data model, and lets the
  conformance fixtures (which are already this shape) be fed in without adapter code.
- **`parse` throws; `tryParse` does not.** `parse(input)` returns a `ParsedUrn` and throws a typed
  `UrnParseError` when the input does not match the grammar. `tryParse(input)` returns
  `ParsedUrn | null` for callers that prefer to branch on failure rather than catch.
- **`format` throws on a non-well-formed model.** As the inverse of `parse`, `format(urn)` returns the
  canonical string and throws `UrnFormatError` when `urn` is not well-formed (per spec §6).
- **`isWellFormed` and `validate` never throw on a "no" answer.** Spec §7 and §9 require these to report
  failure via their return value, not exceptions: `isWellFormed(urn)` returns a `boolean`, and
  `validate(schema, urn)` returns a result object (`{ valid, error? }`).

## Conformance

This library targets **spec v1.0.0** and is tested directly against the spec's executable contract — the
YAML vectors under `submodules/urnfield-spec/conformance/`. The `test/` suite loads `parse.yaml`,
`format.yaml`, `validate.yaml`, and `equals.yaml` and drives the library against every case. Initialise
the submodule before running the tests:

```sh
git submodule update --init
```

## Development

```sh
npm run tests   # run the Mocha + conformance suite (TypeScript via tsx, no build step)
npm run lint    # eslint over src
npm run build   # compile src -> dist
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow and style, and `src/examples/` for runnable
examples.
