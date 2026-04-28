import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const server = setupServer(
  http.get("https://api.creatorlink.test/health", () => {
    return HttpResponse.json({
      ok: true,
      service: "creatorlink"
    });
  })
);
