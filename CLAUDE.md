# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@cperfect/urnfield` is the **TypeScript implementation** of the `urnfield` specification — a library
for parsing, formatting, validating, and comparing URNs (`urn:<NID>:<NSS>[?=query][?+resolvers][#fragment]`)
for use as identifiers in structs, function params, and claims. `urnfield` deliberately restricts and
diverges from RFC 8141 (e.g. `?=` query comes before `?+` resolvers; `key=a=b` drops the value).

The public surface is a set of **free functions over a plain `ParsedUrn` data model** (not a class), and
`parse`/`format` throw typed errors while `isWellFormed`/`validate` report failure via their return value
(see the README "API design decisions"). Zero runtime dependencies; ESM only.

## Module map (`src/`)

Each module maps to one spec section, and `src/index.ts` re-exports the public API.

- `types.ts` — `ParsedUrn`, `Schema`/`Matcher` variants, `ValidationResult` (§3, §9).
- `errors.ts` — `UrnParseError`, `UrnFormatError` (the only things that throw).
- `grammar.ts` — the single anchored URN regex + raw component capture (§4).
- `parse.ts` — `parse` (throws) / `tryParse` (null): NSS delimiter choice, `?=`/`?+` accumulation (§5).
- `wellformed.ts` — `isWellFormed` (§7); `format.ts` — `format` + key sorting (§6).
- `equals.ts` — `equals` (§8).
- `glob.ts` — the pinned glob dialect compiled to an anchored `RegExp` (§10).
- `schema.ts` — the matcher continuation-chain engine + `validate` + builders (`exact`, `regex`,
  `oneOfStrings`, `oneOfSubschemas`, `glob`, `schema`) (§9).

Tests live in `test/`: one `*.test.ts` per conformance file (driven by `test/helpers/conformance.ts`,
which loads the submodule YAML), plus `unit.test.ts` for behaviour the fixtures don't pin (error
contracts, round-trips, glob operators). Runnable examples are in `src/examples/` (excluded from build).

## The spec is the source of truth

The normative spec lives as a git submodule at `submodules/urnfield-spec/` — clone with
`git submodule update --init` if it's empty.

- `submodules/urnfield-spec/SPECIFICATION.md` — the technology-agnostic normative spec.
  Sections: §3 data model, §4 lexical grammar, §5 parsing, §6 canonical formatting, §7 well-formedness,
  §8 equivalence, §9 NSS schema validation, §10 glob dialect, §11 conformance.
- `submodules/urnfield-spec/conformance/*.yaml` — the **executable contract**. These language-agnostic
  YAML vectors (`parse`, `format`, `validate`, `equals`) define correct behaviour; `schema.yaml` is the
  JSON Schema for the fixtures themselves. The implementation is conformant when it passes all vectors.

When implementing or changing behaviour, consult the relevant spec section AND the matching conformance
file. A conformance test runner that loads these YAML fixtures and drives the library should be one of
the core test suites (see `conformance/README.md` "Writing a runner"). Do not edit the submodule's
fixtures to make tests pass — they are the contract; the implementation must match them.

## Commands

- `npm run tests` — run the Mocha test suite (note: the script is `tests`, not `test`; runs `test/**/*.ts`
  via tsx, so tests are written in TypeScript and run without a build step).
- `npm run build` — `rm -rf dist && tsc`, compiling `src/` to `dist/`.
- `npm run lint` / `npm run lint:fix` — ESLint over `src/`.

Run a single test with Mocha's grep:
`node --import ./node_modules/tsx/dist/esm/index.mjs node_modules/.bin/mocha 'test/**/*.ts' --grep "pattern"`

## Build / module setup

- ESM-only (`"type": "module"`, `module`/`moduleResolution`: `NodeNext`). Use `.js` extensions in relative
  imports as NodeNext requires.
- `tsconfig.json` compiles `src/` → `dist/` with `strict: true` and emits declarations. `src/examples` is
  excluded from the build. `README.md` is included in `include` (doc-tested via TS).
- The published package exposes `dist/index.js` (`main`/`exports`), so `src/index.ts` is the entry point.

## Conventions (from CONTRIBUTING.md)

- Trunk-based development: branch off `main`, open a PR. Use [Conventional Commits](https://www.conventionalcommits.org/).
- AI-generated commits must add the `ai/model/version` as a `Co-Authored-By` trailer.
- Code style: [node style guide](https://github.com/felixge/node-style-guide) but max line length **120**.
  ESLint enforces `eqeqeq`, 2-space indent, unix linebreaks, no trailing spaces, `id-length` min 2
  (except `i`/`j`/`k`/`_`), and max nesting/callbacks of 3.
- JSDoc on all exported module members. Add inline comments for non-obvious choices, explaining *why*.
- Tests must accompany code changes and pass in CI.
