import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import WalletClient from "@/components/wallet/WalletClient";
import { getTopupPackagesByCountry } from "@/lib/geo.server";

export default async function WalletPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!wallet) return null;

  const topupPackages = await getTopupPackagesByCountry(user.countryId);

  return (
    <WalletClient
      userData={{
        ...user,
        swaps: wallet.balanceSwaps,
        promoSwaps: wallet.promoSwaps,
        availableSwaps: wallet.balanceSwaps + wallet.promoSwaps,
        transactions: wallet.transactions,
        countryName: user.country?.name ?? null,
        countryCode: user.country?.code ?? null,
        cityName: user.city?.name ?? null,
        zoneName: user.zone?.name ?? null,
      }}
      topupPackages={topupPackages}
    />
  );
}
