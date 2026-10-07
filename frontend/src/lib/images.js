export function imageSrcSet(image) {
  const candidates = new Map();
  for (const variant of image?.variants || []) {
    if (variant.url && variant.width > 0)
      candidates.set(variant.width, variant.url);
  }
  return (
    [...candidates]
      .sort(([a], [b]) => a - b)
      .map(([width, url]) => `${url} ${width}w`)
      .join(", ") || undefined
  );
}
