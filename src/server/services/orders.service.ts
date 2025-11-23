import { ordersRepository } from "../repositories/orders.repository";
import { success, failure, type ServiceResult } from "../types";
import { notificationsService } from "./notifications.service";

export interface ListOrderParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "createdAt.desc" | "createdAt.asc";
  userId?: string;
}

export interface UpdateOrderInput {
  status?: any;
  paymentStatus?: any;
  adminNote?: string | null;
}

class OrdersService {
  async list(params: ListOrderParams): Promise<ServiceResult<{ items: any[]; total: number }>> {
    try {
      const res = await ordersRepository.list(params);
      return success(res);
    } catch (e: any) {
      return failure("LIST_ORDERS_FAILED", e?.message || "Failed to list orders");
    }
  }

  async get(id: string): Promise<ServiceResult<any>> {
    try {
      const row = await ordersRepository.get(id);
      if (!row) return failure("NOT_FOUND", "Order not found");
      return success(row);
    } catch (e: any) {
      return failure("GET_ORDER_FAILED", e?.message || "Failed to get order");
    }
  }

  async getDetails(id: string): Promise<ServiceResult<any>> {
    try {
      const data = await ordersRepository.getDetails(id);
      if (!data) return failure("NOT_FOUND", "Order not found");
      return success(data);
    } catch (e: any) {
      return failure("GET_ORDER_DETAILS_FAILED", e?.message || "Failed to get order details");
    }
  }

  async update(id: string, patch: UpdateOrderInput): Promise<ServiceResult<any>> {
    try {
      const row = await ordersRepository.update(id, patch);
      if (!row) return failure("NOT_FOUND", "Order not found");
      try {
        const userId = (row as any)?.userId as string | undefined;
        const orderNumber = (row as any)?.orderNumber as string | undefined;
        if (userId) {
          const status = (row as any)?.status as string | undefined;
          const paymentStatus = (row as any)?.paymentStatus as string | undefined;
          if (patch.status && status) {
            const type = status === "shipped" ? ("order_shipped" as any) : status === "delivered" ? ("order_delivered" as any) : ("order_updated" as any);
            await notificationsService.create(
              {
                userId,
                type,
                title: status === "shipped" ? "Order shipped" : status === "delivered" ? "Order delivered" : "Order updated",
                message: `Order ${orderNumber || id} status updated to ${status}`,
                actionUrl: `/account/orders/${id}`,
              },
              { userId },
            );
          } else if (patch.paymentStatus && paymentStatus) {
            await notificationsService.create(
              {
                userId,
                type: "order_updated" as any,
                title: "Payment status updated",
                message: `Payment status for order ${orderNumber || id} is now ${paymentStatus}`,
                actionUrl: `/account/orders/${id}`,
              },
              { userId },
            );
          }
        }
      } catch {}
      return success(row);
    } catch (e: any) {
      return failure("UPDATE_ORDER_FAILED", e?.message || "Failed to update order");
    }
  }

  async remove(id: string): Promise<ServiceResult<{ id: string }>> {
    try {
      const ok = await ordersRepository.remove(id);
      if (!ok) return failure("NOT_FOUND", "Order not found");
      return success({ id });
    } catch (e: any) {
      return failure("DELETE_ORDER_FAILED", e?.message || "Failed to delete order");
    }
  }
}

export const ordersService = new OrdersService();
