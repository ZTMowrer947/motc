import React from 'react';
import Canvas from './features/drawing/Canvas';

function App() {
  return (
    <Canvas
      draw={(ctx, frame) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();
        ctx.arc(50, 100, 20 * Math.sin(frame * 0.05) ** 2, 0, 2 * Math.PI);
        ctx.fill();
      }}
    />
  );
}

export default App;
