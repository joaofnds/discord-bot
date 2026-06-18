import { Jimp } from "jimp";
import { Buffer } from "node:buffer";

export interface Slicer {
  reslice(bytes: Uint8Array, order: number[]): Promise<Uint8Array>;
}

export class JimpSlicer implements Slicer {
  async reslice(bytes: Uint8Array, order: number[]): Promise<Uint8Array> {
    const image = await Jimp.fromBuffer(Buffer.from(bytes));
    const halfWidth = Math.floor(image.bitmap.width / 2);
    const halfHeight = Math.floor(image.bitmap.height / 2);

    const cells = [
      { x: 0, y: 0 },
      { x: halfWidth, y: 0 },
      { x: 0, y: halfHeight },
      { x: halfWidth, y: halfHeight },
    ];

    const quadrants = cells.map((cell) =>
      image.clone().crop({ x: cell.x, y: cell.y, w: halfWidth, h: halfHeight })
    );

    const output = new Jimp({ width: halfWidth * 2, height: halfHeight * 2 });
    order.forEach((source, position) => {
      output.blit({
        src: quadrants[source],
        x: cells[position].x,
        y: cells[position].y,
      });
    });

    return await output.getBuffer("image/png");
  }
}
