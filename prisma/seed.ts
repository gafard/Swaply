import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL ou DATABASE_URL requis pour le seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const markets = [
  {
    country: { code: "TG", name: "Togo", defaultLanguage: "fr" },
    city: { name: "Lomé", slug: "lome", lat: 6.1375, lng: 1.2123 },
    zones: [
      { name: "Campus Sud", lat: 6.1764, lng: 1.2132 },
      { name: "Campus Nord", lat: 6.2023, lng: 1.2145 },
      { name: "Kégué", lat: 6.1912, lng: 1.2526 },
      { name: "Adidogomé", lat: 6.1834, lng: 1.1623 },
      { name: "Tokoin", lat: 6.1523, lng: 1.2145 },
      { name: "Hédzranawoé", lat: 6.1745, lng: 1.2567 },
      { name: "Agoë", lat: 6.2345, lng: 1.2234 },
      { name: "Bè", lat: 6.1289, lng: 1.2345 },
      { name: "Assivito", lat: 6.1212, lng: 1.2134 },
    ],
    meetingPoints: [
      {
        name: "TotalEnergies Minimes",
        zone: "Assivito",
        lat: 6.1256,
        lng: 1.2145,
        description: "Station éclairée, caméra de surveillance.",
      },
      {
        name: "Champion Fontaine Lumineuse",
        zone: "Tokoin",
        lat: 6.1512,
        lng: 1.2123,
        description: "Supermarché, parking public sûr.",
      },
      {
        name: "Université de Lomé (Entrée)",
        zone: "Campus Sud",
        lat: 6.1754,
        lng: 1.2121,
        description: "Point de ralliement étudiant.",
      },
    ],
    providers: [
      {
        code: "flooz",
        name: "Moov Money (Flooz)",
        packages: [
          { localAmount: 500, currencyCode: "XOF", swapsAmount: 5 },
          { localAmount: 1000, currencyCode: "XOF", swapsAmount: 12 },
          { localAmount: 2500, currencyCode: "XOF", swapsAmount: 35 },
          { localAmount: 5000, currencyCode: "XOF", swapsAmount: 80 },
          { localAmount: 10000, currencyCode: "XOF", swapsAmount: 170 },
        ],
      },
      {
        code: "tmoney",
        name: "T-Money",
        packages: [
          { localAmount: 500, currencyCode: "XOF", swapsAmount: 5 },
          { localAmount: 1000, currencyCode: "XOF", swapsAmount: 12 },
          { localAmount: 2500, currencyCode: "XOF", swapsAmount: 35 },
          { localAmount: 5000, currencyCode: "XOF", swapsAmount: 80 },
          { localAmount: 10000, currencyCode: "XOF", swapsAmount: 170 },
        ],
      },
    ],
  },
  {
    country: { code: "BJ", name: "Bénin", defaultLanguage: "fr" },
    city: { name: "Cotonou", slug: "cotonou", lat: 6.3703, lng: 2.3912 },
    zones: [
      { name: "Cadjèhoun", lat: 6.3588, lng: 2.3804 },
      { name: "Fidjrossè", lat: 6.3496, lng: 2.3389 },
      { name: "Akpakpa", lat: 6.3572, lng: 2.4407 },
      { name: "Ganhi", lat: 6.3609, lng: 2.4228 },
    ],
    meetingPoints: [
      {
        name: "Place de l'Amazone",
        zone: "Cadjèhoun",
        lat: 6.3584,
        lng: 2.3796,
        description: "Esplanade centrale, lieu public fréquenté.",
      },
    ],
    providers: [
      {
        code: "mtnmo",
        name: "MTN Mobile Money",
        packages: [
          { localAmount: 500, currencyCode: "XOF", swapsAmount: 6 },
          { localAmount: 1000, currencyCode: "XOF", swapsAmount: 14 },
          { localAmount: 2500, currencyCode: "XOF", swapsAmount: 38 },
          { localAmount: 5000, currencyCode: "XOF", swapsAmount: 85 },
        ],
      },
      {
        code: "moovmoney",
        name: "Moov Money",
        packages: [
          { localAmount: 500, currencyCode: "XOF", swapsAmount: 6 },
          { localAmount: 1000, currencyCode: "XOF", swapsAmount: 14 },
          { localAmount: 2500, currencyCode: "XOF", swapsAmount: 38 },
          { localAmount: 5000, currencyCode: "XOF", swapsAmount: 85 },
        ],
      },
    ],
  },
  {
    country: { code: "SN", name: "Sénégal", defaultLanguage: "fr" },
    city: { name: "Dakar", slug: "dakar", lat: 14.7167, lng: -17.4677 },
    zones: [
      { name: "Plateau", lat: 14.6937, lng: -17.4441 },
      { name: "Almadies", lat: 14.7392, lng: -17.5153 },
      { name: "Parcelles Assainies", lat: 14.7619, lng: -17.4456 },
      { name: "Grand Yoff", lat: 14.7519, lng: -17.4692 },
    ],
    meetingPoints: [
      {
        name: "Place de l'Indépendance",
        zone: "Plateau",
        lat: 14.6928,
        lng: -17.4467,
        description: "Centre-ville, lieu historique et fréquenté.",
      },
    ],
    providers: [
      {
        code: "orange",
        name: "Orange Money",
        packages: [
          { localAmount: 500, currencyCode: "XOF", swapsAmount: 6 },
          { localAmount: 1000, currencyCode: "XOF", swapsAmount: 14 },
          { localAmount: 2500, currencyCode: "XOF", swapsAmount: 38 },
          { localAmount: 5000, currencyCode: "XOF", swapsAmount: 85 },
        ],
      },
      {
        code: "wave",
        name: "Wave",
        packages: [
          { localAmount: 500, currencyCode: "XOF", swapsAmount: 6 },
          { localAmount: 1000, currencyCode: "XOF", swapsAmount: 14 },
          { localAmount: 2500, currencyCode: "XOF", swapsAmount: 38 },
          { localAmount: 5000, currencyCode: "XOF", swapsAmount: 85 },
        ],
      },
    ],
  },
  {
    country: { code: "CI", name: "Côte d'Ivoire", defaultLanguage: "fr" },
    city: { name: "Abidjan", slug: "abidjan", lat: 5.3600, lng: -4.0083 },
    zones: [
      { name: "Plateau", lat: 5.3236, lng: -4.0156 },
      { name: "Cocody", lat: 5.3597, lng: -3.9878 },
      { name: "Yopougon", lat: 5.3364, lng: -4.0892 },
      { name: "Marcory", lat: 5.2975, lng: -3.9864 },
    ],
    meetingPoints: [
      {
        name: "Ivoire Golf Club",
        zone: "Cocody",
        lat: 5.3556,
        lng: -3.9928,
        description: "Lieu sécurisé et accessible.",
      },
    ],
    providers: [
      {
        code: "orange",
        name: "Orange Money",
        packages: [
          { localAmount: 500, currencyCode: "XOF", swapsAmount: 6 },
          { localAmount: 1000, currencyCode: "XOF", swapsAmount: 14 },
          { localAmount: 2500, currencyCode: "XOF", swapsAmount: 38 },
          { localAmount: 5000, currencyCode: "XOF", swapsAmount: 85 },
        ],
      },
      {
        code: "mtn",
        name: "MTN Mobile Money",
        packages: [
          { localAmount: 500, currencyCode: "XOF", swapsAmount: 6 },
          { localAmount: 1000, currencyCode: "XOF", swapsAmount: 14 },
          { localAmount: 2500, currencyCode: "XOF", swapsAmount: 38 },
          { localAmount: 5000, currencyCode: "XOF", swapsAmount: 85 },
        ],
      },
    ],
  },
  {
    country: { code: "FR", name: "France", defaultLanguage: "fr" },
    city: { name: "Paris", slug: "paris", lat: 48.8566, lng: 2.3522 },
    zones: [
      { name: "11e Arrondissement", lat: 48.859, lng: 2.3789 },
      { name: "13e Arrondissement", lat: 48.8282, lng: 2.3628 },
      { name: "La Défense", lat: 48.8919, lng: 2.237 },
      { name: "Montreuil", lat: 48.8638, lng: 2.4485 },
    ],
    meetingPoints: [
      {
        name: "Parvis de La Défense",
        zone: "La Défense",
        lat: 48.8926,
        lng: 2.2382,
        description: "Point de rencontre visible, bien desservi et fréquenté.",
      },
    ],
    providers: [
      {
        code: "stripe",
        name: "Stripe",
        packages: [
          { localAmount: 5, currencyCode: "EUR", swapsAmount: 12 },
          { localAmount: 10, currencyCode: "EUR", swapsAmount: 28 },
          { localAmount: 20, currencyCode: "EUR", swapsAmount: 60 },
          { localAmount: 50, currencyCode: "EUR", swapsAmount: 160 },
        ],
      },
    ],
  },
];

const achievements = [
  {
    code: "FIRST_PUBLISH",
    name: "Premier Pas",
    description: "Vous avez publié votre premier objet !",
    icon: "Package",
    xpReward: 50,
  },
  {
    code: "TEN_PUBLISHES",
    name: "Collectionneur",
    description: "Vous avez publié 10 objets sur Swaply.",
    icon: "Boxes",
    xpReward: 200,
  },
  {
    code: "FIRST_SWAP",
    name: "Troc Initie",
    description: "Vous avez réussi votre premier échange !",
    icon: "RefreshCw",
    xpReward: 100,
  },
  {
    code: "TEN_SWAPS",
    name: "Swap Master",
    description: "10 échanges réussis. Le troc n'a plus de secret pour vous.",
    icon: "Zap",
    xpReward: 500,
  },
];


async function main() {
  console.log("Seeding Swaply Global...");

  for (const market of markets) {
    const country = await prisma.country.upsert({
      where: { code: market.country.code },
      update: {
        name: market.country.name,
        defaultLanguage: market.country.defaultLanguage,
        isActive: true,
      },
      create: {
        code: market.country.code,
        name: market.country.name,
        defaultLanguage: market.country.defaultLanguage,
      },
    });

    const city = await prisma.city.upsert({
      where: {
        countryId_slug: {
          countryId: country.id,
          slug: market.city.slug,
        },
      },
      update: {
        name: market.city.name,
        lat: market.city.lat,
        lng: market.city.lng,
        isActive: true,
      },
      create: {
        countryId: country.id,
        name: market.city.name,
        slug: market.city.slug,
        lat: market.city.lat,
        lng: market.city.lng,
      },
    });

    for (const zoneData of market.zones) {
      await prisma.zone.upsert({
        where: {
          cityId_slug: {
            cityId: city.id,
            slug: slugify(zoneData.name),
          },
        },
        update: {
          name: zoneData.name,
          lat: zoneData.lat,
          lng: zoneData.lng,
          isActive: true,
        },
        create: {
          cityId: city.id,
          name: zoneData.name,
          slug: slugify(zoneData.name),
          lat: zoneData.lat,
          lng: zoneData.lng,
        },
      });
    }

    for (const pointData of market.meetingPoints) {
      const zone = await prisma.zone.findFirst({
        where: {
          cityId: city.id,
          slug: slugify(pointData.zone),
        },
        select: { id: true },
      });

      const existingPoint = await prisma.meetingPoint.findFirst({
        where: {
          cityId: city.id,
          name: pointData.name,
        },
        select: { id: true },
      });

      if (existingPoint) {
        await prisma.meetingPoint.update({
          where: { id: existingPoint.id },
          data: {
            countryId: country.id,
            cityId: city.id,
            zoneId: zone?.id ?? null,
            description: pointData.description,
            lat: pointData.lat,
            lng: pointData.lng,
            isActive: true,
          },
        });
        continue;
      }

      await prisma.meetingPoint.create({
        data: {
          countryId: country.id,
          cityId: city.id,
          zoneId: zone?.id ?? null,
          name: pointData.name,
          description: pointData.description,
          lat: pointData.lat,
          lng: pointData.lng,
        },
      });
    }

    for (const providerData of market.providers) {
      const provider = await prisma.paymentProvider.upsert({
        where: {
          countryId_code: {
            countryId: country.id,
            code: providerData.code,
          },
        },
        update: {
          name: providerData.name,
          isActive: true,
        },
        create: {
          countryId: country.id,
          code: providerData.code,
          name: providerData.name,
        },
      });

      await prisma.topupPackage.deleteMany({
        where: {
          paymentProviderId: provider.id,
        },
      });

      await prisma.topupPackage.createMany({
        data: providerData.packages.map((pkg) => ({
          paymentProviderId: provider.id,
          countryId: country.id,
          localAmount: pkg.localAmount,
          currencyCode: pkg.currencyCode,
          swapsAmount: pkg.swapsAmount,
          isActive: true,
        })),
      });
    }

    console.log(`Seeded ${country.name} / ${city.name}`);
  }

  console.log("Seeding Achievements...");
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xpReward,
      },
      create: {
        code: ach.code,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xpReward,
      },
    });
  }

  console.log("Seed completed.");

}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
