import { PrismaClient } from "@prisma/client";

declare global {
  var __kidbankPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__kidbankPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__kidbankPrisma__ = prisma;
}
