import { NextResponse } from "next/server";
import { type ApiResponse, AppError } from "../types";

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status: number = 200, meta?: ApiResponse<T>["meta"]): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    },
    { status },
  );
}

/**
 * Create an error API response
 */
export function errorResponse(error: AppError | Error, status?: number): NextResponse<ApiResponse> {
  const isAppError = error instanceof AppError;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: isAppError ? error.code : "INTERNAL_ERROR",
        message: error.message,
        details: isAppError ? error.details : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: isAppError ? error.statusCode : status || 500 },
  );
}

/**
 * Handle async route errors
 */
export function handleRouteError(error: unknown): NextResponse<ApiResponse> {
  console.error("Route error:", error);

  if (error instanceof AppError) {
    return errorResponse(error);
  }

  if (error instanceof Error) {
    return errorResponse(new AppError(error.message));
  }

  return errorResponse(new AppError("An unexpected error occurred"));
}
