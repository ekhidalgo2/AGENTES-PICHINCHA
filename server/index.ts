import "dotenv/config";
import { buildServer } from "./app";

const port = Number(process.env.PORT ?? 3000);
const server = buildServer();

try {
  await server.listen({ host: "0.0.0.0", port });
} catch (error) {
  console.error("Fastify could not start", error);
  process.exitCode = 1;
}
