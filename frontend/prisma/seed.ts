import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const sessions: Prisma.SessionCreateInput[] = [
  {
    slug: "2026-09-03-thu",
    startsAt: new Date("2026-09-03T19:00:00+03:00"),
    endsAt: new Date("2026-09-03T21:00:00+03:00"),
    timezone: "Asia/Kuwait",
    isActive: true,
  },
  {
    slug: "2026-09-06-sun",
    startsAt: new Date("2026-09-06T19:00:00+03:00"),
    endsAt: new Date("2026-09-06T21:00:00+03:00"),
    timezone: "Asia/Kuwait",
    isActive: true,
  },
];

async function main() {
  for (const session of sessions) {
    await prisma.session.upsert({
      where: { slug: session.slug },
      create: session,
      update: {
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        timezone: session.timezone,
        isActive: session.isActive,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
