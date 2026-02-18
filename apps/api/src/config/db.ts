import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const globalScope = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalScope.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalScope.prisma = prisma;
}

export const connectDB = async (): Promise<void> => {
  await prisma.$connect();
  console.log("Database connected");
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
};
