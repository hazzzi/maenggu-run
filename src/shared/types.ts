export type SaveDataStats = {
  readonly totalClicks: number;
  readonly totalFeedings: number;
  readonly peakSnacks: number;
  readonly sessionPlaytime: number;
};

export type SaveData = {
  readonly version: 1;
  readonly snacks: number;
  readonly stats: SaveDataStats;
};

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  snacks: 0,
  stats: {
    totalClicks: 0,
    totalFeedings: 0,
    peakSnacks: 0,
    sessionPlaytime: 0,
  },
} as const;

export type MaengguState = 'idle' | 'walk' | 'eat' | 'happy';

// === Sprite Pack Types ===

/** 앱이 반드시 필요로 하는 상태들. 스프라이트 팩에 없으면 로딩 실패. */
export const REQUIRED_STATES = ['idle', 'walk', 'eat', 'happy'] as const;
export type RequiredState = (typeof REQUIRED_STATES)[number];

/** 개별 상태의 설정 */
export type SpriteStateConfig = {
  readonly frames: readonly string[];
  readonly loop: boolean;
  readonly frameDuration?: number; // ms, 기본값 200
};

/** sprite.json 매니페스트 스키마 */
export type SpriteManifest = {
  readonly name: string;
  readonly version: number;
  readonly frameSize: number;
  readonly states: Readonly<Record<string, SpriteStateConfig>>;
  readonly fallback: string;
};

/** 로드된 스프라이트 팩 */
export type SpritePack = {
  readonly manifest: SpriteManifest;
  readonly basePath: string;
};

/** 스프라이트 팩 로드 결과 */
export type SpritePackLoadResult =
  | { readonly success: true; readonly pack: SpritePack }
  | { readonly success: false; readonly error: string };

export type Position = {
  readonly x: number;
  readonly y: number;
};

export type FacingDirection = 'left' | 'right';

export type SaveLoadResult =
  | { success: true; data: SaveData }
  | { success: false; error: string };

// Cursor position type for mouse collider
export type CursorPosition = {
  readonly x: number;
  readonly y: number;
};

// Maenggu API interface exposed to renderer
export type MaengguApi = {
  mouse: {
    setCollider: (inCollider: boolean) => void;
    getCursorPosition: () => Promise<CursorPosition | null>;
  };
  save: {
    load: () => Promise<SaveLoadResult>;
  };
  snack: {
    add: (amount?: number) => void;
    spend: (amount?: number) => Promise<boolean>;
    onUpdate: (callback: (snacks: number) => void) => () => void;
  };
  summon: {
    onSummon: (callback: () => void) => () => void;
  };
};
