import { useEffect, useRef } from 'react';

interface PropTypes {
  draw(ctx: CanvasRenderingContext2D, frame: number): void;
  width?: number;
  height?: number;
}

function Canvas({ draw, width, height }: PropTypes) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    let frameId: number;
    if (ctx) {
      const render = () => {
        frameRef.current += 1;
        draw(ctx, frameRef.current);
        frameId = window.requestAnimationFrame(render);
      };

      render();

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    return undefined;
  }, [draw]);

  return <canvas ref={canvasRef} width={width} height={height} data-testid="canvas" />;
}

export default Canvas;
