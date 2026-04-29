import { TRPCError } from "@trpc/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";

const { captureExceptionMock, loggerErrorMock, loggerWarnMock } = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  loggerWarnMock: vi.fn()
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: captureExceptionMock
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: loggerErrorMock,
    warn: loggerWarnMock
  }
}));

const baseShape = {
  message: "Original",
  code: -32603,
  data: {
    code: "INTERNAL_SERVER_ERROR" as const,
    httpStatus: 500,
    path: "creator.byId"
  }
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("tRPC error handling", () => {
  it("maps custom app errors to tRPC error codes", async () => {
    const { getTRPCCodeForError, toTRPCError } = await import("@/server/trpc-errors");

    expect(getTRPCCodeForError(new UnauthorizedError("Sign in"))).toBe("UNAUTHORIZED");
    expect(getTRPCCodeForError(new ForbiddenError("No access"))).toBe("FORBIDDEN");
    expect(getTRPCCodeForError(new NotFoundError("Missing"))).toBe("NOT_FOUND");

    const mapped = toTRPCError(new NotFoundError("Creator not found"));
    expect(mapped).toMatchObject({
      code: "NOT_FOUND",
      message: "Creator not found"
    });
  });

  it("formats custom error causes into the client-facing tRPC shape", async () => {
    const { formatTRPCError } = await import("@/server/trpc-errors");
    const error = new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal",
      cause: new NotFoundError("Creator not found")
    });

    expect(formatTRPCError({ error, shape: baseShape })).toMatchObject({
      message: "Creator not found",
      data: {
        code: "NOT_FOUND",
        httpStatus: 404,
        cause: "NotFoundError"
      }
    });
  });

  it("logs 4xx errors without sending them to Sentry", async () => {
    const { handleTRPCError } = await import("@/server/trpc-errors");

    handleTRPCError({
      error: new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No session",
        cause: new UnauthorizedError("No session")
      }),
      path: "feed.list",
      type: "query"
    });

    expect(loggerWarnMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        cause: "UnauthorizedError",
        path: "feed.list"
      }),
      "tRPC request error"
    );
    expect(loggerErrorMock).not.toHaveBeenCalled();
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it("logs and captures internal server errors only", async () => {
    const { handleTRPCError } = await import("@/server/trpc-errors");
    const cause = new Error("Database exploded");

    handleTRPCError({
      error: new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database exploded",
        cause
      }),
      path: "creator.list",
      type: "query"
    });

    expect(loggerErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "INTERNAL_SERVER_ERROR",
        cause: "Error",
        path: "creator.list"
      }),
      "tRPC internal error"
    );
    expect(captureExceptionMock).toHaveBeenCalledWith(cause);
  });
});
