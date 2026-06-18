import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { Jimp } from "jimp";
import { Buffer } from "node:buffer";
import { JimpSlicer } from "./slicer.ts";

describe(JimpSlicer.name, () => {
  const red = 0xff0000ff;
  const green = 0x00ff00ff;
  const blue = 0x0000ffff;
  const yellow = 0xffff00ff;

  const quadrantColors = [red, green, blue, yellow];

  const source = async () => {
    const image = new Jimp({ width: 4, height: 4 });
    const cells = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
      { x: 2, y: 2 },
    ];
    cells.forEach((cell, index) => {
      for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 2; dy++) {
          image.setPixelColor(quadrantColors[index], cell.x + dx, cell.y + dy);
        }
      }
    });
    return new Uint8Array(await image.getBuffer("image/png"));
  };

  const readQuadrants = async (bytes: Uint8Array) => {
    const image = await Jimp.fromBuffer(Buffer.from(bytes));
    return [
      image.getPixelColor(0, 0),
      image.getPixelColor(2, 0),
      image.getPixelColor(0, 2),
      image.getPixelColor(2, 2),
    ];
  };

  it("keeps quadrants in place for the identity order", async () => {
    const bytes = await new JimpSlicer().reslice(await source(), [0, 1, 2, 3]);

    expect(await readQuadrants(bytes)).toEqual([red, green, blue, yellow]);
  });

  it("rearranges quadrants following the given order", async () => {
    const bytes = await new JimpSlicer().reslice(await source(), [2, 1, 0, 3]);

    expect(await readQuadrants(bytes)).toEqual([blue, green, red, yellow]);
  });
});
