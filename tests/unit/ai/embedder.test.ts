import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildCreatorEmbeddingText,
  buildJobEmbeddingText,
  EMBEDDING_DIMENSIONS,
  getEmbedder,
  _resetForTests
} from "@/lib/ai/embedder";

describe("LocalDeterministicEmbedder", () => {
  beforeEach(() => {
    process.env.USE_LOCAL_EMBEDDER = "true";
    _resetForTests();
  });

  afterEach(() => {
    delete process.env.USE_LOCAL_EMBEDDER;
    _resetForTests();
  });

  it("emits a unit-norm vector of the expected dimensionality", async () => {
    const embedder = getEmbedder();
    const vec = await embedder.embed({ text: "Beauty creator with skincare focus", purpose: "creator-profile" });
    expect(vec).toHaveLength(EMBEDDING_DIMENSIONS);

    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    expect(norm).toBeGreaterThan(0.99);
    expect(norm).toBeLessThan(1.01);
  });

  it("is deterministic — identical text produces identical vectors", async () => {
    const embedder = getEmbedder();
    const a = await embedder.embed({ text: "Hello world", purpose: "creator-profile" });
    const b = await embedder.embed({ text: "Hello world", purpose: "creator-profile" });
    expect(a).toEqual(b);
  });

  it("similar text has higher cosine similarity than unrelated text", async () => {
    const embedder = getEmbedder();
    const a = await embedder.embed({
      text: "skincare beauty serum routine acne",
      purpose: "creator-profile"
    });
    const b = await embedder.embed({
      text: "skincare beauty serum dewy glow",
      purpose: "creator-profile"
    });
    const c = await embedder.embed({
      text: "esports gaming league of legends streamer",
      purpose: "creator-profile"
    });

    const cosine = (x: number[], y: number[]) => x.reduce((sum, xi, i) => sum + xi * y[i], 0);

    const similarPair = cosine(a, b);
    const unrelatedPair = cosine(a, c);
    expect(similarPair).toBeGreaterThan(unrelatedPair);
  });

  it("uses the local model identifier so the embeddings row is traceable", () => {
    const embedder = getEmbedder();
    expect(embedder.model).toBe("local-hash-1536");
  });
});

describe("buildCreatorEmbeddingText", () => {
  it("joins identity + niches into a single canonical string", () => {
    const text = buildCreatorEmbeddingText({
      displayName: "Sara Rivera",
      handle: "sara_creates",
      headline: "Skincare for sensitive skin",
      bio: "Routine-led concepts for verified audiences",
      niches: ["Beauty", "Skincare"],
      location: "Brooklyn, NY"
    });
    expect(text).toContain("Sara Rivera");
    expect(text).toContain("Skincare for sensitive skin");
    expect(text).toContain("Beauty Skincare");
  });

  it("survives missing optional fields", () => {
    const text = buildCreatorEmbeddingText({
      displayName: "X",
      handle: "x",
      headline: null,
      bio: null,
      niches: ["Tech"],
      location: null
    });
    expect(text).toContain("X");
    expect(text).toContain("Tech");
  });
});

describe("buildJobEmbeddingText", () => {
  it("includes title, description, niches, and location", () => {
    const text = buildJobEmbeddingText({
      title: "Summer skincare launch",
      description: "Looking for verified beauty creators",
      niches: ["Beauty"],
      location: "Remote"
    });
    expect(text).toContain("Summer skincare launch");
    expect(text).toContain("Looking for verified beauty creators");
    expect(text).toContain("Beauty");
  });
});
