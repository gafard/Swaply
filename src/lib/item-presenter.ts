type PresentedImage = {
  url: string;
  order: number;
};

export function presentItem(item: any) {
  const images: PresentedImage[] = Array.isArray(item?.images)
    ? item.images.map((image: any, index: number) => ({
        url: image.url,
        order: image.orderIndex ?? image.order ?? index,
      }))
    : [];

  return {
    ...item,
    creditValue: item?.creditValue ?? item?.priceSwaps ?? 0,
    views: item?.views ?? item?.metric?.totalViews ?? 0,
    uniqueViews: item?.uniqueViews ?? item?.metric?.uniqueViews ?? 0,
    favoritesCount:
      item?.favoritesCount ??
      item?.metric?.favoritesCount ??
      item?._count?.wishlistMatches ??
      0,
    reportsCount: item?.reportsCount ?? item?.metric?.reportsCount ?? 0,
    locationZone:
      item?.locationZone ??
      item?.zone?.name ??
      item?.city?.name ??
      "Zone inconnue",
    images,
    createdAt: item?.createdAt ? new Date(item.createdAt).toISOString() : undefined,
    updatedAt: item?.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
  };
}
