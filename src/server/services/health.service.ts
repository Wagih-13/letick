import { healthRepository } from "../repositories/health.repository";
import { success, failure } from "../types";
import { writeAudit } from "../utils/audit";
import type { ActorContext } from "./role.service";

class HealthService {
  async list(params: { page?: number; limit?: number; sort?: "createdAt.desc" | "createdAt.asc" }) {
    try {
      const res = await healthRepository.list(params);
      return success(res);
    } catch (e: any) {
      return failure("LIST_HEALTH_FAILED", e?.message || "Failed to list health checks");
    }
  }

  async run(service?: string, actor?: ActorContext) {
    try {
      const item = await healthRepository.run(service);
      await writeAudit({ action: "create", resource: "health_check", resourceId: item.id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined, changes: { service } });
      return success(item);
    } catch (e: any) {
      return failure("RUN_HEALTH_FAILED", e?.message || "Failed to run health check");
    }
  }
}

export const healthService = new HealthService();
