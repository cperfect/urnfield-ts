/**
 * Typed errors thrown by the `urnfield` library.
 *
 * Only operations that the specification describes as "failing with an error"
 * throw: {@link parse} and {@link format}. Well-formedness checks and schema
 * validation report failure via their return value instead (spec §7, §9).
 */

/** Thrown by {@link parse} when an input string does not match the URN grammar (spec §4–§5). */
export class UrnParseError extends Error {
  /** The input string that failed to parse. */
  readonly input: string;

  constructor(message: string, input: string) {
    super(message);
    this.name = 'UrnParseError';
    this.input = input;
  }
}

/** Thrown by {@link format} when given a parsed URN that is not well-formed (spec §6–§7). */
export class UrnFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrnFormatError';
  }
}
