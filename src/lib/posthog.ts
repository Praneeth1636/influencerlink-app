import posthog from "posthog-js";

export const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (typeof window !== "undefined" && posthogKey) {
  posthog.init(posthogKey, {
    api_host: "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    loaded: (client) => {
      if (process.env.NODE_ENV === "development") client.debug(false);
    }
  });
}

export { posthog };
