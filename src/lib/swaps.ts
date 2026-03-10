import { Prisma, WalletTxnType } from "@prisma/client";
import prisma from "./prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;

async function ensureWallet(userId: string, db: DbClient) {
  return db.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function addSwaps(
  userId: string,
  amount: number,
  type: WalletTxnType,
  description?: string,
  isPromo: boolean = false,
  tx?: Prisma.TransactionClient,
  referenceId?: string
) {
  if (amount <= 0) {
    return null;
  }

  const db = tx ?? prisma;
  const wallet = await ensureWallet(userId, db);

  await db.wallet.update({
    where: { id: wallet.id },
    data: isPromo
      ? {
          promoSwaps: { increment: amount },
        }
      : {
          balanceSwaps: { increment: amount },
        },
  });

  return db.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type,
      amount: isPromo ? 0 : amount,
      promoAmount: isPromo ? amount : 0,
      description,
      referenceId,
    },
  });
}

export async function deductSwaps(
  userId: string,
  amount: number,
  type: WalletTxnType,
  description?: string,
  tx?: Prisma.TransactionClient,
  referenceId?: string
) {
  if (amount <= 0) {
    return null;
  }

  const db = tx ?? prisma;
  const wallet = await ensureWallet(userId, db);

  if (wallet.balanceSwaps + wallet.promoSwaps < amount) {
    throw new Error("Solde de Swaps insuffisant");
  }

  const promoToDeduct = Math.min(wallet.promoSwaps, amount);
  const regularToDeduct = amount - promoToDeduct;

  await db.wallet.update({
    where: { id: wallet.id },
    data: {
      promoSwaps: { decrement: promoToDeduct },
      balanceSwaps: { decrement: regularToDeduct },
    },
  });

  return db.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type,
      amount: -regularToDeduct,
      promoAmount: -promoToDeduct,
      description,
      referenceId,
    },
  });
}

export async function grantWelcomeBonus(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!wallet) {
    await ensureWallet(userId, prisma);
  }

  const existing = await prisma.walletTransaction.findFirst({
    where: {
      wallet: { userId },
      type: WalletTxnType.SIGNUP_BONUS,
    },
  });

  if (existing) {
    return null;
  }

  return addSwaps(
    userId,
    35,
    WalletTxnType.SIGNUP_BONUS,
    "Bonus de bienvenue Swaply",
    true
  );
}
