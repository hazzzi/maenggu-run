import { useCallback, useState } from 'react';

import { type Position } from '../../shared/types';

type FloatingTextData = {
  readonly id: string;
  readonly text: string;
  readonly position: Position;
};

type UseFloatingTextsReturn = {
  readonly floatingTexts: readonly FloatingTextData[];
  readonly addFloatingText: (text: string, position: Position) => void;
  readonly removeFloatingText: (id: string) => void;
};

export function useFloatingTexts(): UseFloatingTextsReturn {
  const [floatingTexts, setFloatingTexts] = useState<
    readonly FloatingTextData[]
  >([]);

  const addFloatingText = useCallback((text: string, position: Position) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newText: FloatingTextData = { id, text, position };

    setFloatingTexts((prev) => [...prev, newText]);
  }, []);

  const removeFloatingText = useCallback((id: string) => {
    setFloatingTexts((prev) => prev.filter((text) => text.id !== id));
  }, []);

  return {
    floatingTexts,
    addFloatingText,
    removeFloatingText,
  };
}
