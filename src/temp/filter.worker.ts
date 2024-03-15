self.addEventListener("message", (e) => {
  const { x0, y0, blockSize, radius, kernel, orgData, width, height } =
    e.data as {
      x0: number;
      y0: number;
      blockSize: number;
      radius: number;
      kernel: number[][];
      orgData: ImageData;
      width: number;
      height: number;
    };
  const dstData = new ImageData(blockSize, blockSize);

  for (let y = 0; y < blockSize; y++) {
    for (let x = 0; x < blockSize; x++) {
      let [r, g, b, a] = [0, 0, 0, 0];

      for (let ky = -radius; ky <= radius; ky++) {
        const offsetY = Math.max(0, Math.min(y0 + y + ky, height - 1));
        const yi = ky + radius;

        for (let kx = -radius; kx <= radius; kx++) {
          const offsetX = Math.max(0, Math.min(x0 + x + kx, width - 1));
          const xi = kx + radius;
          const index = (offsetY * width + offsetX) * 4;

          r += orgData.data[index] * kernel[yi][xi];
          g += orgData.data[index + 1] * kernel[yi][xi];
          b += orgData.data[index + 2] * kernel[yi][xi];
          a += orgData.data[index + 3] * kernel[yi][xi];
        }
      }

      const index = (y * blockSize + x) * 4;
      dstData.data[index] = Math.min(r, 255);
      dstData.data[index + 1] = Math.min(g, 255);
      dstData.data[index + 2] = Math.min(b, 255);
      dstData.data[index + 3] = Math.min(a, 255);
    }
  }
  self.postMessage(dstData);
});

export default {};
