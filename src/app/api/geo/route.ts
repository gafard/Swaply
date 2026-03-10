import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getGeoCatalog } from "@/lib/geo.server";

export async function GET() {
  const [countries, user] = await Promise.all([
    getGeoCatalog(),
    getCurrentUser(),
  ]);

  return NextResponse.json({
    countries,
    currentLocation: user
      ? {
          countryId: user.countryId,
          cityId: user.cityId,
          zoneId: user.zoneId,
          countryCode: user.country?.code ?? null,
          countryName: user.country?.name ?? null,
          cityName: user.city?.name ?? null,
          zoneName: user.zone?.name ?? null,
        }
      : null,
  });
}
