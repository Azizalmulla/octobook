import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { ZodError } from "zod";
import type { Env } from "./config/env.js";
import { AppError } from "./lib/errors.js";
import { paymentRoutes } from "./modules/payments/routes.js";
import { registrationRoutes } from "./modules/registrations/routes.js";
import { metaRoutes, sessionRoutes } from "./modules/sessions/routes.js";

export async function buildApp(env: Env) {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  const origins = env.CORS_ORIGIN.split(",").map((value) => value.trim()).filter(Boolean);

  await app.register(cors, {
    origin: origins.length === 1 ? origins[0] : origins,
    methods: ["GET", "POST", "OPTIONS"],
  });
  await app.register(sensible);

  app.get("/health", async () => ({
    success: true,
    data: {
      status: "ok",
      service: "octokiss-backend",
      env: env.NODE_ENV,
    },
  }));

  await app.register(sessionRoutes, { prefix: "/api/sessions" });
  await app.register(metaRoutes, {
    prefix: "/api/meta",
    feeKwd: env.REGISTRATION_FEE_KWD,
  });
  await app.register(registrationRoutes, {
    prefix: "/api/registrations",
    env,
  });
  await app.register(paymentRoutes, {
    prefix: "/api/payments",
    env,
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten(),
        },
      });
    }

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        success: false,
        error: {
          code: error.code ?? "APP_ERROR",
          message: error.message,
          details: error.details,
        },
      });
    }

    request.log.error(error);
    const statusCode = typeof error === "object" && error && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode ?? 500)
      : 500;

    return reply.code(statusCode).send({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: statusCode >= 500 ? "Internal server error" : (error as Error).message,
      },
    });
  });

  return app;
}
