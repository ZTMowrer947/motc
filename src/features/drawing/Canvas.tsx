import { useEffect, useRef } from 'react';

interface PropTypes {
  draw(ctx: CanvasRenderingContext2D, frame: number): void;
  width?: number;
  height?: number;
}

function Canvas({ draw, width, height }: PropTypes) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    let frame = 0;
    let frameId: number;
    if (ctx) {
      const render = () => {
        frame += 1;
        draw(ctx, frame);
        frameId = window.requestAnimationFrame(render);
      };

      render();

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    return undefined;
  }, [draw]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}

export default Canvas;
