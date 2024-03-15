/**
 * ガウシアンカーネルを生成する
 */
/*const createKernel = (radius: number) => {
  const kernel: number[][] = [];
  const sigma = radius / 3;
  const coefficient = 1 / (2 * Math.PI * sigma ** 2);

  for (let y = -radius; y <= radius; y++) {
    const row: number[] = [];
    for (let x = -radius; x <= radius; x++) {
      const value =
        coefficient * Math.exp(-(x ** 2 + y ** 2) / (2 * sigma ** 2));
      row.push(value);
    }
    kernel.push(row);
  }
  return kernel;
};*/

/**
 * ガウシアンぼかしを適用する
 */
/*export const applyGaussianBlur = async (
  context: CanvasRenderingContext2D,
  radius: number,
  width: number,
  height: number
) => {
  const orgData = context.getImageData(0, 0, width, height);

  const newCanvas = document.createElement("canvas");
  newCanvas.width = width;
  newCanvas.height = height;
  const newContext = newCanvas.getContext("2d");
  if (!newContext || radius <= 1) {
    return;
  }

  const kernel = createKernel(radius);
  const blockSize = newCanvas.width / 4;

  const process = (x0: number, y0: number) =>
    new Promise<void>((resolve) => {
      const worker = new filterWorker();
      worker.onmessage = (e) => {
        const { data } = e.data;
        newContext.putImageData(data, x0, y0);
        worker.terminate();
        resolve();
      };
      worker.postMessage({
        x0,
        y0,
        blockSize,
        radius,
        kernel,
        orgData,
        width,
        height,
      });
    });

  const promises: Promise<void>[] = [];
  for (let y0 = 0; y0 < height; y0 += blockSize) {
    for (let x0 = 0; x0 < width; x0 += blockSize) {
      promises.push(process(x0, y0));
    }
  }
  await Promise.all(promises);
};*/
