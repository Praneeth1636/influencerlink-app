// Embedder abstraction. Same lazy-client pattern as storage/r2 and email/resend:
// the active provider is decided on first use based on env vars, and a free
// deterministic local provider is the always-available fallback. This means:
//
//   * Tests, dev, and CI run end-to-end without any API spend.
//   * Switching to a paid provider (Voyage / OpenAI) is one env var.
//   * The embedding interface is identical regardless of provider, so the
//     rest of the app never branches on which one is active.

export const EMBEDDING_DIMENSIONS = 1536;

export type EmbedRequest = {
  text: string;
  // Used as the audit-log "model" column on the embeddings row. Stable
  // identifiers let us rebuild embeddings when we change providers.
  purpose: "creator-profile" | "job-brief" | "search-query";
};

export interface Embedder {
  /** Stable identifier stored on the embeddings row. */
  readonly model: string;
  embed(input: EmbedRequest): Promise<number[]>;
}

// ---------------------------------------------------------------------------
// Local deterministic embedder
// ---------------------------------------------------------------------------
// Hash-based bag-of-tokens projection into a fixed-size vector. Identical text
// produces an identical vector, similar text produces similar vectors —
// enough to demo the full pipeline (pgvector queries, match-score ranking,
// UI plumbing) without any API spend. Not semantic in the LLM sense; replace
// with a paid provider before launch.

class LocalDeterministicEmbedder implements Embedder {
  readonly model = "local-hash-1536";

  async embed(input: EmbedRequest): Promise<number[]> {
    return Promise.resolve(hashToVector(input.text, EMBEDDING_DIMENSIONS));
  }
}

function hashToVector(text: string, dimensions: number): number[] {
  const tokens = tokenise(text);
  const vector = new Float64Array(dimensions);

  for (const token of tokens) {
    const a = stringHash(token, 0x9e3779b1) >>> 0;
    const b = stringHash(token, 0x85ebca6b) >>> 0;
    // Two hashes per token: one for the index, one for the sign. Cheap
    // approximation of feature hashing (Weinberger et al.).
    const idx = a % dimensions;
    const sign = (b & 1) === 0 ? 1 : -1;
    vector[idx] += sign;
  }

  // L2-normalise so cosine similarity == dot product. Required for pgvector's
  // <=> operator to behave as cosine distance regardless of token count.
  let sumSquares = 0;
  for (let i = 0; i < dimensions; i++) sumSquares += vector[i] * vector[i];
  const norm = Math.sqrt(sumSquares) || 1;
  const out: number[] = new Array(dimensions);
  for (let i = 0; i < dimensions; i++) out[i] = vector[i] / norm;
  return out;
}

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function stringHash(value: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < value.length; i++) {
    h = Math.imul(h ^ value.charCodeAt(i), 2654435761);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Remote provider stubs
// ---------------------------------------------------------------------------
// Real providers (Voyage, OpenAI) plug in here. They share the LocalDeterministic
// fallback when their API key is missing — we deliberately don't throw, because
// "no API key" is the expected dev/test state.

class VoyageEmbedder implements Embedder {
  readonly model = "voyage-3";
  // Stub. Wire fetch -> https://api.voyageai.com/v1/embeddings when key arrives.
  async embed(input: EmbedRequest): Promise<number[]> {
    void input;
    throw new Error("VoyageEmbedder not implemented yet — set USE_LOCAL_EMBEDDER=true or remove VOYAGE_API_KEY");
  }
}

class OpenAIEmbedder implements Embedder {
  readonly model = "openai-text-embedding-3-small";
  // Stub. Wire fetch -> https://api.openai.com/v1/embeddings when key arrives.
  async embed(input: EmbedRequest): Promise<number[]> {
    void input;
    throw new Error("OpenAIEmbedder not implemented yet — set USE_LOCAL_EMBEDDER=true or remove OPENAI_API_KEY");
  }
}

// ---------------------------------------------------------------------------
// Provider resolution
// ---------------------------------------------------------------------------

let cached: Embedder | null = null;

export function getEmbedder(): Embedder {
  if (cached) return cached;

  // Explicit override always wins. Useful for tests and for "I have a key but
  // I don't want to spend right now."
  if (process.env.USE_LOCAL_EMBEDDER === "true") {
    cached = new LocalDeterministicEmbedder();
    return cached;
  }

  if (process.env.VOYAGE_API_KEY) {
    cached = new VoyageEmbedder();
    return cached;
  }

  if (process.env.OPENAI_API_KEY) {
    cached = new OpenAIEmbedder();
    return cached;
  }

  cached = new LocalDeterministicEmbedder();
  return cached;
}

// Test seam.
export function _resetForTests() {
  cached = null;
}

// Build the canonical text representation that gets embedded for each entity.
// Centralising this means a profile change can trigger a re-embed by just
// rebuilding this string and comparing.
export function buildCreatorEmbeddingText(creator: {
  displayName: string;
  handle: string;
  headline: string | null;
  bio: string | null;
  niches: string[];
  location: string | null;
}): string {
  return [
    creator.displayName,
    creator.handle,
    creator.headline ?? "",
    creator.bio ?? "",
    creator.location ?? "",
    creator.niches.join(" ")
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildJobEmbeddingText(job: {
  title: string;
  description: string;
  niches: string[];
  location: string | null;
}): string {
  return [job.title, job.description, job.niches.join(" "), job.location ?? ""].filter(Boolean).join("\n");
}
