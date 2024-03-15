export type Point = [number, number];

/**
 * 画像を読み込む
 */
export const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject();
    };
  });
};

/**
 * 比率を保ったまま最大サイズまで縮小する
 */
export const resize = (width: number, height: number, maxSize: number) => {
  if (width > height) {
    return Math.min(maxSize / width, 1.0);
  }
  return Math.min(maxSize / height, 1.0);
};
