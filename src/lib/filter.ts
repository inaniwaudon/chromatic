import type { Point } from "./utils";

export interface VinettingOptions {
  width: number;
  opacity: number;
  blur: number;
}

export class FilterCanvas {
  private canvas: OffscreenCanvas;
  private filterCanvas: OffscreenCanvas;
  private vinettingCanvas: OffscreenCanvas;

  private context: OffscreenCanvasRenderingContext2D;
  private filterContext: OffscreenCanvasRenderingContext2D;
  private vinettingContext: OffscreenCanvasRenderingContext2D;

  private width: number;
  private height: number;

  constructor(img: HTMLImageElement, scale: number) {
    this.width = Math.round(img.naturalWidth * scale);
    this.height = Math.round(img.naturalHeight * scale);

    // canvas の準備
    this.canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
    this.filterCanvas = new OffscreenCanvas(
      img.naturalWidth,
      img.naturalHeight,
    );
    this.vinettingCanvas = new OffscreenCanvas(
      img.naturalWidth,
      img.naturalHeight,
    );

    const context = this.canvas.getContext("2d");
    const filterContext = this.filterCanvas.getContext("2d");
    const vinettingContext = this.vinettingCanvas.getContext("2d");
    if (!context || !filterContext || !vinettingContext) {
      throw new Error("Failed to getContext");
    }
    this.context = context;
    this.filterContext = filterContext;
    this.vinettingContext = vinettingContext;

    this.context.drawImage(img, 0, 0, this.width, this.height);
    this.filterContext.drawImage(img, 0, 0, this.width, this.height);
  }

  /**
   * 色収差を適用する
   */
  applyAberration(shift: number) {
    const orgData = this.filterContext.getImageData(
      0,
      0,
      this.width,
      this.height,
    );
    const dstData = this.filterContext.createImageData(this.width, this.height);
    const shiftPx = Math.round(this.width * (shift / 100));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const centralIndex = (y * this.width + x) * 4;
        const leftIndex = (y * this.width + x - shiftPx) * 4;
        const rightIndex = (y * this.width + x + shiftPx) * 4;
        const r = orgData.data[leftIndex];
        const g = orgData.data[centralIndex + 1];
        const b = orgData.data[rightIndex + 2];
        dstData.data[centralIndex] = r;
        dstData.data[centralIndex + 1] = g;
        dstData.data[centralIndex + 2] = b;
        dstData.data[centralIndex + 3] = 255;
      }
    }
    this.filterContext.putImageData(dstData, 0, 0);
  }

  /**
   * ガウシアンぼかしを適用する
   */
  applyGaussianBlur(radius: number) {
    applyGaussianBlur(
      this.filterCanvas,
      this.filterContext,
      this.width * (radius / 100),
    );
  }

  /**
   * 周辺減光を適用する
   */
  applyVinetting(options: VinettingOptions) {
    const borderWidth = this.width * (options.width / 100);
    this.vinettingContext.fillStyle = `rgba(0, 0, 0, ${options.opacity})`;
    this.vinettingContext.fillRect(0, 0, this.width, this.height);
    this.vinettingContext.clearRect(
      borderWidth,
      borderWidth,
      this.width - borderWidth * 2,
      this.height - borderWidth * 2,
    );
    applyGaussianBlur(
      this.vinettingCanvas,
      this.vinettingContext,
      this.width * (options.blur / 100),
    );
  }

  /**
   * 出力する
   */
  composite(point: { from?: Point; to?: Point }) {
    const dstCanvas = new OffscreenCanvas(this.width, this.height);
    const dstContext = dstCanvas.getContext("2d");
    if (!dstContext) {
      throw new Error("Failed to getContext");
    }

    const gradientCanvas = new OffscreenCanvas(this.width, this.height);
    const gradientContext = gradientCanvas.getContext("2d");
    if (!gradientContext) {
      throw new Error("Failed to getContext");
    }

    // 合成用グラデーション
    if (point.from && point.to) {
      const fromX = point.from[0] * this.width;
      const fromY = point.from[1] * this.height;
      const toX = point.to[0] * this.width;
      const toY = point.to[1] * this.height;
      const radius = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);

      const gradient = gradientContext.createRadialGradient(
        toX,
        toY,
        0,
        toX,
        toY,
        radius,
      );
      gradient.addColorStop(0, "rgba(0,0,0,1.0)");
      gradient.addColorStop(1.0, "rgba(0,0,0,0");

      gradientContext.fillStyle = gradient;
      gradientContext.beginPath();
      gradientContext.arc(toX, toY, radius, 0, 2 * Math.PI);
      gradientContext.closePath();
      gradientContext.fill();
    }
    gradientContext.globalCompositeOperation = "source-out";
    gradientContext.drawImage(this.filterCanvas, 0, 0);

    dstContext.drawImage(this.canvas, 0, 0);
    dstContext.drawImage(gradientCanvas, 0, 0);
    dstContext.drawImage(this.vinettingCanvas, 0, 0);
    return dstCanvas;
  }
}

/**
 * ガウシアンぼかしを適用する
 */
export const applyGaussianBlur = (
  canvas: OffscreenCanvas,
  context: OffscreenCanvasRenderingContext2D,
  radius: number,
) => {
  const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
  const offscreenContext = offscreen.getContext("2d");
  if (!offscreenContext) {
    return;
  }
  offscreenContext.drawImage(canvas, 0, 0);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.filter = `blur(${radius}px)`;
  context.drawImage(offscreen, 0, 0);
  context.filter = "none";
};
