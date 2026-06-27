# `urnfield` is a typescript library for using URN fields in structs or function params

This is the Typescript implementation of the [`urnfield` specification v1.0.0](https://github.com/cperfect/urnfield-spec/releases/tag/v1.0.0).

> The spec is included as a submodule at `submodules/urnfield-spec`

## API design decisions

The spec ([§9](submodules/urnfield-spec/SPECIFICATION.md)) deliberately leaves the API shape to each
implementation. This library makes the following choices:

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