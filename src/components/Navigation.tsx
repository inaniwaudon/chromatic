import type { ChromaticOptions, VinettingOptions } from "../lib/filter";
import type { Point, PointRange } from "../lib/utils";
import styles from "./Navigation.module.css";

interface NavigationProps {
  chromaticOptions: ChromaticOptions;
  vinettingOptions: VinettingOptions;
  crop: number;
  aspect: Point;
  setChromaticOptions: (value: ChromaticOptions) => void;
  setVinettingOptions: (value: VinettingOptions) => void;
  setCrop: (value: number) => void;
  setAspect: (value: Point) => void;
  setPoint: (value: PointRange) => void;
  loadPhoto: (value: React.ChangeEvent<HTMLInputElement>) => void;
  draw: (noFilter: boolean) => void;
  output: () => void;
}

export const Navigation = ({
  chromaticOptions,
  vinettingOptions,
  crop,
  aspect,
  setChromaticOptions,
  setVinettingOptions,
  setCrop,
  setPoint,
  setAspect,
  loadPhoto,
  draw,
  output,
}: NavigationProps) => {
  return (
    <nav className={styles.nav}>
      <div className={styles.navGroup}>
        <h3 className={styles.h3}>画像読み込み</h3>
        <div>
          <input type="file" accept="image/*" onChange={loadPhoto} />
        </div>
      </div>
      <div className={styles.navGroup}>
        <h3 className={styles.h3}>フィルタ</h3>
        <div>
          色収差：
          <label>
            ずれ{" "}
            <input
              type="number"
              className={styles.inputNumber}
              value={chromaticOptions.shift}
              step={0.02}
              onChange={(e) =>
                setChromaticOptions({
                  ...chromaticOptions,
                  shift: parseFloat(e.currentTarget.value),
                })
              }
            />{" "}
            %
          </label>
          、
          <label>
            ぼかし{" "}
            <input
              type="number"
              className={styles.inputNumber}
              value={chromaticOptions.blur}
              step={0.02}
              onChange={(e) =>
                setChromaticOptions({
                  ...chromaticOptions,
                  blur: parseFloat(e.currentTarget.value),
                })
              }
            />{" "}
            %
          </label>
        </div>
        <div>
          周辺減光：
          <label>
            太さ{" "}
            <input
              type="number"
              className={styles.inputNumber}
              value={vinettingOptions.width}
              onChange={(e) =>
                setVinettingOptions({
                  ...vinettingOptions,
                  width: parseFloat(e.currentTarget.value),
                })
              }
            />{" "}
            %
          </label>
          、
          <label>
            透明度{" "}
            <input
              type="number"
              className={styles.inputNumber}
              value={vinettingOptions.opacity}
              onChange={(e) =>
                setVinettingOptions({
                  ...vinettingOptions,
                  opacity: parseFloat(e.currentTarget.value),
                })
              }
            />{" "}
            %
          </label>
          、
          <label>
            ぼかし
            <input
              type="number"
              className={styles.inputNumber}
              value={vinettingOptions.blur}
              onChange={(e) =>
                setVinettingOptions({
                  ...vinettingOptions,
                  blur: parseFloat(e.currentTarget.value),
                })
              }
            />
            %
          </label>
        </div>
        <div>
          適用範囲：ドラッグで変更{" "}
          <input
            type="button"
            value="リセット"
            onClick={() => setPoint({ from: undefined, to: undefined })}
          />
        </div>
      </div>
      <div className={styles.navGroup}>
        <h3 className={styles.h3}>サイズ変更</h3>
        <div>
          <label>
            クロップ{" "}
            <input
              type="number"
              className={styles.inputNumber}
              value={crop}
              onChange={(e) => setCrop(parseFloat(e.currentTarget.value))}
            />{" "}
            %
          </label>
        </div>
        <div>
          アスペクト比{" "}
          <input
            type="number"
            className={styles.inputNumber}
            value={aspect[0]}
            onChange={(e) =>
              setAspect([parseFloat(e.currentTarget.value), aspect[1]])
            }
          />{" "}
          :{" "}
          <input
            type="number"
            className={styles.inputNumber}
            value={aspect[1]}
            onChange={(e) =>
              setAspect([aspect[0], parseFloat(e.currentTarget.value)])
            }
          />{" "}
        </div>
      </div>
      <div className={styles.navGroup}>
        <div>
          <input type="button" value="元画像" onClick={() => draw(true)} />{" "}
          <input type="button" value="プレビュー" onClick={() => draw(false)} />{" "}
          <input type="button" value="原寸大で出力" onClick={output} />
        </div>
      </div>
      <p>
        <a href="https://github.com/inaniwaudon/chromatic">GitHub</a>
      </p>
    </nav>
  );
};
