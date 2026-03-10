import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...");

  // Clean DB
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.exchange.deleteMany();
  await prisma.item.deleteMany();
  await prisma.meetingPoint.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Meeting Points in Lomé
  const meetingPoints = await Promise.all([
    prisma.meetingPoint.create({
      data: { 
        name: "Campus Université de Lomé", 
        zone: "Nord", 
        description: "En face de la bibliothèque centrale.",
        lat: 6.1750,
        lng: 1.2167
      }
    }),
    prisma.meetingPoint.create({
      data: { 
        name: "Adidogomé Assiyéyé", 
        zone: "Ouest", 
        description: "Près de l'entrée principale.",
        lat: 6.1833,
        lng: 1.1667
      }
    }),
    prisma.meetingPoint.create({
      data: { 
        name: "Déckon (Centre-ville)", 
        zone: "Centre", 
        description: "Boulevard Circulaire, devant la Poste.",
        lat: 6.1333,
        lng: 1.2167
      }
    })
  ]);

  // 2. Create sample users
  const alice = await prisma.user.create({
    data: {
      username: "Alice",
      email: "alice@example.com",
      credits: 200,
      trustScore: 5
    }
  });

  const bob = await prisma.user.create({
    data: {
      username: "Bob",
      email: "bob@example.com",
      credits: 50,
      trustScore: 8
    }
  });

  const charlie = await prisma.user.create({
    data: {
      username: "Charlie",
      email: "charlie@example.com",
      credits: 100,
      trustScore: 2
    }
  });

  // 3. Create sample Items
  const items = await Promise.all([
    prisma.item.create({
      data: {
        title: "Casque Bluetooth JBL",
        description: "Très bon état, son impeccable. Utilisé pendant 6 mois.",
        creditValue: 100,
        locationZone: "Nord",
        ownerId: alice.id,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
        status: "AVAILABLE",
      }
    }),
    prisma.item.create({
      data: {
        title: "Livre d'Architecture Moderne",
        description: "Livre de poche, quelques marques d'usure mais complet.",
        creditValue: 20,
        locationZone: "Centre",
        ownerId: alice.id,
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop",
        status: "AVAILABLE",
      }
    }),
    prisma.item.create({
      data: {
        title: "Sac à dos Targus Elite",
        description: "Idéal pour laptop 15 pouces. Rangement spacieux.",
        creditValue: 100,
        locationZone: "Ouest",
        ownerId: bob.id,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1974&auto=format&fit=crop",
        status: "AVAILABLE",
      }
    }),
    prisma.item.create({
      data: {
        title: "Moniteur Dell 24 pouces",
        description: "Parfait pour le télétravail. Résolution 1080p.",
        creditValue: 300,
        locationZone: "Centre",
        ownerId: charlie.id,
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop",
        status: "RESERVED",
        reservedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })
  ]);

  // 4. Create an active Exhange for the Custom Monitor
  const exchange = await prisma.exchange.create({
    data: {
      itemId: items[3].id,
      requesterId: alice.id,
      ownerId: charlie.id,
      status: "PENDING",
      meetingPointId: meetingPoints[2].id
    }
  });

  // Create messages
  await prisma.message.createMany({
    data: [
      { exchangeId: exchange.id, senderId: alice.id, content: "Bonjour Charlie ! Je suis intéressée par ton écran." },
      { exchangeId: exchange.id, senderId: charlie.id, content: "Salut Alice ! D'accord, on peut se retrouver à Déckon demain ?" },
      { exchangeId: exchange.id, senderId: alice.id, content: "Super ! Je valide la réservation." }
    ]
  });

  console.log("✅ Seed finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
