# SPEC.md

## Overview

"맹구런" - macOS 바탕화면에 상주하는 픽셀 강아지 클릭러 앱.
픽셀 강아지 "맹구"가 화면을 자유롭게 돌아다니고, 클릭하면 간식을 획득하며, 모은 간식으로 먹이를 줄 수 있다.

## Target

- Platform: macOS only
- Language: Korean (UI)

## Core Loop (v1)

1. 앱 실행 → 맹구가 바탕화면 랜덤 위치에 등장
2. 맹구가 화면 내 자유롭게 이동 (3-8초 idle → walk → idle)
3. 맹구 클릭 → 간식 소모 → eat → happy 애니메이션, 즉시 멈추고 반응
4. 반복 (모든 데이터는 자동 저장)

## Features (v1 Scope)

### 맹구 캐릭터

- 픽셀 스프라이트 강아지 (32x32px)
- 항상 같은 방향 바라봄 (좌우 반전 없음)
- 상태별 애니메이션 (2-3프레임, 400-600ms):
  - `idle`: 대기 (아주 미묘한 숨쉬기 - 거의 움직임 없음)
  - `walk`: 이동 (2-4px/frame)
  - `eat`: 먹이 먹는 모션
  - `happy`: 먹이 후 기쁜 반응 (eat 완료 후 자동 재생)

### 이동 시스템

- 순수 랜덤 목적지 선정 (화면 내 모든 위치)
- idle 시간: 3-8초 (무작위 범위)
- 이동 속도: 2-4 pixel/frame (여유있게)
- 멀티모니터: 모든 연결된 디스플레이에 끊김 없이 이동 (seamless)
- 경계 처리: 부드럽게 멈추기 (즉시 반대 방향이 아님)
- 클릭 중 이동: 클릭하면 즉시 멈춤 → 간식 +1

### 클릭 보상

- 클릭 피드백: +1 플로팅 텍스트 (맹구 위치에 떠오름)
- 연속 클릭 가능 (쿨다운 없음)

### 재화: 간식

- 단일 재화 타입
- UI 표시: 아이콘 + 숫자 (예: 🍖 42)
- 위치: 화면 왼쪽 위 모서리 (고정 위치)
- 클릭 통과: 간식 UI 위의 클릭도 통과 가능 (맹구 위치만 클릭 감지)

### 먹이주기

- 메뉴는 간식 부족 시에도 표시 (클릭 시 동작 없음)
- 애니메이션 흐름: `eat` → `happy` (자동 연속 재생)
- 이동 중 먹이주기: 즉시 멈추고 eat 애니메이션 시작

### 저장/로드

- 저장 위치: `~/Library/Application Support/maenggu-run/save.json`
- 저장 데이터:
  ```json
  {
    "version": 1,
    "snacks": 0,
    "stats": {
      "totalClicks": 0,
      "totalFeedings": 0,
      "peakSnacks": 0,
      "sessionPlaytime": 0
    }
  }
  ```
- 저장 시점: 간식 변동 시 debounce (500ms 무활동 후 저장)
- 로드 시점: 앱 시작 시 자동 로드
- 데이터 손상 시: 오류 대화창 표시 후 앱 종료 (복구 없음)
- v1에서 리셋 기능 없음 (파일 수동 삭제로만 초기화)

## UI/UX

### 오버레이 창

- 투명도: 완전 투명 (0% 불투명, 100% 투명)
- 항상 위에 표시 (always on top)
- 전체 화면 크기 (모든 연결 디스플레이 포함)
- 크기 조정 불가능 (resizable: false)
- 프레임 없음, 그림자 없음 (seamless)
- 클릭 감지: 맹구 콜라이더 영역만 반응, 나머지는 통과

### 간식 표시 UI

- 위치: 화면 왼쪽 위 모서리 (고정)
- 디자인: 아이콘 + 숫자 (예: 🍖 42)
- 최소 오버레이 스타일 (간단한 폰트)
- 클릭 통과: UI 위의 클릭도 통과 (맹구만 반응)

### 맥 Dock 상호작용

- 맹구는 Dock을 뚫고 지나갈 수 있음 (occlude)
- Dock auto-hide 시에도 동일 동작

### 트레이 메뉴

- 종료 (Quit) 옵션
- 간단한 통계 표시 옵션 (팝업 또는 인라인)

### 설정 (v2 예정)

- v1에서는 설정 UI 없음
- 향후 버전: 이동 속도, 크기 조절 등 추가

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
});

// 클릭 통과 설정
mainWindow.setIgnoreMouseEvents(true, { forward: true });
```

### 클릭 감지 전략

- 기본: 창 전체 `ignoreMouseEvents: true`
- 렌더러에서 맹구 위치 모니터링
- `mousemove` 이벤트로 맹구 콜라이더 영역 진입/이탈 감지
- 진입 시: IPC로 메인 프로세스에 알림 → `setIgnoreMouseEvents(false)`
- 이탈 시: IPC로 메인 프로세스에 알림 → `setIgnoreMouseEvents(true)`
- 클릭/우클릭 이벤트: 렌더러에서 직접 처리

### IPC Channels

| Channel          | Direction       | Payload                   | 설명                        |
| ---------------- | --------------- | ------------------------- | --------------------------- |
| `snack:add`      | renderer → main | `{ amount: number }`      | 간식 추가 (클릭)            |
| `snack:spend`    | renderer → main | `{ amount: number }`      | 간식 소모 (먹이주기)        |
| `snack:update`   | main → renderer | `{ snacks: number }`      | 간식 업데이트 브로드캐스트  |
| `save:load`      | main → renderer | `SaveData`                | 앱 시작 시 저장 데이터 로드 |
| `mouse:collider` | renderer → main | `{ inCollider: boolean }` | 마우스 콜라이더 진입/이탈   |

### 렌더링 전략

- v1: DOM 기반 (img + CSS positioning)
  - 간단한 구현, 개발 속도 우선
  - 애니메이션: CSS 또는 JS 타이머
- v2+: Canvas API로 리팩토링 계획
  - 성능 최적화, 더 많은 이펙트 가능

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

## 앱 실행 & 런칭

### Auto-Start (시작 시 자동 실행)

- v1: 비활성화 (수동 시작만)
- v2+: 사용자 설정 추가 계획

### 앱 업데이트

- v1: 수동 다운로드 (App Store 또는 GitHub Releases)
- electron-updater 통합은 v2+에서 검토

## Assets

### 스프라이트 사양

- 포맷: PNG (투명 배경)
- 크기: 32x32px (고정)
- 스타일: 픽셀아트 (crisp edges)
- 렌더링: `image-rendering: pixelated` (DOM)
- 프레임 수 (최소):
  - idle: 2-3 프레임 (아주 미묘한 숨쉬기)
  - walk: 2-3 프레임
  - eat: 2-3 프레임
  - happy: 2-3 프레임
- 프레임 레이트: 통일된 애니메이션 타이밍 (400-600ms 완성)

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

## 결정 사항 정리

### 확정된 주요 결정들

- ✅ 먹이주기 트리거: 우클릭 컨텍스트 메뉴
- ✅ 간식 UI 위치: 화면 왼쪽 위 고정
- ✅ 스프라이트 크기: 32x32px
- ✅ 클릭 중 움직임: 즉시 멈춤
- ✅ 렌더링 방식: v1은 DOM 기반, v2+ Canvas로 리팩토링
- ✅ 멀티모니터: 끊김 없이 모든 디스플레이에 이동
- ✅ 오버레이 투명도: 완전 투명 (0%)
- ✅ 저장 방식: debounce (500ms)
- ✅ 통계 추적: clicks, feedings, peakSnacks, sessionPlaytime
- ✅ Dock 상호작용: 맹구가 위로 지나감

## 남은 결정사항

- [ ] **먹이주기 비용**: 간식 몇 개? (v1 진행 중 테스트 및 결정)
  - 초안: 고정값 (예: 5개) vs 증가 비용 vs 시스템 아직 미정
- [ ] 스프라이트 디자인 및 애니메이션 구체화
- [ ] 간식 아이콘: 🍖 또는 다른 이모지/이미지?
- [ ] 오류 메시지 UI 디자인
- [ ] 통계 표시 UI 상세 레이아웃 (팝업 vs 인라인)
