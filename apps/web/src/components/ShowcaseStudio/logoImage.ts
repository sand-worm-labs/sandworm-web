// The studio's logo upload: whatever image the person picks, as the 256px PNG the API stores.
// It is done here, in the browser, so the API takes no image library and a large photo
// never travels.
export const LOGO_SIZE = 256;

// Fits the image inside the square, keeping its shape, and leaves the rest clear.
export async function toLogoPng(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const scale = Math.min(
      LOGO_SIZE / image.naturalWidth,
      LOGO_SIZE / image.naturalHeight
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot resize images");
    context.drawImage(image, 0, 0, width, height);

    // "data:image/png;base64,....": the API wants what follows the comma.
    return canvas.toDataURL("image/png").split(",")[1] ?? "";
  } catch {
    throw new Error("That file could not be read as an image");
  } finally {
    URL.revokeObjectURL(url);
  }
}
