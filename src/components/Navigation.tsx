import type { VinettingOptions } from "../lib/filter";
import styles from "./Navigation.module.css";

interface NavigationProps {
  shift: number;
  blur: number;
  vinettingOptions: VinettingOptions;
  setShift: (value: number) => void;
  setBlur: (value: number) => void;
  setVinettingOptions: (value: VinettingOptions) => void;
  draw: () => void;
}

export const Navigation = ({
  shift,
  blur,
  vinettingOptions,
  setShift,
  setBlur,
  setVinettingOptions,
  draw,
}: NavigationProps) => {
  return (
    <nav>
      <div>
        <input type="file" accept="image/*" />
      </div>
      <div>
        色収差：
        <label>
          ずれ
          <input
            type="number"
            className={styles.inputNumber}
            value={shift}
            step={0.02}
            onChange={(e) => setShift(parseFloat(e.currentTarget.value))}
          />
          %
        </label>
        <label>
          ぼかし
          <input
            type="number"
            className={styles.inputNumber}
            value={blur}
            step={0.02}
            onChange={(e) => setBlur(parseFloat(e.currentTarget.value))}
          />
          %
        </label>
      </div>
      <div>
        周辺減光：
        <label>
          太さ
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
          />
          %
        </label>
        <label>
          透明度
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
          />
          %
        </label>
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
        <label>
          クロップ
          <input type="number" className={styles.inputNumber} /> %
        </label>
      </div>
      <p>Shift + ドラッグで適用範囲を変更</p>
      <div>
        <input type="button" value="プレビュー" onClick={draw} />
        <input type="button" value="原寸大で出力" onClick={draw} />
      </div>
      <p>
        <a href="https://github.com/inaniwaudon/chromatic">GitHub</a>
      </p>
    </nav>
  );
};
