import { useState } from 'react';
import { classNames } from '../../utils';

export interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  /** Used to render a deterministic gradient when the image fails. */
  seed?: string;
  loading?: 'lazy' | 'eager';
}

function fallbackDataUri(seed: string): string {
  const hash = Array.from(seed).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 360,
    7,
  );
  const hue = hash;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue},70%,88%)"/><stop offset="100%" stop-color="hsl(${(hue + 40) % 360},65%,72%)"/></linearGradient></defs><rect width="640" height="640" fill="url(#g)"/><text x="50%" y="52%" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" fill="rgba(0,0,0,0.45)">No image</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Product artwork with a graceful fallback, so a broken or missing remote image
 * never leaves a blank box in the grid.
 */
export function ProductImage({
  src,
  alt,
  className,
  seed = 'product',
  loading = 'lazy',
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc ?? fallbackDataUri(seed)}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setCurrentSrc(fallbackDataUri(seed))}
      className={classNames('h-full w-full object-cover', className)}
    />
  );
}

export default ProductImage;