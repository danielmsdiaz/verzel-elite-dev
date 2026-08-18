import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined.");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as typeof globalThis & {
  prismaCheckoutOrders?: ReturnType<typeof createPrismaClient>;
};

// The versioned key prevents Next.js HMR from reusing a client generated from
// an older schema after a migration adds or removes model delegates.
export const prisma =
  globalForPrisma.prismaCheckoutOrders ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaCheckoutOrders = prisma;
}

export default prisma;
