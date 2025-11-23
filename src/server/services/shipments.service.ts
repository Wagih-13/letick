import { shipmentsRepository } from "../repositories/shipments.repository";
import { ordersRepository } from "../repositories/orders.repository";
import { notificationsService } from "./notifications.service";
import { success, failure, type ServiceResult } from "../types";

export interface ListShipmentParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "createdAt.desc" | "createdAt.asc";
}

export interface UpdateShipmentInput {
  status?: any;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippingMethodId?: string | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  estimatedDeliveryAt?: Date | null;
  notes?: string | null;
}

class ShipmentsService {
  async list(params: ListShipmentParams): Promise<ServiceResult<{ items: any[]; total: number }>> {
    try {
      const res = await shipmentsRepository.list(params);
      return success(res);
    } catch (e: any) {
      return failure("LIST_SHIPMENTS_FAILED", e?.message || "Failed to list shipments");
    }
  }

  async get(id: string): Promise<ServiceResult<any>> {
    try {
      const row = await shipmentsRepository.get(id);
      if (!row) return failure("NOT_FOUND", "Shipment not found");
      return success(row);
    } catch (e: any) {
      return failure("GET_SHIPMENT_FAILED", e?.message || "Failed to get shipment");
    }
  }

  async update(id: string, patch: UpdateShipmentInput): Promise<ServiceResult<any>> {
    try {
      const row = await shipmentsRepository.update(id, patch);
      if (!row) return failure("NOT_FOUND", "Shipment not found");
      // Auto-notify customer on key shipment status transitions
      try {
        const order = await ordersRepository.get(row.orderId);
        const userId = (order as any)?.userId as string | undefined;
        const orderNumber = (order as any)?.orderNumber as string | undefined;
        const s = (row as any)?.status as string | undefined;
        if (userId && s) {
          if (s === "shipped") {
            await notificationsService.create(
              {
                userId,
                type: "order_shipped" as any,
                title: "Order shipped",
                message: `Your order ${orderNumber || row.orderId} has been shipped`,
                actionUrl: `/account/orders/${row.orderId}`,
              },
              { userId },
            );
          } else if (s === "delivered") {
            await notificationsService.create(
              {
                userId,
                type: "order_delivered" as any,
                title: "Order delivered",
                message: `Your order ${orderNumber || row.orderId} has been delivered`,
                actionUrl: `/account/orders/${row.orderId}`,
              },
              { userId },
            );
          } else if (s === "out_for_delivery") {
            await notificationsService.create(
              {
                userId,
                type: "order_updated" as any,
                title: "Out for delivery",
                message: `Your order ${orderNumber || row.orderId} is out for delivery`,
                actionUrl: `/account/orders/${row.orderId}`,
              },
              { userId },
            );
          }
        }
      } catch {}
      return success(row);
    } catch (e: any) {
      return failure("UPDATE_SHIPMENT_FAILED", e?.message || "Failed to update shipment");
    }
  }

  async remove(id: string): Promise<ServiceResult<{ id: string }>> {
    try {
      const ok = await shipmentsRepository.remove(id);
      if (!ok) return failure("NOT_FOUND", "Shipment not found");
      return success({ id });
    } catch (e: any) {
      return failure("DELETE_SHIPMENT_FAILED", e?.message || "Failed to delete shipment");
    }
  }
}

export const shipmentsService = new ShipmentsService();
