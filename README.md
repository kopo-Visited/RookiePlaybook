# 신입의 정석

> 사내 지식 공유 및 온보딩 교육 플랫폼

중소기업이나 스타트업에서 업무 가이드와 교육 자료가 노션, 드라이브, 메신저 등에 흩어져 있는 문제를 해결하기 위한 서비스입니다.
신입사원과 직원들이 회사 내부 문서, FAQ, 업무 가이드를 한 곳에서 검색·학습하고,
관리자는 백오피스에서 지식 문서, 교육 과정, 수료 현황을 관리할 수 있는 웹 기반 플랫폼입니다.

---

## 팀 정보

| 항목 | 내용 |
|------|------|
| 팀명 | visited |
| 서비스명 | 신입의 정석 |
| 개발 기간 | 2025.07.03 ~ 2025.07.14 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Backend** | Java 21, Spring Boot |
| **DB 연동** | Spring Data JPA, MyBatis |
| **Database** | PostgreSQL (AWS RDS) |
| **인증/권한** | Spring Security + JWT (추후 변경 가능) |
| **Frontend** | React |
| **AI 분류** | 키워드 기반 분류 (여유 있으면 OpenAI / Gemini API) |
| **파일/영상** | 파일 업로드 또는 외부 영상 URL 관리 |
| **배포** | AWS |
| **형상 관리** | Git / GitHub |
| **CI/CD** | TeamCity |

---

## 프로젝트 구조

하나의 레포지토리에 백엔드, 프론트엔드, 문서를 모두 관리한다. 전원이 프론트엔드/백엔드 둘 다 개발하는 구조라 모노레포가 적합하다.

```
프로젝트명/                   ← 루트 (Git 레포)
├── backend/                  ← Spring Boot 백엔드
├── frontend/                 ← React 프론트엔드
├── docs/                     ← 개발 규칙 문서
└── README.md                 ← 이 파일
```

### 백엔드 패키지 구조

```
src/
├── main/
│   ├── java/com/visited/www/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/             # JPA Repository
│   │   ├── mapper/                 # MyBatis Mapper 인터페이스
│   │   ├── entity/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── global/
│   │   │   ├── config/
│   │   │   ├── entity/             # BaseEntity
│   │   │   ├── exception/
│   │   │   ├── response/           # ApiResponse
│   │   │   └── util/
│   │   └── infra/                  # 외부 서비스 연동 (필요 시)
│   └── resources/
│       ├── mapper/                 # MyBatis XML 쿼리 파일
│       ├── application.yml
│       ├── application-local.yml
│       ├── application-dev.yml
│       └── application-prod.yml
└── test/
    └── java/com/visited/www/       # main과 동일한 패키지 구조
```

> 도메인이 확정되면 레이어 기준 → 도메인 기준 구조로 전환한다. 상세는 [백엔드 개발 가이드](./docs/backend-convention.md) 참조.

### 프론트엔드 폴더 구조

```
src/
├── assets/
├── components/                     # 공통 컴포넌트 (재사용)
├── pages/
│   ├── auth/                       # 로그인
│   ├── doc/                        # 지식 문서
│   ├── qna/                        # 질문/답변
│   ├── edu/                        # 온보딩 교육 (일반 사용자)
│   │   ├── EducationListPage/      # 교육 과정 목록
│   │   ├── EducationDetailPage/    # 교육 과정 상세
│   │   ├── VideoPlayerPage/        # 교육 영상 시청
│   │   └── MyProgressPage/         # 내 학습 현황
│   └── admin/
│       └── edu/                    # EDU 관리자
│           ├── AdminEducationPage/     # 교육 과정 등록/수정
│           ├── AdminStagePage/         # 교육 단계 관리
│           ├── AdminProgressPage/      # 신입사원별 진도율
│           └── AdminIncompletePage/    # 미수료자 조회
├── hooks/
│   ├── useFetch.js                 # 범용 API 조회 훅
│   └── edu/
│       └── useVideoProgress.js     # 영상 진도 저장 훅
├── api/
│   ├── axiosInstance.js
│   ├── authApi.js
│   ├── docApi.js
│   ├── qnaApi.js
│   └── eduApi.js
├── stores/
│   └── authStore.js
├── constants/
│   ├── routes.js
│   ├── styles.js
│   └── message.js
├── utils/
│   └── formatDate.js
├── styles/
│   ├── global.css
│   └── common.module.css
├── __tests__/
├── App.jsx
└── main.jsx
```

> 기능정의서 확정 후 pages, hooks, api 폴더를 실제 기능에 맞게 채운다. 상세는 [프론트엔드 개발 가이드](./docs/frontend-convention.md) 참조.

---

## 개발 규칙 문서

개발 시작 전 반드시 읽어볼 것. 전체 목차는 [docs/README.md](./docs/README.md) 참조.

| 문서 | 내용 |
|------|------|
| [커밋 컨벤션](./docs/commit-convention.md) | 커밋 메시지 형식, type/scope/기능ID 규칙 |
| [브랜치 전략](./docs/branch-strategy.md) | 브랜치 구조, 네이밍, merge 방식, hotfix |
| [PR 가이드](./docs/pr-guide.md) | PR 작성, 리뷰 프로세스 |
| [이슈 가이드](./docs/issue-guide.md) | 이슈 제목 형식, 라벨 체계 |
| [공통 규칙](./docs/common-convention.md) | 공통 응답 형식, HTTP 상태코드, API 명세서 |
| [백엔드 개발 가이드](./docs/backend-convention.md) | 패키지 구조, 네이밍, API 설계, 테스트 등 |
| [프론트엔드 개발 가이드](./docs/frontend-convention.md) | 폴더 구조, 컴포넌트/훅 규칙, 테스트 등 |
| [CI/CD](./docs/cicd.md) | TeamCity 빌드/테스트/배포 파이프라인 |

---

## 작업 흐름

```
이슈 생성 → develop에서 feature 브랜치 생성 → 작업/커밋
→ PR 생성 (closes #이슈) → 리뷰 승인 + CI 통과 → squash merge → 브랜치 삭제
```

## 로컬 실행 방법

### 백엔드

```bash
# 1. PostgreSQL 실행 (Docker 사용 시)
docker run --name sinip-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=sinip_local \
  -p 5432:5432 -d postgres

# 2. 백엔드 실행
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

- `--spring.profiles.active=local` — `application-local.yml` 설정을 적용해서 실행한다는 의미. 이걸 붙이지 않으면 로컬 DB 설정이 아닌 기본 설정으로 실행되어 접속 오류가 발생할 수 있다

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```