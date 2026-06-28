#!/usr/bin/env node
/**
 * Print the CHANGELOG.md section for a given version, for use as GitHub Release
 * notes (the CHANGELOG is the source of truth).
 *
 * Usage: node scripts/extract-changelog.mjs <version>   e.g. 1.2.0 or v1.2.0
 *
 * Matches the conventional-changelog heading shapes:
 *   ## 1.0.0 (2026-06-27)
 *   ## [1.2.0](https://.../compare/v1.1.0...v1.2.0) (2026-09-01)
 * and emits every line up to (not including) the next `## ` version heading.
 * Exits non-zero if the version's section is absent, so a release fails loudly
 * rather than publishing empty notes.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const target = (process.argv[2] ?? '').replace(/^v/, '');
if (!target) {
  console.error('usage: node scripts/extract-changelog.mjs <version>');
  process.exit(2);
}

const changelogPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'CHANGELOG.md');
const lines = readFileSync(changelogPath, 'utf8').split('\n');

// A `## ` version heading, capturing the semver token (bracketed or bare).
const versionHeading = /^##\s+\[?(\d+\.\d+\.\d+[^\]\s)]*)/;

const section = [];
let capturing = false;
for (const line of lines) {
  const heading = line.match(versionHeading);
  if (heading) {
    if (capturing) {
      break; // reached the next version's section
    }
    if (heading[1] === target) {
      capturing = true;
      section.push(line);
    }
  } else if (capturing) {
    section.push(line);
  }
}

if (!capturing) {
  console.error(`no CHANGELOG.md section found for version ${target}`);
  process.exit(1);
}

// Trim leading/trailing blank lines.
while (section.length > 0 && section[0].trim() === '') {
  section.shift();
}
while (section.length > 0 && section[section.length - 1].trim() === '') {
  section.pop();
}

console.log(section.join('\n'));
