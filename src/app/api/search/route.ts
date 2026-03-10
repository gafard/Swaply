import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { presentItem } from "@/lib/item-presenter";

export async function GET(request: NextRequest) {
  try {
    const identifier = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(identifier, "search");

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Trop de requêtes. Réessayez dans ${Math.ceil(rateLimit.resetIn / 1000)}s` },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const country = searchParams.get("country") || "";
    const city = searchParams.get("city") || "";
    const zone = searchParams.get("zone") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const status = searchParams.get("status") || "AVAILABLE";
    const cursor = searchParams.get("cursor");
    const take = parseInt(searchParams.get("take") || "12", 10);

    const where: any = { status: status as any };

    // Country filter (multi-country support)
    if (country) {
      const matchedCountry = await prisma.country.findFirst({
        where: {
          OR: [{ code: country }, { name: country }],
        },
        select: { id: true },
      });

      if (matchedCountry) {
        where.countryId = matchedCountry.id;
      }
    }

    // City filter
    if (city) {
      const matchedCity = await prisma.city.findFirst({
        where: {
          OR: [{ name: city }, { slug: city.toLowerCase() }],
          ...(where.countryId ? { countryId: where.countryId } : {}),
        },
        select: { id: true },
      });

      if (matchedCity) {
        where.cityId = matchedCity.id;
      }
    }

    // Zone filter
    if (zone) {
      const matchedZone = await prisma.zone.findFirst({
        where: {
          OR: [{ name: zone }, { slug: zone.toLowerCase() }],
          ...(where.cityId ? { cityId: where.cityId } : {}),
        },
        select: { id: true },
      });

      if (matchedZone) {
        where.zoneId = matchedZone.id;
      }
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.priceSwaps = {};
      if (minPrice) where.priceSwaps.gte = parseInt(minPrice, 10);
      if (maxPrice) where.priceSwaps.lte = parseInt(maxPrice, 10);
    }

    let cursorOption = {};
    if (cursor) {
      cursorOption = { skip: 1, cursor: { id: cursor } };
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        owner: { select: { username: true, trustScore: true } },
        city: { select: { name: true } },
        zone: { select: { name: true } },
        metric: true,
        images: { orderBy: { orderIndex: "asc" }, take: 1 },
      },
      orderBy: [{ createdAt: "desc" }],
      take: take + 1,
      ...cursorOption,
    });

    let nextCursor: string | null = null;
    if (items.length > take) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id || null;
    }

    return NextResponse.json({
      items: items.map(presentItem),
      nextCursor,
      hasMore: !!nextCursor,
      count: items.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche" }, { status: 500 });
  }
}
