import { useEffect, useState } from 'react';

import { SPRITE_DISPLAY_SIZE } from '../game/constants';
import { type Position } from '../game/types';

type FloatingTextProps = {
  readonly text: string;
  readonly position: Position;
  readonly onAnimationEnd: () => void;
};

const ANIMATION_DURATION_MS = 1000;

export function FloatingText({
  text,
  position,
  onAnimationEnd,
}: FloatingTextProps): JSX.Element {
  const [opacity, setOpacity] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);

      setOffsetY(-progress * 50);
      setOpacity(1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onAnimationEnd();
      }
    };

    const rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [onAnimationEnd]);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y - SPRITE_DISPLAY_SIZE / 2 - 10 + offsetY,
        transform: 'translate(-50%, -50%)',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity,
      }}
    >
      {text}
    </div>
  );
}
