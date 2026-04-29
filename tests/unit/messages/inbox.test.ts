import { describe, expect, it } from "vitest";
import { buildSeedData } from "@/lib/db/seed";
import { buildSeedThreadPreviews, getSeedThreadDetail } from "@/lib/messages/inbox";

describe("messages inbox adapter", () => {
  it("builds seed inbox previews for a creator viewer", () => {
    const seed = buildSeedData();
    const previews = buildSeedThreadPreviews(seed, seed.creators[0]?.userId);

    expect(previews).toHaveLength(1);
    expect(previews[0]).toMatchObject({
      title: "Glossier",
      type: "job"
    });
    expect(previews[0]?.lastMessage).toContain("content angles");
  });

  it("builds a seed thread detail with viewer-aware message bubbles", () => {
    const seed = buildSeedData();
    const detail = getSeedThreadDetail("00000000-0000-4000-8000-000000009000", seed, seed.creators[0]?.userId);

    expect(detail?.messages).toHaveLength(3);
    expect(detail?.messages.some((message) => message.sentByViewer)).toBe(true);
    expect(detail?.messages.some((message) => message.senderLabel === "Glossier")).toBe(true);
  });
});
