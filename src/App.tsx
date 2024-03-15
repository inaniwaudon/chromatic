import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./App.module.css";
import { Navigation } from "./components/Navigation";
import {
  type ChromaticOptions,
  FilterCanvas,
  type VinettingOptions,
} from "./lib/filter";
import {
  type Point,
  type PointRange,
  getAspect,
  loadImage,
  resize,
} from "./lib/utils";

const App = () => {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<HTMLImageElement>();
  const [crop, setCrop] = useState<number>(0);
  const [aspect, setAspect] = useState<[number, number]>([1, 1]);
  const [chromaticOptions, setChromaticOptions] = useState<ChromaticOptions>({
    shift: 0.2,
    blur: 0.2,
  });
  const [vinettingOptions, setVinettingOptions] = useState<VinettingOptions>({
    width: 1,
    opacity: 0.8,
    blur: 2,
  });

  const [point, setPoint] = useState<PointRange>({});
  const [hasUp, setHasUp] = useState(false);
  const [canvasSize, setCanvasSize] = useState<Point>([0, 0]);

  const drawInternally = useCallback(
    async (
      newImage: HTMLImageElement,
      newAspect: Point,
      output: boolean,
      noFilter: boolean,
    ) => {
      const canvas = mainCanvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context || !newImage) {
        alert("描画に失敗しました");
        return;
      }

      const imgWidth = newImage.naturalWidth;
      const imgHeight = newImage.naturalHeight;

      // リサイズ
      const MAX_SIZE = 1000;
      const scale = output ? 1.0 : resize(imgWidth, imgHeight, MAX_SIZE);

      try {
        const filterCanvas = new FilterCanvas(newImage, scale);
        if (!noFilter) {
          filterCanvas.applyAberration(chromaticOptions.shift);
          filterCanvas.applyGaussianBlur(chromaticOptions.blur);
          filterCanvas.applyVinetting(vinettingOptions);
        }
        const output = filterCanvas.output(
          point,
          crop,
          getAspect(newAspect[0], newAspect[1]),
        );
        canvas.width = output.width;
        canvas.height = output.height;
        setCanvasSize([output.width, output.height]);
        context.drawImage(output, 0, 0);
        return canvas;
      } catch (e) {
        alert("描画に失敗しました");
        console.log(e);
        return;
      }
    },
    [chromaticOptions, vinettingOptions, point, crop],
  );

  const draw = (noFilter: boolean) => {
    if (!image) {
      alert("画像が読み込まれていません");
      return;
    }
    drawInternally(image, aspect, false, noFilter);
  };

  const output = useCallback(async () => {
    if (!image) {
      alert("画像が読み込まれていません");
      return;
    }
    const canvas = await drawInternally(image, aspect, true, false);
    if (!canvas) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/jpeg", 1.0);
    anchor.download = "output.jpg";
    anchor.click();
  }, [drawInternally, image, aspect]);

  const loadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      const tempImage = await loadImage(file);
      const tempAspect = getAspect(
        tempImage.naturalWidth,
        tempImage.naturalHeight,
      );
      setImage(tempImage);
      setAspect(tempAspect);
      drawInternally(tempImage, tempAspect, false, false);
    } else {
      alert("画像の読込に失敗しました");
    }
  };

  // イベントハンドラ
  const onMouseDown = (e: React.MouseEvent) => {
    if (!mainCanvasRef.current) {
      return;
    }
    const rect = mainCanvasRef.current.getBoundingClientRect();
    const x = (e.pageX - rect.left) / rect.width;
    const y = (e.pageY - rect.top) / rect.height;

    setPoint({ from: [x, y] });
    setHasUp(false);
  };

  const onMouseMoveUp = (e: React.MouseEvent, up: boolean) => {
    if (!mainCanvasRef.current || hasUp) {
      return;
    }
    const rect = mainCanvasRef.current.getBoundingClientRect();
    const x = (e.pageX - rect.left) / rect.width;
    const y = (e.pageY - rect.top) / rect.height;

    if (point.from) {
      setPoint({
        ...point,
        to: [x, y],
      });
    }
    if (up) {
      setHasUp(true);
    }
  };

  // biome-ignore lint: 画像読み込み時（初回）のみ実行
  useEffect(() => {
    (async () => {
      const tempImage = await loadImage("/DSCF1408.webp");
      const tempAspect = getAspect(
        tempImage.naturalWidth,
        tempImage.naturalHeight,
      );
      setImage(tempImage);
      setAspect(getAspect(tempImage.naturalWidth, tempImage.naturalHeight));
      drawInternally(tempImage, tempAspect, false, true);
    })();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <div
          className={styles.canvasWrapper}
          style={{ aspectRatio: `${canvasSize[0]}/${canvasSize[1]}` }}
          onMouseDown={onMouseDown}
          onMouseMove={(e) => onMouseMoveUp(e, false)}
          onMouseUp={(e) => onMouseMoveUp(e, true)}
        >
          <svg
            viewBox={`0 0 ${canvasSize[0]} ${canvasSize[1]}`}
            preserveAspectRatio="none"
            className={styles.operations}
          >
            {point.from && point.to && (
              <line
                className={styles.line}
                x1={point.from[0] * canvasSize[0]}
                y1={point.from[1] * canvasSize[1]}
                x2={point.to[0] * canvasSize[0]}
                y2={point.to[1] * canvasSize[1]}
                strokeWidth={canvasSize[0] * 0.005}
              />
            )}
            {point.from && (
              <circle
                cx={point.from[0] * canvasSize[0]}
                cy={point.from[1] * canvasSize[1]}
                r={canvasSize[0] * 0.01}
                className={styles.circle}
              />
            )}
            {point.to && (
              <circle
                cx={point.to[0] * canvasSize[0]}
                cy={point.to[1] * canvasSize[1]}
                r={canvasSize[0] * 0.01}
                className={styles.circle}
              />
            )}
          </svg>
          <canvas className={styles.mainCanvas} ref={mainCanvasRef} />
        </div>
      </div>
      <Navigation
        chromaticOptions={chromaticOptions}
        vinettingOptions={vinettingOptions}
        crop={crop}
        aspect={aspect}
        setChromaticOptions={setChromaticOptions}
        setVinettingOptions={setVinettingOptions}
        setPoint={setPoint}
        setCrop={setCrop}
        setAspect={setAspect}
        loadPhoto={loadPhoto}
        draw={(noFilter) => draw(noFilter)}
        output={output}
      />
    </div>
  );
};

export default App;
