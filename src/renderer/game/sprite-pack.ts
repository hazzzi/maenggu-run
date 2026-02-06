import {
  REQUIRED_STATES,
  type RequiredState,
  type SpriteManifest,
  type SpritePack,
  type SpritePackLoadResult,
  type SpriteStateConfig,
} from '../../shared/types';

const MANIFEST_FILENAME = 'sprite.json';
const DEFAULT_FRAME_DURATION = 200;

/**
 * 매니페스트가 유효한지 검사
 * - 필수 상태(idle, walk, eat, happy)가 모두 있는지
 * - fallback 상태가 존재하는지
 */
function validateManifest(manifest: SpriteManifest): string | null {
  // 필수 상태 확인
  for (const state of REQUIRED_STATES) {
    if (!(state in manifest.states)) {
      return `Missing required state: ${state}`;
    }
    const config = manifest.states[state];
    if (!config.frames || config.frames.length === 0) {
      return `State '${state}' has no frames`;
    }
  }

  // fallback 상태 존재 확인
  if (!(manifest.fallback in manifest.states)) {
    return `Fallback state '${manifest.fallback}' does not exist`;
  }

  return null;
}

/**
 * JSON 파싱 결과가 SpriteManifest 형태인지 검사
 */
function isValidManifestShape(data: unknown): data is SpriteManifest {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.name === 'string' &&
    typeof obj.version === 'number' &&
    typeof obj.frameSize === 'number' &&
    typeof obj.states === 'object' &&
    obj.states !== null &&
    typeof obj.fallback === 'string'
  );
}

/**
 * 스프라이트 팩을 로드
 * @param basePath 스프라이트 팩 폴더 경로 (sprite.json이 있는 폴더)
 */
export async function loadSpritePack(
  basePath: string,
): Promise<SpritePackLoadResult> {
  const normalizedPath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const manifestUrl = `${normalizedPath}${MANIFEST_FILENAME}`;

  try {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch manifest: ${response.status}`,
      };
    }

    const data: unknown = await response.json();

    if (!isValidManifestShape(data)) {
      return { success: false, error: 'Invalid manifest format' };
    }

    const validationError = validateManifest(data);
    if (validationError) {
      return { success: false, error: validationError };
    }

    return {
      success: true,
      pack: {
        manifest: data,
        basePath: normalizedPath,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to load sprite pack: ${message}` };
  }
}

/**
 * 상태에 해당하는 프레임 URL 목록 반환
 * 상태가 없으면 fallback 사용
 */
export function getFrameUrls(
  pack: SpritePack,
  state: string,
): readonly string[] {
  const config =
    pack.manifest.states[state] ?? pack.manifest.states[pack.manifest.fallback];
  return config.frames.map((frame) => `${pack.basePath}${frame}`);
}

/**
 * 상태에 해당하는 설정 반환
 * 상태가 없으면 fallback 사용
 */
export function getStateConfig(
  pack: SpritePack,
  state: string,
): SpriteStateConfig {
  return (
    pack.manifest.states[state] ?? pack.manifest.states[pack.manifest.fallback]
  );
}

/**
 * 상태의 프레임 수 반환
 */
export function getFrameCount(pack: SpritePack, state: RequiredState): number {
  const config = getStateConfig(pack, state);
  return config.frames.length;
}

/**
 * 상태의 프레임 duration 반환 (ms)
 */
export function getFrameDuration(pack: SpritePack, state: string): number {
  const config = getStateConfig(pack, state);
  return config.frameDuration ?? DEFAULT_FRAME_DURATION;
}

/**
 * 상태가 루프인지 반환
 */
export function isLoopingState(pack: SpritePack, state: string): boolean {
  const config = getStateConfig(pack, state);
  return config.loop;
}
