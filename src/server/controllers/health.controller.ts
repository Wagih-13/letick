import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { healthService } from "../services/health.service";
import { handleRouteError, successResponse } from "../utils/response";
import { requirePermission } from "../utils/rbac";

const listQuerySchema = z.object({ page: z.coerce.number().int().positive().optional(), limit: z.coerce.number().int().positive().max(200).optional(), sort: z.enum(["createdAt.desc", "createdAt.asc"]).optional(), service: z.string().optional() });

export class HealthController {
  static async list(request: NextRequest) {
    try {
      await requirePermission(request, "health.manage");
      const query = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
      const result = await healthService.list(query);
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data);
    } catch (e) {
      return handleRouteError(e);
    }
  }

  static async run(request: NextRequest) {
    try {
      const session = await requirePermission(request, "health.manage");
      const result = await healthService.run("app", { userId: (session.user as any)?.id, ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"), userAgent: request.headers.get("user-agent") });
      if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      return successResponse(result.data, 201);
    } catch (e) {
      return handleRouteError(e);
    }
  }
}
