const thumbnailTokens = [
  /_square_thumbnail_\d+x\d+/gi,
  /_thumbnail_\d+x\d+/gi,
  /_thumbnail_[a-z0-9]+/gi,
];

export const sourceOriginalImageUrl = (url: string) =>
  thumbnailTokens.reduce((result, token) => result.replace(token, ""), url);

export const sourceGalleryFor = (product: {
  image?: string | null;
  images?: string[] | null;
  gallery?: string[] | null;
}) => {
  const candidates = [
    ...(Array.isArray(product.gallery) ? product.gallery : []),
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
  ].filter((url): url is string => Boolean(url));

  return Array.from(
    new Set(candidates.map(sourceOriginalImageUrl).filter(Boolean)),
  );
};
