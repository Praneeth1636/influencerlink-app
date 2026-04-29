import * as Sentry from "@sentry/nextjs";
import { TRPCError, type TRPC_ERROR_CODE_KEY, type TRPCProcedureType } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { TRPCContext } from "@/server/trpc";

type ErrorShape = {
  message: string;
  code: number;
  data: {
    code: TRPC_ERROR_CODE_KEY;
    httpStatus: number;
    path?: string;
    stack?: string;
    cause?: string;
  };
};

type FormatTRPCErrorInput = {
  error: TRPCError;
  shape: ErrorShape;
};

type HandleTRPCErrorInput = {
  error: TRPCError;
  path?: string;
  type: TRPCProcedureType | "unknown";
  ctx?: TRPCContext;
};

function getCause(error: TRPCError) {
  return error.cause ?? error;
}

function getErrorName(error: unknown) {
  return error instanceof Error ? error.name : "UnknownError";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected error occurred";
}

export function getTRPCCodeForError(error: unknown): TRPC_ERROR_CODE_KEY {
  if (error instanceof TRPCError) return error.code;
  if (error instanceof UnauthorizedError) return "UNAUTHORIZED";
  if (error instanceof ForbiddenError) return "FORBIDDEN";
  if (error instanceof NotFoundError) return "NOT_FOUND";
  return "INTERNAL_SERVER_ERROR";
}

export function toTRPCError(error: unknown) {
  if (error instanceof TRPCError) return error;

  return new TRPCError({
    code: getTRPCCodeForError(error),
    message: getErrorMessage(error),
    cause: error
  });
}

export function formatTRPCError({ error, shape }: FormatTRPCErrorInput) {
  const mappedError = toTRPCError(getCause(error));

  return {
    ...shape,
    message: mappedError.message,
    code: TRPC_ERROR_CODES_BY_KEY[mappedError.code],
    data: {
      ...shape.data,
      code: mappedError.code,
      httpStatus: getHTTPStatusCodeFromError(mappedError),
      cause: getErrorName(getCause(mappedError))
    }
  };
}

export function handleTRPCError({ error, path, type, ctx }: HandleTRPCErrorInput) {
  const mappedError = toTRPCError(getCause(error));
  const payload = {
    path,
    type,
    code: mappedError.code,
    cause: getErrorName(getCause(mappedError)),
    userId: ctx?.user?.id
  };

  if (mappedError.code === "INTERNAL_SERVER_ERROR") {
    logger.error(payload, "tRPC internal error");
    Sentry.captureException(getCause(mappedError));
    return;
  }

  logger.warn(payload, "tRPC request error");
}
