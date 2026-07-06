# 브랜치 전략

## 브랜치 구조

```
main ──────────────────────────► 배포(릴리스) 브랜치
  ▲ ▲
  │ └─ hotfix/* ───────────────► 배포 후 긴급 수정 (main에서 분기)
develop ───────────────────────► 통합(개발) 브랜치
  ▲
feature/*, fix/*, chore/*, docs/* ─► 일상 작업 브랜치 (develop에서 분기)
```

| 브랜치 | 역할 | 분기 원점 | merge 대상 | 직접 push |
|--------|------|-----------|-----------|-----------|
| `main` | 배포 가능한 상태만 유지 | - | - | 금지 (PR만 허용) |
| `develop` | 다음 배포를 위한 통합 | `main` | `main` | 금지 (PR만 허용) |
| `feature/*` | 개별 기능 개발 | `develop` | `develop` | 자유 |
| `fix/*` | 배포 전 버그 수정 | `develop` | `develop` | 자유 |
| `chore/*` | 설정·빌드·패키지 등 잡무 | `develop` | `develop` | 자유 |
| `docs/*` | 문서 작업 | `develop` | `develop` | 자유 |
| `hotfix/*` | 배포 후 발견된 오류 긴급 수정 | `main` | `main` + `develop` | 자유 |

- `main`, `develop`은 항상 유지되는 브랜치, 나머지(`feature`/`fix`/`chore`/`docs`/`hotfix`)는 작업 후 삭제하는 임시 브랜치다
- 승인 인원은 **분기 원점이 아니라 merge 대상** 기준으로 걸린다 (예: hotfix는 main에서 분기하지만 main으로 merge되므로 main 규칙 적용)

## 브랜치 네이밍

```
feature/<기능ID>-<기능명(영문)>[_<작업-키워드>]

  F-003          → 기능ID (기능정의서 기준)
  product-search → 기능명을 영문으로 표기 (하이픈으로 단어 구분)
  _api           → 작업 키워드 (언더스코어로 경계 구분, 브랜치를 쪼갤 때만)
```

예시 (형식 참고용):
- `feature/F-001-login`
- `feature/F-002-scan`

- **기능ID별 브랜치명(기능명 영문 표기) 매핑 표: 기능정의서 나오는 대로 작성 예정** (팀원마다 번역이 달라지는 것 방지)
- 한 기능을 여러 브랜치로 쪼개야 하면 기능명 뒤에 **언더스코어(`_`)로 작업 키워드**를 붙인다
  - 하이픈(`-`)은 기능명 내부 단어 구분, 언더스코어(`_`)는 "여기부터 작업 키워드"라는 경계
  - 예: `feature/F-003-product-search_api` → 기능명 `product-search` / 작업 `api`
  - 예: `feature/F-003-product-search_ui` → 기능명 `product-search` / 작업 `ui`

규칙:
- 브랜치 prefix는 `feature` / `fix` / `hotfix` / `chore` / `docs` **5개만 사용한다**
  - `fix`: develop 기준 버그 수정 (배포 전) / `hotfix`: main 기준 긴급 수정 (배포 후)
  - 디자인 변경 작업도 `feature/` 브랜치에서 진행 (`design`은 커밋 type으로만 구분)
- 기능명은 영문 소문자로 표기하고 하이픈(`-`)으로 단어를 구분한다 (기능ID의 `F-`만 대문자 유지). 한글/공백/괄호 금지
  - 작업 키워드를 붙일 때만 언더스코어(`_`)를 구분자로 사용 (위 참조)
  - 괄호 금지 이유: `feat(be)/...` 같은 이름은 셸에서 `()`가 문법 문자라 `git switch` 시 에러 발생
  - 한글 금지 이유: OS별 **유니코드 정규화** 방식 차이로 같은 이름의 브랜치가 중복 생성될 수 있음 (아래 설명)

> **유니코드 정규화(NFC/NFD)란?**
> 한글 "각"은 컴퓨터 내부에서 두 가지 방식으로 저장될 수 있다.
> - **NFC**: 완성된 글자 하나로 저장 (`각` = 1개 코드) — 대부분의 OS, Windows/Linux 방식
> - **NFD**: 자모를 분리해 저장 (`ㄱ` + `ㅏ` + `ㄱ` = 3개 코드) — macOS 파일 시스템 방식
>
> 눈에 보이는 글자는 똑같이 "각"이지만, 저장된 바이트가 달라서 컴퓨터는 **다른 문자열로 인식**한다.
> 그래서 macOS 사용자가 만든 `feature/각-작업` 브랜치와 Windows 사용자가 만든 같은 이름 브랜치가
> Git에서 **서로 다른 브랜치로 취급**되어, 브랜치 목록에 똑같아 보이는 게 두 개 생기거나 push/pull이 꼬인다.
> 영문·숫자·하이픈만 쓰면 이 문제가 아예 발생하지 않으므로 브랜치명은 영문으로 통일한다.
- 이름만 보고 무슨 작업인지 알 수 있게 작성한다
- 버그 수정은 `fix/<기능ID>-<어떤 버그인지 영문 표기>` 사용 (예: `fix/F-002-scan-freeze` → F-002에서 스캔이 멈추는 버그)
- 기능ID가 없는 작업(설정, 문서 등)은 `chore/<작업 내용 영문 표기>`, `docs/<작업 내용 영문 표기>` 사용 (예: `chore/setup-eslint`, `docs/update-readme`)
- 기능정의서 확정 전에는 ID 없이 `feature/<설명>` 으로 시작해도 된다

## 작업 흐름

1. 이슈 생성 (작업 내용 정의)
2. `develop`에서 `feature/*` 브랜치 생성
   ```bash
   git switch develop
   git pull origin develop
   git switch -c feature/F-002-scan
   ```
3. 작업 후 커밋, push
4. `feature/*` → `develop` PR 생성
5. 리뷰 승인 + CI 통과 후 merge
6. merge 후 브랜치 삭제
   - 원격: GitHub에서 "Delete branch" 버튼 클릭
   - 로컬: `git branch -d feature/F-002-scan`

## Merge 방식

| 방향 | 방식 | 이유 |
|------|------|------|
| `feature/*`, `fix/*`, `chore/*`, `docs/*` → `develop` | **Squash merge** | 자잘한 커밋을 하나로 정리, develop 히스토리 청결 |
| `develop` → `main` | **Merge commit** | 배포 시점 기록 유지 |
| `hotfix/*` → `main`, `develop` | **Squash merge** | 수정 내용을 커밋 하나로 명확히 |

- Squash merge 시 커밋 메시지는 커밋 컨벤션 형식으로 정리해서 작성한다.

## Hotfix 흐름 (배포 후 오류 발생 시)

배포된 `main`에서 오류가 발견되면 develop을 거치지 않고 `main`에서 직접 분기해 수정한다. develop에는 아직 배포되지 않은 작업이 섞여 있어서, develop을 경유하면 오류 수정만 골라서 배포할 수 없기 때문.

```
main ──●──────────────●──► (수정 배포)
        \            ▲
         hotfix/*    │
                     │
develop ◄────────────┘ (동일 수정 반영)
```

1. `main`에서 `hotfix/*` 브랜치 생성
   ```bash
   git switch main
   git pull origin main
   git switch -c hotfix/F-002-scan-crash
   ```
2. 수정 후 `hotfix/*` → `main` PR 생성, 리뷰 + CI 통과 후 merge → 재배포
3. **`hotfix/*` → `develop` PR도 반드시 생성해서 merge** (이걸 빼먹으면 다음 배포 때 같은 버그가 되살아남)
4. merge 후 hotfix 브랜치 삭제

- 네이밍: `hotfix/<기능ID>-<수정 내용 설명(영문 표기)>` (예: `hotfix/F-002-scan-crash` → F-002 기능에서 발생한 scan 크래시 수정)
- 커밋 type은 `fix` 사용: `fix(fe): 스캔 화면 진입 시 크래시 수정 (F-002)`
- 승인 인원: **2명이 목표.** hotfix는 급하게 짠 패치라 오히려 교차 검증이 더 중요하므로 develop과 같은 2명으로 둔다.
  - ⚠️ 다만 **지금 당장은 hotfix도 3명을 받아야 한다.** hotfix는 main으로 merge되는데, 현재 main 규칙이 "3명 승인"이고 아직 예외 설정(bypass)을 안 해놨기 때문. "hotfix는 2명"을 실제로 적용하려면 추가 설정이 필요하며, 이건 배포가 가까워질 때 하기로 미뤄둔 상태다. 자세한 건 아래 [브랜치 보호 규칙](#브랜치-보호-규칙-github-룰셋-설정) 참조.
- 배포 후 hotfix를 develop에도 반영하는 단계도 develop 규칙(2명)을 그대로 따른다

## 브랜치 최신화

작업 브랜치(`feature`, `fix`, `chore`, `docs`)가 길어져 develop과 벌어지면:

```bash
git switch feature/내-브랜치
git fetch origin
git merge origin/develop
```

- 팀 컨벤션으로 **merge 방식 통일** (rebase는 히스토리 조작에 익숙하지 않으면 사고 나기 쉬움)
- 충돌은 브랜치 당사자가 해결한다

## 브랜치 보호 규칙 (GitHub 룰셋 설정)

공통 (`main`, `develop`):
- PR 없이 push 금지
- CI status check 통과 필수
- force push 금지

브랜치별 승인 인원:

| 대상 브랜치 | 최소 승인 인원 |
|------------|---------------|
| `main` (일반 릴리스) | **3명** (팀 전원, 작성자 제외) |
| `main` (hotfix) | **2명** |
| `develop` | **2명** |

- main은 배포 브랜치라 가장 엄격하게, develop은 통합 브랜치라 그다음으로 둔다

#### hotfix 2명은 아직 GitHub에 설정하지 않음 (구현 예정)

현재 **bypass list는 비어 있다** (아무도 등록 안 됨). 이 상태에서는 예외 없이 규칙이 전원에게 똑같이 적용되므로, hotfix도 실제로는 main의 3명 규칙을 그대로 따르게 된다. 문서상 "hotfix 2명"은 아직 GitHub에 반영되지 않은 **목표값**이다.

- 이유: 배포 전 단계라 hotfix 상황 자체가 아직 없고, bypass를 미리 세팅해봐야 쓸 일이 없다
- **결정 보류 항목**: 실제 배포가 임박하거나 팀원 권한을 나눌 때, 아래 둘 중 하나로 확정한다
  1. **bypass 그대로 비워둠 + hotfix도 3명** — 추가 설정 없이 가장 단순. 긴급 배포 때도 3명 필요
  2. **bypass에 admin 1~2명 추가 + hotfix 2명 유지** — 문서대로 되지만, bypass 권한자가 hotfix 외 PR도 3명 없이 통과시킬 수 있어 "hotfix/비상용으로만 쓴다"는 팀 규율이 필요
- 그 전까지는 bypass 미설정 상태(= 모든 main PR 3명)로 두고 개발한다

### 4인 팀 기준 주의

- `main` 3명 = 작성자 빼고 **나머지 전원 승인**이라는 뜻. 한 명이라도 자리 비우면(휴가, 새벽 등) 일반 릴리스 merge가 막힌다. develop→main 릴리스는 자주 있는 일이 아니니 감수할 만하지만, 병목이 되면 2명으로 낮추는 걸 고려한다
- `develop` 2명 = 작성자 빼고 2명. 4명 중 1명은 빠져도 돌아가므로 일상 개발엔 무리 없다
- 팀 인원이 줄면 이 숫자부터 다시 조정한다

## 용어 설명 (Admin / Bypass)

위 규칙에 나오는 GitHub 개념 두 가지. 팀원 모두 알아두면 좋다.

### Admin (관리자 권한)

GitHub 레포의 **최상위 권한**. 사람마다 레포 권한 등급을 다르게 줄 수 있다:

| 권한 | 할 수 있는 것 |
|------|--------------|
| Read | 코드 보기, clone |
| Write | 위 + push, PR 생성/merge (대부분 팀원이 여기) |
| Maintain | 위 + 일부 레포 설정 |
| **Admin** | 위 + **모든 설정 변경** (브랜치 보호 규칙 수정, 멤버 초대/추방, 레포 삭제 등) |

- 브랜치 보호 규칙을 만들고 바꾸는 것 자체가 admin만 가능하다
- 보통 레포 생성자가 자동으로 admin이며, 팀 프로젝트에서는 1~2명에게만 준다
- 전원 admin으로 주면 아무나 규칙을 바꿀 수 있어 보호의 의미가 사라진다

### Bypass (규칙 우회)

특정 사람이 **브랜치 보호 규칙을 예외적으로 건너뛰고 merge**할 수 있게 하는 설정.

- 규칙 자체를 느슨하게 하면 평상시에도 느슨해지므로, "규칙은 그대로 두되 특정인만 예외"를 만들 때 사용
- GitHub 룰셋의 **bypass list**에 등록된 사람은 승인 인원이 부족해도 merge 버튼을 누를 수 있다

```
평소:          누구든 main에 merge하려면 승인 3명 필요
bypass 등록자:  승인 부족해도 merge 가능 (규칙 건너뜀)
```

- **왜 필요한가**: GitHub 브랜치 보호는 "대상 브랜치" 기준으로만 걸린다. "hotfix면 2명, 아니면 3명" 같은 조건 분기를 지원하지 않으므로, main에 들어오는 건 무엇이든 3명이 기본이다. hotfix를 3명보다 적게 내보내려면 bypass 권한자가 판단해서 규칙을 건너뛰는 방식으로 처리해야 한다
- **주의(구멍)**: bypass 권한자는 hotfix가 아닌 **일반 PR도** 3명 없이 통과시킬 수 있다. GitHub이 "이 bypass는 hotfix에만"이라고 제한하지 못한다. 따라서 "bypass는 hotfix/비상 상황에만 쓴다"는 것은 기술적 강제가 아니라 **팀원 간 약속**이다
- **현재 우리 레포 상태**: bypass list 비어 있음 (위 [hotfix 섹션](#hotfix-2명은-아직-github에-설정하지-않음-구현-예정) 참조). 즉 지금은 예외 없이 모두 규칙을 따르는 상태