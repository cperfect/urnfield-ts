/**
 * The library's stated purpose: using a URN as a validated identifier field in
 * a struct / function parameter.
 *
 * Here a `Document` carries an `asset` URN of the form `urn:asset:<kind>:<id>`,
 * where `kind` is one of a fixed set and `id` is a UUID-ish token. The factory
 * rejects anything that does not parse or does not match the namespace schema,
 * so the rest of the program can treat `Document.asset` as trustworthy.
 *
 * Run with: `npx tsx src/examples/struct-field.ts`
 */
import { parse, format, validate, schema, oneOfStrings, regex, type ParsedUrn } from '../index.js';

const TOKEN = '^[0-9a-fA-F-]{6,}$';

// urn:asset:{image|video|doc}:<token>
const assetSchema = schema(
  'asset',
  oneOfStrings({
    image: regex(TOKEN),
    video: regex(TOKEN),
    doc: regex(TOKEN),
  }),
);

interface Document {
  title: string;
  asset: ParsedUrn; // an identifier field, guaranteed valid by construction
}

/** Build a Document, throwing if the asset URN is missing or off-schema. */
function makeDocument(title: string, assetUrn: string): Document {
  const asset = parse(assetUrn); // throws UrnParseError if not a URN at all
  const result = validate(assetSchema, asset);
  if (!result.valid) {
    throw new Error(`invalid asset URN ${assetUrn}: ${result.error}`);
  }
  return { title, asset };
}

const doc = makeDocument('Q3 report', 'urn:asset:doc:9c3a11d9-9669');
console.log('title:', doc.title);
console.log('asset kind:', doc.asset.nss[0]); // 'doc'
console.log('asset canonical:', format(doc.asset)); // 'urn:asset:doc:9c3a11d9-9669'

try {
  makeDocument('bad', 'urn:asset:audio:123'); // 'audio' is not an allowed kind
} catch (err) {
  console.log('rejected:', (err as Error).message);
}
