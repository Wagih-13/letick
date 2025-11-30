import { emailsRepository } from "../repositories/notifications.repository";
import { success, failure } from "../types";
import { sendMail } from "../utils/mailer";
import { writeAudit } from "../utils/audit";
import type { ActorContext } from "./role.service";
import { getEmailProvider } from "@/lib/email/provider";

class EmailsService {
  async listTemplates(params: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    try {
      const res = await emailsRepository.listTemplates(params);
      return success(res);
    } catch (e: any) {
      return failure("LIST_EMAIL_TEMPLATES_FAILED", e?.message || "Failed to list email templates");
    }
  }

  async getTemplate(id: string) {
    try {
      const row = await emailsRepository.getTemplate(id);
      if (!row) return failure("NOT_FOUND", "Template not found");
      return success(row);
    } catch (e: any) {
      return failure("GET_EMAIL_TEMPLATE_FAILED", e?.message || "Failed to get template");
    }
  }

  async createTemplate(input: { name: string; slug: string; subject: string; body: string; variables?: Record<string, string>; isActive?: boolean }, actor?: ActorContext) {
    try {
      const row = await emailsRepository.createTemplate(input);
      await writeAudit({ action: "create", resource: "email.template", resourceId: row.id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined, changes: input as any });
      return success(row);
    } catch (e: any) {
      return failure("CREATE_EMAIL_TEMPLATE_FAILED", e?.message || "Failed to create template");
    }
  }

  async updateTemplate(id: string, patch: Partial<{ name: string; slug: string; subject: string; body: string; variables: Record<string, string>; isActive: boolean }>, actor?: ActorContext) {
    try {
      const row = await emailsRepository.updateTemplate(id, patch);
      if (!row) return failure("NOT_FOUND", "Template not found");
      await writeAudit({ action: "update", resource: "email.template", resourceId: id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined, changes: patch as any });
      return success(row);
    } catch (e: any) {
      return failure("UPDATE_EMAIL_TEMPLATE_FAILED", e?.message || "Failed to update template");
    }
  }

  async deleteTemplate(id: string, actor?: ActorContext) {
    try {
      const ok = await emailsRepository.deleteTemplate(id);
      if (!ok) return failure("NOT_FOUND", "Template not found");
      await writeAudit({ action: "delete", resource: "email.template", resourceId: id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined });
      return success({ id });
    } catch (e: any) {
      return failure("DELETE_EMAIL_TEMPLATE_FAILED", e?.message || "Failed to delete template");
    }
  }

  async listLogs(params: { page?: number; limit?: number; to?: string; status?: string; search?: string }) {
    try {
      const res = await emailsRepository.listLogs(params);
      return success(res);
    } catch (e: any) {
      return failure("LIST_EMAIL_LOGS_FAILED", e?.message || "Failed to list email logs");
    }
  }

  async send(input: { to: string; subject: string; html?: string; text?: string; fromOverride?: string; userId?: string | null; templateId?: string | null; metadata?: any }, actor?: ActorContext) {
    try {
      const pending = await emailsRepository.logEmail({ userId: input.userId ?? null, templateId: input.templateId ?? null, to: input.to, from: input.fromOverride || process.env.EMAIL_FROM || "", subject: input.subject, body: input.html || input.text || "", status: "pending", metadata: input.metadata ?? null });

      // Try primary SMTP first
      let lastError: any = null;
      try {
        const info = await sendMail({ to: input.to, subject: input.subject, html: input.html, text: input.text, fromOverride: input.fromOverride });
        await emailsRepository.updateLog(pending.id, { status: "sent", sentAt: new Date(), metadata: { ...(pending as any).metadata, transport: { type: "smtp", info } } });
        await writeAudit({ action: "create", resource: "email.send", resourceId: pending.id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined, metadata: { to: input.to, subject: input.subject } });
        return success({ id: pending.id, info });
      } catch (err: any) {
        lastError = err;
      }

      // Fallback to configured provider (e.g. SendGrid) if available
      const providerName = (process.env.EMAIL_PROVIDER || "").toLowerCase();
      if (providerName && providerName !== "console") {
        try {
          const provider = getEmailProvider();
          const fromAddr = input.fromOverride || process.env.EMAIL_FROM || process.env.EMAIL_USER || "";
          const res = await provider.sendEmail({ to: input.to, from: String(fromAddr || ""), subject: input.subject, body: input.html || input.text || "" });
          if (res.ok) {
            await emailsRepository.updateLog(pending.id, { status: "sent", sentAt: new Date(), metadata: { ...(pending as any).metadata, transport: { type: "provider", provider: providerName } } });
            await writeAudit({ action: "create", resource: "email.send", resourceId: pending.id, userId: actor?.userId, ipAddress: actor?.ip ?? undefined, userAgent: actor?.userAgent ?? undefined, metadata: { to: input.to, subject: input.subject } });
            return success({ id: pending.id, info: { provider: providerName } as any });
          }
        } catch (provErr: any) {
          lastError = lastError || provErr;
        }
      }

      await emailsRepository.updateLog(pending.id, { status: "failed", error: lastError?.message || String(lastError) });
      return failure("EMAIL_SEND_FAILED", lastError?.message || "Failed to send email");
    } catch (e: any) {
      return failure("EMAIL_SEND_FAILED", e?.message || "Failed to send email");
    }
  }

  /**
   * Compose rich HTML for a new order notification (EGP display)
   */
  getNewOrderEmailTemplate(orderData: any) {
    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount,
      deliveryFee,
      orderDate,
      orderStatus,
      items,
      shippingAddress,
    } = orderData || {};

    const itemsHtml = (items || [])
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">EG ${Number(item.price).toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">EG ${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
      </tr>`
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛍️ New Order Received!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Order Number:</td><td style="padding: 8px 0;">${orderNumber}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Order ID:</td><td style="padding: 8px 0;">${orderId}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Order Date:</td><td style="padding: 8px 0;">${new Date(orderDate || Date.now()).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td></tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                <td style="padding: 8px 0;"><span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${String(orderStatus || "PENDING").toUpperCase()}</span></td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Customer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Name:</td><td style="padding: 8px 0;">${customerName || "N/A"}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;">${customerEmail || "N/A"}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">${customerPhone || "N/A"}</td></tr>
              ${shippingAddress ? `<tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Address:</td><td style="padding: 8px 0;">${shippingAddress}</td></tr>` : ""}
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #667eea; margin-top: 0;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; width: 30%;">EG ${(Number(totalAmount || 0) - Number(deliveryFee || 0)).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">Delivery Fee:</td>
                <td style="padding: 8px 0; text-align: right;">EG ${Number(deliveryFee || 0).toLocaleString()}</td>
              </tr>
              <tr style="border-top: 2px solid #667eea;">
                <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">Total Amount:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">EG ${Number(totalAmount || 0).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-left: 4px solid #667eea; border-radius: 4px;">
            <p style="margin: 0; color: #1e40af;"><strong>📌 Action Required:</strong> Please process this order and update the customer with shipping information.</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>This is an automated notification from Letick Store</p>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Letick Store. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send new order notification using the rich template
   */
  async sendNewOrderNotification(orderData: any, actor?: ActorContext) {
    try {
      const to = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_TO || process.env.EMAIL_USER || process.env.EMAIL_FROM || "";
      if (!to) return failure("EMAIL_SEND_FAILED", "No recipient configured");

      const html = this.getNewOrderEmailTemplate(orderData);
      const subject = `🛍️ New Order Received - ${orderData?.orderNumber || orderData?.orderId || "Order"}`;
      const fromOverride = `"Letick Store" <${process.env.EMAIL_USER || process.env.EMAIL_FROM || ""}>`;

      const res = await this.send({ to, subject, html, fromOverride, metadata: { orderId: orderData?.orderId, orderNumber: orderData?.orderNumber } }, actor);
      return res;
    } catch (e: any) {
      return failure("EMAIL_SEND_FAILED", e?.message || "Failed to send order email");
    }
  }
}

export const emailsService = new EmailsService();
