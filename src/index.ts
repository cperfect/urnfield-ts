/**
 * `@cperfect/urnfield` — a TypeScript implementation of the `urnfield`
 * specification (v1.0.0). See `submodules/urnfield-spec/SPECIFICATION.md`.
 *
 * The public surface is a set of free functions over a plain {@link ParsedUrn}
 * data model. See the README for the API design decisions.
 */

export * from './types.js';
export * from './errors.js';
export { parse, tryParse } from './parse.js';
