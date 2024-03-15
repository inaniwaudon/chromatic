export type Point = [number, number];
export type PointRange = { from?: Point; to?: Point };

/**
 * 画像を読み込む
 */
export const loadImage = async (src: string | File) => {
  let url: string;

  if (src instanceof File) {
    url = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(src);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject();
      };
    });
  } else {
    url = src;
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.src = url;
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

/**
 * アスペクト比を算出する
 */
export const getAspect = (width: number, height: number): Point => {
  if (width === height) {
    return [1, 1];
  }
  const gcd = (x: number, y: number): number => (x % y ? gcd(y, x % y) : y);
  const aspectGcd = gcd(width, height);
  return [width / aspectGcd, height / aspectGcd];
};
