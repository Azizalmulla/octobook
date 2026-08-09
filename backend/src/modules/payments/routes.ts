import type { FastifyPluginAsync } from "fastify";
import type { Env } from "../../config/env.js";
import { RegistrationService } from "../registrations/service.js";

export const paymentRoutes: FastifyPluginAsync<{ env: Env }> = async (app, opts) => {
  const service = new RegistrationService(opts.env);

  app.get("/:trackId/status", async (request, reply) => {
    const { trackId } = request.params as { trackId: string };
    const result = await service.syncPaymentByTrackId(trackId);
    return reply.send({
      success: true,
      data: result,
    });
  });

  app.post("/:trackId/sync", async (request, reply) => {
    const { trackId } = request.params as { trackId: string };
    const result = await service.syncPaymentByTrackId(trackId);
    return reply.send({
      success: true,
      data: result,
    });
  });
};
