import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the DB module so we can dictate what each Drizzle call returns.
const { dbSelectLimit, dbOrderByLimit } = vi.hoisted(() => ({
  dbSelectLimit: vi.fn(),
  dbOrderByLimit: vi.fn()
}));

// Drizzle's chainable builder returns the same builder object until limit().
// We mock the parts we use.
function makeDbStub() {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => ({ limit: dbOrderByLimit }))
            }))
          })),
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({ limit: dbOrderByLimit }))
          }))
        })),
        where: vi.fn(() => ({ limit: dbSelectLimit }))
      }))
    }))
  };
}

beforeEach(() => {
  process.env.USE_LOCAL_EMBEDDER = "true";
  dbSelectLimit.mockReset();
  dbOrderByLimit.mockReset();
});

afterEach(() => {
  delete process.env.USE_LOCAL_EMBEDDER;
  vi.clearAllMocks();
});

describe("findCreatorsForVector", () => {
  it("normalises pgvector cosine distance into a 0..100 match score", async () => {
    const { findCreatorsForVector } = await import("@/server/services/match-service");

    dbOrderByLimit.mockResolvedValueOnce([
      {
        creator: {
          id: "c1",
          handle: "sara",
          displayName: "Sara",
          headline: "Skincare",
          bio: null,
          niches: ["Beauty"],
          avatarUrl: null,
          location: "NY",
          verified: true,
          openToCollabs: true
        },
        aggregate: { totalReach: 1_000_000, weightedEngagement: "5.5" },
        distance: 0.05 // similarity 0.95 -> score 95
      },
      {
        creator: {
          id: "c2",
          handle: "alex",
          displayName: "Alex",
          headline: null,
          bio: null,
          niches: ["Tech"],
          avatarUrl: null,
          location: null,
          verified: false,
          openToCollabs: false
        },
        aggregate: null,
        distance: 1.2 // similarity -0.2 -> clamped to 0
      }
    ]);

    const db = makeDbStub();
    const queryVector = new Array(1536).fill(0.1);
    const result = await findCreatorsForVector(db as never, { queryVector, limit: 5 });

    expect(result).toHaveLength(2);
    expect(result[0]!.matchScore).toBe(95);
    expect(result[0]!.creator.handle).toBe("sara");
    expect(result[0]!.aggregate?.totalReach).toBe(1_000_000);
    expect(result[1]!.matchScore).toBe(0);
    expect(result[1]!.aggregate).toBeNull();
  });
});

describe("findJobsForVector", () => {
  it("returns ranked jobs with budget, niche, and match score", async () => {
    const { findJobsForVector } = await import("@/server/services/match-service");

    dbOrderByLimit.mockResolvedValueOnce([
      {
        job: {
          id: "j1",
          title: "Summer skincare launch",
          description: "Beauty creator wanted",
          niches: ["Beauty"],
          budgetMinCents: 500_000,
          budgetMaxCents: 1_500_000,
          location: "Remote"
        },
        distance: 0.1
      }
    ]);

    const db = makeDbStub();
    const queryVector = new Array(1536).fill(0.1);
    const result = await findJobsForVector(db as never, { queryVector, limit: 5 });

    expect(result).toHaveLength(1);
    expect(result[0]!.job.title).toBe("Summer skincare launch");
    expect(result[0]!.matchScore).toBe(90);
  });
});
