import { useEffect, useRef, useState } from "react";

import styles from "./App.module.css";
import { Navigation } from "./components/Navigation";
import { FilterCanvas, type VinettingOptions } from "./lib/filter";
import { type Point, loadImage, resize } from "./lib/utils";

const App = () => {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<HTMLImageElement>();
  const [shift, setShift] = useState(0.2);
  const [blur, setBlur] = useState(0.2);
  const [vinettingOptions, setVinettingOptions] = useState<VinettingOptions>({
    width: 1,
    opacity: 0.8,
    blur: 2,
  });
  const [point, setPoint] = useState<{ from?: Point; to?: Point }>({});
  const [hasUp, setHasUp] = useState(false);

  const imgWidth = image?.naturalWidth ?? 0;
  const imgHeight = image?.naturalHeight ?? 0;

  const draw = async () => {
    const canvas = mainCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !image) {
      return;
    }

    // リサイズ
    const MAX_SIZE = 1000;
    const scale = resize(imgWidth, imgHeight, MAX_SIZE);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    const filterCanvas = new FilterCanvas(image, scale);
    filterCanvas.applyAberration(shift);
    filterCanvas.applyGaussianBlur(blur);
    filterCanvas.applyVinetting(vinettingOptions);
    context.drawImage(filterCanvas.composite(point), 0, 0);
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

  useEffect(() => {
    (async () => {
      setImage(await loadImage("/DSCF1408.webp"));
    })();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.canvasWrapper}
        onMouseDown={onMouseDown}
        onMouseMove={(e) => onMouseMoveUp(e, false)}
        onMouseUp={(e) => onMouseMoveUp(e, true)}
      >
        <svg
          viewBox={`0 0 ${imgWidth} ${imgHeight}`}
          preserveAspectRatio="none"
          className={styles.operations}
        >
          {point.from && point.to && (
            <line
              className={styles.line}
              x1={point.from[0] * imgWidth}
              y1={point.from[1] * imgHeight}
              x2={point.to[0] * imgWidth}
              y2={point.to[1] * imgHeight}
              strokeWidth={imgWidth * 0.005}
            />
          )}
          {point.from && (
            <circle
              cx={point.from[0] * imgWidth}
              cy={point.from[1] * imgHeight}
              r={imgWidth * 0.01}
              className={styles.circle}
            />
          )}
          {point.to && (
            <circle
              cx={point.to[0] * imgWidth}
              cy={point.to[1] * imgHeight}
              r={imgWidth * 0.01}
              className={styles.circle}
            />
          )}
        </svg>
        <canvas className={styles.mainCanvas} ref={mainCanvasRef} />
      </div>
      <Navigation
        shift={shift}
        blur={blur}
        vinettingOptions={vinettingOptions}
        setShift={setShift}
        setBlur={setBlur}
        setVinettingOptions={setVinettingOptions}
        draw={draw}
      />
    </div>
  );
};

export default App;
