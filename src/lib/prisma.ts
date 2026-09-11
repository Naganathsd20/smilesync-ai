// create a prisma instance and cache in development for Next.js / Turbopack
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getEnhancedDatabaseUrl = () => {
  let url = process.env.DATABASE_URL || "";
  if (url && !url.includes("connect_timeout=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connect_timeout=15&pool_timeout=15`;
  }
  return url;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getEnhancedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
