export default function getCanvasImage(canvas: HTMLCanvasElement): Buffer {
  // Get data URL and remove starting marker
  const dataUrl = canvas.toDataURL();
  const dataMarker = 'data:image/png;base64,';
  const imageData = dataUrl.slice(dataUrl.indexOf(dataMarker) + dataMarker.length);

  // Create buffer from base64-encoded image data
  return Buffer.from(imageData, 'base64');
}
