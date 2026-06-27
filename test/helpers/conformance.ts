/**
 * Loads the spec's conformance fixtures (the executable contract) from the
 * `urnfield-spec` submodule. Each phase's test file drives the library against
 * the relevant fixture so we assert behaviour against the spec's own vectors.
 *
 * See `submodules/urnfield-spec/conformance/README.md` for the fixture format.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load as loadYaml } from 'js-yaml';
import type { ParsedUrn, Matcher, ValidationResult } from '../../src/index.js';

const CONFORMANCE_DIR = resolve(process.cwd(), 'submodules/urnfield-spec/conformance');

/** A `{ version, kind, description, cases }` fixture file. */
export interface Fixture<Case> {
  version: string;
  kind: string;
  description: string;
  cases: Case[];
}

export interface ParseCase {
  desc: string;
  input: string;
  ok: boolean;
  expected?: ParsedUrn;
}

export interface FormatCase {
  desc: string;
  input: ParsedUrn;
  ok: boolean;
  expected?: string;
}

export interface EqualsCase {
  desc: string;
  a: string;
  b: string;
  equivalent: boolean;
}

export interface ValidateCase {
  desc: string;
  schema: string;
  input: string;
  ok: boolean;
}

/** A schema as it appears in `validate.yaml`'s `schemas` map. */
export interface SchemaFixture {
  nid: string;
  nss: Matcher;
}

export interface ValidateFixture extends Fixture<ValidateCase> {
  schemas: Record<string, SchemaFixture>;
}

function load<T>(file: string): T {
  return loadYaml(readFileSync(resolve(CONFORMANCE_DIR, file), 'utf8')) as T;
}

export const loadParse = (): Fixture<ParseCase> => load('parse.yaml');
export const loadFormat = (): Fixture<FormatCase> => load('format.yaml');
export const loadEquals = (): Fixture<EqualsCase> => load('equals.yaml');
export const loadValidate = (): ValidateFixture => load('validate.yaml');

// Re-exported so phase test files share a single import site.
export type { ValidationResult };
