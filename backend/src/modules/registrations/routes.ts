import type { FastifyPluginAsync } from "fastify";
import type { Env } from "../../config/env.js";
import { RegistrationService } from "./service.js";
import { createRegistrationSchema } from "./schema.js";

export const registrationRoutes: FastifyPluginAsync<{ env: Env }> = async (app, opts) => {
  const service = new RegistrationService(opts.env);

  app.post("/", async (request, reply) => {
    const body = createRegistrationSchema.parse(request.body);
    const result = await service.create(body);
    return reply.code(201).send({
      success: true,
      data: result,
    });
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const registration = await service.getById(id);
    return reply.send({
      success: true,
      data: registration,
    });
  });

  app.post("/:id/sync-payment", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.syncPaymentByRegistrationId(id);
    return reply.send({
      success: true,
      data: result,
    });
  });
};
