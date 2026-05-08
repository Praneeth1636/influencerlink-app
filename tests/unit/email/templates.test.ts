import { describe, expect, it } from "vitest";
import { welcomeEmail } from "@/lib/email/templates";

describe("welcomeEmail", () => {
  it("uses the recipient name in the greeting when provided", () => {
    const envelope = welcomeEmail({ to: "creator@example.com", displayName: "Sara" });
    expect(envelope.subject).toBe("Welcome to Terrace");
    expect(envelope.html).toContain("Hi Sara,");
    expect(envelope.text).toContain("Hi Sara,");
  });

  it("falls back to a neutral greeting when displayName is null", () => {
    const envelope = welcomeEmail({ to: "creator@example.com", displayName: null });
    expect(envelope.html).toContain("Hi there,");
    expect(envelope.text).toContain("Hi there,");
  });

  it("links to the onboarding page in both html and text bodies", () => {
    const envelope = welcomeEmail({ to: "creator@example.com" });
    expect(envelope.html).toContain("/onboarding");
    expect(envelope.text).toContain("/onboarding");
  });

  it("tags the email category for analytics", () => {
    const envelope = welcomeEmail({ to: "creator@example.com" });
    expect(envelope.tags).toEqual([{ name: "category", value: "welcome" }]);
  });

  it("preserves the recipient address verbatim", () => {
    const envelope = welcomeEmail({ to: "creator+plus@example.com" });
    expect(envelope.to).toBe("creator+plus@example.com");
  });
});
