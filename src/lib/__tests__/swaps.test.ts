import { describe, it, expect, vi, beforeEach } from "vitest";
import { addSwaps, deductSwaps, grantWelcomeBonus } from "../swaps";
import prisma from "../prisma";
import { WalletTxnType } from "@prisma/client";

vi.mock("../prisma", () => ({
  default: {
    wallet: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    walletTransaction: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe("swaps economy engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addSwaps", () => {
    it("should return null if amount is <= 0", async () => {
      const result = await addSwaps("user-1", 0, WalletTxnType.TOPUP);
      expect(result).toBeNull();
      expect(prisma.wallet.upsert).not.toHaveBeenCalled();
    });

    it("should increment regular balanceSwaps when isPromo is false", async () => {
      (prisma.wallet.upsert as any).mockResolvedValue({ id: "wallet-1", balanceSwaps: 10, promoSwaps: 0 });
      (prisma.wallet.update as any).mockResolvedValue({ id: "wallet-1", balanceSwaps: 30 });
      (prisma.walletTransaction.create as any).mockResolvedValue({ id: "txn-1", amount: 20, promoAmount: 0 });

      const result = await addSwaps("user-1", 20, WalletTxnType.TOPUP, "Recharge", false);

      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: "wallet-1" },
        data: { balanceSwaps: { increment: 20 } },
      });
      expect(prisma.walletTransaction.create).toHaveBeenCalledWith({
        data: {
          walletId: "wallet-1",
          type: WalletTxnType.TOPUP,
          amount: 20,
          promoAmount: 0,
          description: "Recharge",
          referenceId: undefined,
        },
      });
      expect(result).toBeDefined();
    });

    it("should increment promoSwaps when isPromo is true", async () => {
      (prisma.wallet.upsert as any).mockResolvedValue({ id: "wallet-1", balanceSwaps: 10, promoSwaps: 0 });
      (prisma.wallet.update as any).mockResolvedValue({ id: "wallet-1", promoSwaps: 15 });
      (prisma.walletTransaction.create as any).mockResolvedValue({ id: "txn-2", amount: 0, promoAmount: 15 });

      await addSwaps("user-1", 15, WalletTxnType.SIGNUP_BONUS, "Bonus", true);

      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: "wallet-1" },
        data: { promoSwaps: { increment: 15 } },
      });
    });
  });

  describe("deductSwaps", () => {
    it("should throw an error when balance + promo is insufficient", async () => {
      (prisma.wallet.upsert as any).mockResolvedValue({ id: "wallet-1", balanceSwaps: 5, promoSwaps: 5 });

      await expect(
        deductSwaps("user-1", 20, WalletTxnType.EXCHANGE_OUT, "Reservation")
      ).rejects.toThrow("Solde de Swaps insuffisant");
    });

    it("should deduct promoSwaps first, then balanceSwaps", async () => {
      (prisma.wallet.upsert as any).mockResolvedValue({ id: "wallet-1", balanceSwaps: 30, promoSwaps: 10 });
      (prisma.wallet.update as any).mockResolvedValue({ id: "wallet-1", balanceSwaps: 20, promoSwaps: 0 });
      (prisma.walletTransaction.create as any).mockResolvedValue({ id: "txn-3" });

      await deductSwaps("user-1", 20, WalletTxnType.EXCHANGE_OUT, "Reservation");

      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: "wallet-1" },
        data: {
          promoSwaps: { decrement: 10 },
          balanceSwaps: { decrement: 10 },
        },
      });
    });
  });

  describe("grantWelcomeBonus", () => {
    it("should return null if signup bonus transaction already exists", async () => {
      (prisma.wallet.findUnique as any).mockResolvedValue({ id: "wallet-1" });
      (prisma.walletTransaction.findFirst as any).mockResolvedValue({ id: "existing-bonus" });

      const result = await grantWelcomeBonus("user-1");
      expect(result).toBeNull();
      expect(prisma.wallet.update).not.toHaveBeenCalled();
    });
  });
});
