# 맹구런 (Maenggu Run)

macOS 바탕화면에 상주하는 픽셀 강아지 데스크탑 펫

![maenggu](assets/idle/mangoo_default.png)


https://github.com/user-attachments/assets/88edb283-3613-4687-ada1-bf5f84ba7f0d


## 소개

맹구는 당신의 바탕화면을 자유롭게 돌아다니는 귀여운 픽셀 강아지예요. 
일하다가 심심할 때 클릭해서 간식을 주세요!

### 특징

- 바탕화면 위를 자유롭게 돌아다님
- 클릭하면 간식을 먹고 기뻐함
- 다른 앱 위에 항상 표시 (작업 방해 X)
- 가볍고 귀여움

## 설치 방법

### macOS

1. [Releases](https://github.com/hazzzi/maenggu-run/releases)에서 `Maenggu-x.x.x.dmg` 다운로드
2. DMG 파일 열기
3. `Maenggu.app`을 Applications 폴더로 드래그

> **참고**: 코드 서명이 없어서 처음 실행 시 "확인되지 않은 개발자" 경고가 나타날 수 있어요.
> 
> **해결 방법**: 앱을 우클릭 → "열기" 선택 → "열기" 버튼 클릭

## 사용 방법

| 동작 | 설명 |
|------|------|
| **클릭** | 맹구에게 간식 주기 (냠냠 → 기쁨 애니메이션) |
| **우클릭** | 모아둔 간식으로 먹이주기 |
| **트레이 아이콘** | 통계 확인 / 종료 |

## 시스템 요구사항

- macOS 10.13 이상
- 약 100MB 저장 공간

## 개발

```bash
# 설치
pnpm install

# 개발 모드
pnpm dev

# 빌드
pnpm build

# 테스트
pnpm test
```

## 라이선스

MIT

---

만든이: hanee
