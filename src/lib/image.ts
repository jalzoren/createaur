const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const TARGET_SIZE = 256;

const JPG_QUALITY = 0.85;

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode the image.'));
    img.src = src;
  });
}

/** Center-crop to a square, downscale to 256x256, and encode to a data URL. */
function drawCover(img: HTMLImageElement, preferPng: boolean): string {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img.src;

  const scale = Math.max(TARGET_SIZE / w, TARGET_SIZE / h);
  const sw = TARGET_SIZE / scale;
  const sh = TARGET_SIZE / scale;
  const sx = (w - sw) / 2;
  const sy = (h - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_SIZE, TARGET_SIZE);

  const hasAlpha = preferPng || pixelHasAlpha(ctx);
  return canvas.toDataURL(hasAlpha ? 'image/png' : 'image/jpeg', JPG_QUALITY);
}

function pixelHasAlpha(ctx: CanvasRenderingContext2D): boolean {
  const data = ctx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE).data;
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i];
    if (a !== undefined && a < 255) return true;
  }
  return false;
}

/**
 * Read an uploaded image file, center-crop it to a square, downscale it to
 * 256x256 and return a data URL. JPEG (q .85) unless the source has alpha.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('Image is larger than 10 MB.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image file.');
  }
  const src = await readAsDataUrl(file);
  const img = await loadImage(src);
  return drawCover(img, file.type === 'image/png');
}

/**
 * Fetch a remote URL and convert it to a 256px data URL. Throws when the
 * server does not allow CORS or the payload is not a usable image.
 */
export async function urlToAvatarDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('Fetch failed.');
  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) throw new Error('Not an image.');
  if (blob.size > MAX_FILE_BYTES) throw new Error('Image is larger than 10 MB.');

  const src = await readAsDataUrl(blob);
  const img = await loadImage(src);
  // Drawing a non-CORS image would taint the canvas; this also verifies CORS.
  const dataUrl = drawCover(img, blob.type === 'image/png');
  if (dataUrl.length > 400 * 1024) {
    throw new Error('Image too large after processing.');
  }
  return dataUrl;
}