# SPEC.md

## Overview
"맹구런" - macOS 바탕화면에 상주하는 픽셀 강아지 클릭러 앱.
픽셀 강아지 "맹구"가 화면을 자유롭게 돌아다니고, 클릭하면 간식을 획득하며, 모은 간식으로 먹이를 줄 수 있다.

## Target
- Platform: macOS only
- Language: Korean (UI)

## Core Loop (v1)
1. 앱 실행 → 맹구가 바탕화면에 등장
2. 맹구가 화면 내 자유롭게 이동
3. 맹구 클릭 → 간식 +1 획득
4. 간식 소모 → 먹이주기 → 맹구 반응 애니메이션
5. 반복

## Features (v1 Scope)

### 맹구 캐릭터
- 픽셀 스프라이트 강아지
- 상태별 애니메이션:
  - `idle`: 대기 (숨쉬기/꼬리흔들기)
  - `walk`: 이동
  - `eat`: 먹이 먹는 모션
  - `happy`: 먹이 후 반응

### 이동 시스템
- 화면 경계 내 랜덤 이동
- 일정 시간 대기 → 새 목적지 선정 → 이동 → 반복
- 이동 속도: 느긋하게 (pixel/frame 조절 가능)

### 클릭 보상
- 맹구 클릭 시 간식 +1
- 클릭 피드백: 시각적 이펙트 (파티클 또는 +1 텍스트)
- 연속 클릭 가능 (쿨다운 없음 v1)

### 재화: 간식
- 단일 재화 타입
- 화면 어딘가에 현재 간식 수 표시 (최소 오버레이)
- 로컬 저장 (앱 종료 후에도 유지)

### 먹이주기
- 간식 N개 소모 → 먹이주기 실행
- 트리거: 맹구 클릭 (컨텍스트 메뉴 or 길게 누르기 - TBD)
- 먹이주기 시 `eat` → `happy` 애니메이션 재생

### 저장/로드
- 저장 위치: `~/Library/Application Support/maenggu-run/save.json`
- 저장 데이터:
  ```json
  {
    "version": 1,
    "snacks": 0,
    "stats": {
      "totalClicks": 0,
      "totalFeedings": 0
    }
  }
  ```
- 저장 시점: 간식 변동 시 즉시 저장 (debounce 적용)
- 로드 시점: 앱 시작 시

## UI/UX

### 오버레이 창
- 투명 배경, 항상 위(always on top)
- 전체 화면 크기 (맹구 이동 영역)
- 클릭 통과: 맹구 영역만 클릭 가능, 나머지는 통과

### 간식 표시
- 화면 구석 작은 UI (위치 TBD)
- 아이콘 + 숫자
- 최소한의 디자인

### 설정 (v2 예정)
- v1에서는 설정 UI 없음
- 트레이 아이콘으로 종료만 가능

## Technical

### Electron 창 설정
```typescript
const mainWindow = new BrowserWindow({
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  hasShadow: false,
  skipTaskbar: true,
  resizable: false,
  fullscreen: false,
  // macOS specific
  vibrancy: undefined,
  visualEffectState: 'active',
})

// 클릭 통과 설정
mainWindow.setIgnoreMouseEvents(true, { forward: true })
```

### 클릭 감지 전략
- 기본: 창 전체 `ignoreMouseEvents: true`
- 맹구 위치에서만 클릭 감지 활성화
- `mousemove` 이벤트로 맹구 영역 진입/이탈 감지
- 진입 시 `setIgnoreMouseEvents(false)`, 이탈 시 `true`

### IPC Channels
| Channel | Direction | Payload |
|---------|-----------|---------|
| `snack:get` | renderer → main | - |
| `snack:update` | main → renderer | `{ snacks: number }` |
| `snack:add` | renderer → main | `{ amount: number }` |
| `snack:spend` | renderer → main | `{ amount: number }` |
| `save:load` | main → renderer | `SaveData` |
| `save:request` | renderer → main | - |

### 파일 구조
```
src/
├── main/
│   ├── index.ts              # 앱 진입점
│   ├── window.ts             # 창 생성/관리
│   ├── ipc/
│   │   ├── snack.ts          # 간식 IPC 핸들러
│   │   └── save.ts           # 저장 IPC 핸들러
│   └── store/
│       └── save-manager.ts   # JSON 저장/로드
│
├── preload/
│   └── index.ts              # contextBridge API
│
├── renderer/
│   ├── index.html
│   ├── main.ts               # 렌더러 진입점
│   ├── game/
│   │   ├── maenggu.ts        # 맹구 클래스
│   │   ├── movement.ts       # 이동 로직
│   │   └── animation.ts      # 애니메이션 상태머신
│   ├── ui/
│   │   └── snack-counter.ts  # 간식 표시 UI
│   └── assets/
│       └── sprites/          # 픽셀 스프라이트
│
└── shared/
    └── types.ts              # 공유 타입 정의

resources/
└── sprites/
    ├── maenggu-idle.png
    ├── maenggu-walk.png
    ├── maenggu-eat.png
    └── maenggu-happy.png
```

## Assets

### 스프라이트 사양
- 포맷: PNG (투명 배경)
- 크기: 32x32 또는 64x64 (TBD)
- 스타일: 픽셀아트
- 프레임 수 (최소):
  - idle: 2-4 프레임
  - walk: 4 프레임
  - eat: 4 프레임
  - happy: 2-4 프레임

### 렌더링
- `image-rendering: pixelated` (crisp edges)
- Canvas 또는 DOM 기반 (TBD)

## Out of Scope (v1)
- 성장/레벨 시스템
- 다중 상호작용 (쓰다듬기, 장난감 등)
- 설정 UI
- 사운드
- 업적/통계 UI
- 다국어 지원
- Windows/Linux 지원

## Future (v2+)
- 설정 창 (이동 속도, 크기 조절 등)
- 추가 상호작용
- 맹구 성장/외형 변화
- 사운드 이펙트
- 미니게임

## Open Questions
- [ ] 먹이주기 트리거 UX: 우클릭 메뉴 vs 길게 누르기 vs 별도 버튼
- [ ] 간식 표시 UI 위치: 화면 구석 고정 vs 맹구 근처 플로팅
- [ ] 스프라이트 크기 확정: 32x32 vs 64x64
- [ ] 먹이주기 비용: 간식 몇 개?
