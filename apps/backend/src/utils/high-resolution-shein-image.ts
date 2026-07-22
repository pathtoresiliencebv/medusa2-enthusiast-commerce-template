const SHEIN_IMAGE_HOST = "img.ltwebstatic.com";

export function highResolutionSheinImageUrl(url: string): string;
export function highResolutionSheinImageUrl(
  url?: null | undefined,
): null | undefined;
export function highResolutionSheinImageUrl(url?: string | null) {
  if (!url) return url;

  try {
    const imageUrl = new URL(url);
    if (imageUrl.hostname !== SHEIN_IMAGE_HOST) return url;

    imageUrl.pathname = imageUrl.pathname.replace(
      /_(?:square_)?thumbnail_[^./]+(?=\.[^.]+$)/,
      "",
    );

    return imageUrl.toString();
  } catch {
    return url;
  }
}
