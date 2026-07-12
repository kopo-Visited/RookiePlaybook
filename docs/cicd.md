# CI/CD 규칙

## CI/CD 도구

- **CI/CD**: TeamCity **Cloud** (JetBrains 관리형 SaaS — 서버를 직접 호스팅하지 않는다)
- **형상 관리**: GitHub (브랜치 전략은 [branch-strategy.md](./branch-strategy.md) 참조)

> TeamCity Cloud 무료 티어는 빌드 시간·동시 빌드 수에 제한이 있다. PR이 몰리는 시기엔 대기열이 생길 수 있으니, 한도에 자주 걸리면 유료 플랜 전환을 검토한다.

### TeamCity Cloud 최초 설정

1. [cloud.teamcity.com](https://cloud.teamcity.com) 가입 → 프로젝트 생성
2. "Connect GitHub"에서 TeamCity Cloud GitHub App을 `kopo-Visited/RookiePlaybook`에 설치 (VCS 접근 + PR 빌드 상태 게시 권한)
3. 이 레포를 가리키는 VCS Root 등록
4. 아래 "CI 파이프라인 구성"대로 Build Configuration 생성
5. GitHub 브랜치 보호 룰셋(`develop`, `main`)의 **Required status checks**에 TeamCity가 게시하는 빌드 상태(백엔드/프론트 각각) 등록

## CI (Continuous Integration) — 자동 빌드 및 테스트

### 트리거 조건

- `feature/*`, `fix/*`, `hotfix/*` → `develop` PR 생성/업데이트 시
- `develop` → `main` PR 생성/업데이트 시

### 단계별 적용 계획

> **테스트 코드 작성은 항상 필수**다 — PR에 테스트 없으면 리뷰 승인 불가. 아래 단계는 "CI가 테스트를 언제부터 강제하느냐"의 차이이지, 테스트를 안 짜도 된다는 뜻이 아니다.

**1단계 (초기): CI는 빌드만 강제, 테스트 코드는 작성 필수**

테스트 코드가 충분히 쌓이지 않은 초반엔 CI가 빌드 성공 여부만 검사한다. 단, 테스트 코드는 기능 구현과 함께 PR에 반드시 포함해야 한다.

```
PR 생성 → 빌드 → 통과 시 merge 허용
          (테스트 코드 작성은 필수, CI 강제는 아직 없음)
```

**2단계 (테스트 안정화 후): CI도 테스트 통과 강제**

테스트가 어느 정도 쌓이면 CI에서도 테스트 통과를 merge 조건으로 올린다.

```
PR 생성 → 빌드 → 단위/컴포넌트 테스트 → 통합 테스트 → 모두 통과 시 merge 허용
```

> 단계 전환 시점은 팀 합의로 결정한다. 주요 Service 레이어, Controller, 컴포넌트 테스트가 모두 작성된 시점으로 본다.

### CI 파이프라인 구성 (TeamCity)

백엔드와 프론트엔드를 **별도 Build Configuration**으로 분리해서 관리한다. 변경된 쪽만 빌드되도록 브랜치 필터 + 경로 필터를 설정한다.

#### 백엔드 Build Configuration

| Step | 명령어 | 설명 |
|------|--------|------|
| 1 | `./gradlew clean` | 이전 빌드 산출물 제거 |
| 2 | `./gradlew build -x test` | 테스트 제외 빌드 (1단계) |
| 3 | `./gradlew test` | 단위 테스트 실행 (2단계부터) |
| 4 | `./gradlew integrationTest` | 통합 테스트 실행 (2단계부터) |
| 5 | `./gradlew checkstyleMain` | Checkstyle 코드 스타일 검사 |

#### 프론트엔드 Build Configuration

| Step | 명령어 | 설명 |
|------|--------|------|
| 1 | `npm ci` | 의존성 설치 (package-lock.json 기준 고정 설치) |
| 2 | `npm run lint` | ESLint 코드 품질 검사 |
| 3 | `npm run build` | 프로덕션 빌드 (1단계) |
| 4 | `npm run test` | 단위/컴포넌트/페이지 렌더링 테스트 (2단계부터) |
| 5 | `npm run test:integration` | 통합 테스트 (MSW, 2단계부터) |

> `npm install` 대신 `npm ci` 를 쓰는 이유: `npm ci`는 `package-lock.json` 을 기준으로 정확히 고정된 버전을 설치해서 "내 컴퓨터에선 되는데 CI에선 안 돼" 문제를 방지한다.

**브랜치 필터 설정:**
```
+:refs/pull/*/head    # PR 브랜치에서만 트리거
```

### merge 조건 (GitHub 브랜치 보호 + TeamCity 연동)

GitHub 브랜치 보호 룰셋의 **Status Check** 항목에 TeamCity 빌드를 등록한다:
- TeamCity → GitHub 연동 후 빌드 결과가 PR에 자동으로 표시됨
- **백엔드 빌드**, **프론트엔드 빌드** 둘 다 Status Check에 등록
- 하나라도 실패하면 merge 버튼 비활성화

## CD (Continuous Deployment) — 자동 배포

### 배포 흐름

```
develop 브랜치에 push(=PR merge 포함) → TeamCity 감지 → Docker 이미지 빌드/푸시 → EC2 SSH 배포
```

- **`develop`에 push될 때마다 바로 배포한다** (`main`으로의 승격을 기다리지 않음). 지금 GitHub Actions(`deploy.yml`)와 동일한 트리거 시점을 유지하기로 결정 — 배포 빈도가 잦아지는 대신 확인 주기가 짧다는 장점을 우선함
- 백엔드와 프론트엔드는 각각 별도 Docker 이미지로 빌드되지만, 배포(EC2 `docker-compose up -d`)는 두 이미지를 함께 갱신하는 한 번의 배포 스텝으로 묶는다 (`docker-compose.yml`이 두 서비스를 함께 관리하기 때문)

### 배포 Build Configuration 구성 (TeamCity Cloud)

CI(백엔드/프론트 빌드) Build Configuration이 모두 성공한 뒤 실행되는 별도의 "Deploy" Build Configuration을 만든다. VCS Trigger는 `develop` 브랜치로 한정한다.

| Step | 내용 |
|------|------|
| 1 | Docker Hub 로그인 (`%docker.hub.username%` / `%docker.hub.password%` 파라미터) |
| 2 | 프론트엔드 이미지 빌드 & 푸시 (`docker build ./frontend` → push) |
| 3 | 백엔드 이미지 빌드 & 푸시 (`docker build ./backend` → push) |
| 4 | EC2로 SSH 접속해 `docker pull` + `docker-compose up -d --force-recreate` 실행 (SSH Exec 빌드 러너 또는 셸 스텝에서 `%ec2.ssh.key%` 파라미터를 임시 키 파일로 기록 후 사용) |

이 4단계는 지금 `.github/workflows/deploy.yml`에 있는 `frontend` → `backend` → `deploy` job과 1:1로 대응한다. TeamCity로 전환을 완료하면 `deploy.yml`은 중복 배포를 막기 위해 비활성화하거나 삭제한다.

### 민감 정보(Parameters)로 옮겨야 할 것

기존 GitHub Actions Secrets에 있는 값을 TeamCity Cloud Build Configuration → Parameters(Password 타입)로 동일하게 옮긴다:

| GitHub Secret | TeamCity Parameter (예시) |
|---|---|
| `DOCKER_HUB_USERNAME` | `docker.hub.username` |
| `DOCKER_HUB_PASSWORD` | `docker.hub.password` |
| `EC2_SSH_KEY` | `ec2.ssh.key` |

### 배포 전 체크리스트

**백엔드:**
1. 빌드 (`./gradlew build`)
2. 단위 테스트 (`./gradlew test`)
3. 통합 테스트 (`./gradlew integrationTest`)
4. 위 모두 통과 시 배포 진행 — 하나라도 실패하면 배포 중단

**프론트엔드:**
1. 의존성 설치 (`npm ci`)
2. ESLint 검사 (`npm run lint`)
3. 테스트 (`npm run test`)
4. 프로덕션 빌드 (`npm run build`)
5. 위 모두 통과 시 배포 진행

### 환경변수 관리

배포 시 민감 정보는 TeamCity의 **Parameters** 기능으로 주입한다:
- TeamCity → Build Configuration → Parameters에 환경변수 등록
- 코드나 설정 파일에 직접 값을 넣지 않는다

| 대상 | 환경변수 | 주입 대상 파일 |
|------|---------|--------------|
| 백엔드 DB | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | `application-prod.yml` |
| 백엔드 JWT | `JWT_SECRET` | `application-prod.yml` |
| 프론트엔드 API URL | `VITE_API_BASE_URL` | `.env.production` |

## 빌드 실패 시 대응

- CI 실패 시 **PR 작성자가 직접 수정 후 재푸시** — 다른 팀원이 대신 고쳐주지 않는다
- 빌드 실패 원인은 TeamCity 빌드 로그에서 확인
- **로컬에서 먼저 확인하고 push하는 습관을 들인다** (아래 로컬 체크 참조)

## 커밋 전 로컬 체크

push 전에 로컬에서 먼저 확인해서 CI 실패를 줄인다.

**백엔드:**
```bash
# 빌드 확인
./gradlew build

# 단위 테스트 확인
./gradlew test

# Checkstyle 확인
./gradlew checkstyleMain
```

**프론트엔드:**
```bash
# ESLint 검사
npm run lint

# Prettier 포매팅 확인
npm run format

# 테스트 실행
npm run test
```