import "dotenv/config";
import { loadEnv } from "./config/env.js";
import { buildApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

async function main() {
  const env = loadEnv();
  const app = await buildApp(env);

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down`);
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info(`API listening on ${env.API_URL}`);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
