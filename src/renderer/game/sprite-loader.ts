import { type AnimState } from "./types";

type SpriteManifest = Record<AnimState, readonly string[]>;

const SPRITE_FRAMES: SpriteManifest = {
  idle: ["idle/mangoo_default.png"],
  walk: ["walk/mangoo_02.png", "walk/mangoo_03.png", "walk/mangoo_04.png"],
  eat: [
    "eat/mangoo_07.png",
    "eat/mangoo_08.png",
    "eat/mangoo_09.png",
    "eat/mangoo_10.png",
    "eat/mangoo_11.png",
  ],
  happy: ["happy/mangoo_13.png"],
  sleep: ["sleep/mangoo_sleep_01.png", "sleep/mangoo_sleep_02.png"],
} as const;

function ensureTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

export function getSpriteManifest(): SpriteManifest {
  return SPRITE_FRAMES;
}

export function getSpriteFrameUrls(basePath: string): SpriteManifest {
  const normalizedBase = ensureTrailingSlash(basePath);
  const baseWithAssets = `${normalizedBase}assets/`;

  return {
    idle: SPRITE_FRAMES.idle.map((frame) => `${baseWithAssets}${frame}`),
    walk: SPRITE_FRAMES.walk.map((frame) => `${baseWithAssets}${frame}`),
    eat: SPRITE_FRAMES.eat.map((frame) => `${baseWithAssets}${frame}`),
    happy: SPRITE_FRAMES.happy.map((frame) => `${baseWithAssets}${frame}`),
    sleep: SPRITE_FRAMES.sleep.map((frame) => `${baseWithAssets}${frame}`),
  };
}

export function getFrameCount(state: AnimState): number {
  return SPRITE_FRAMES[state].length;
}
