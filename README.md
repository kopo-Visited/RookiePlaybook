# 신입의 정석

> 사내 지식 공유 및 온보딩 교육 플랫폼

중소기업이나 스타트업에서는 업무 가이드와 교육 자료가 노션, 드라이브, 메신저에 흩어져 있습니다.
그래서 신입사원은 **무엇을, 어디서, 어떤 순서로** 익혀야 하는지 스스로 알아내야 하고, 관리자는 누가 어디까지 배웠는지 파악하기 어렵습니다.

**신입의 정석**은 흩어진 사내 지식을 한곳에 모으고, 신입사원이 정해진 순서대로 온보딩 교육을 이수하도록 돕는 웹 플랫폼입니다.
관리자는 백오피스에서 교육 과정, 지식 문서, 질문·답변, 수료 현황을 한 번에 관리합니다.

---

## 주요 기능

### 신입사원

| 기능 | 설명 |
|------|------|
| **온보딩 교육** | 공통 과정과 소속 부서 과정을 단계 순서대로 이수합니다. 앞 단계를 완료해야 다음 단계가 열리는 **순차 이수** 방식이며, 영상 시청 위치가 저장되고 진도율·수료 여부가 자동으로 계산됩니다. |
| **지식문서 · FAQ** | 부서·카테고리별 문서와 FAQ를 검색·열람하고, 자주 보는 문서를 북마크합니다. |
| **질문 · 답변** | 문서로 해결되지 않는 내용을 질문으로 남기면 담당자가 답변합니다. 자주 나오는 질문은 FAQ로 전환됩니다. |
| **AI 온보딩 도우미** | 사내 문서와 FAQ를 근거로 답변하는 RAG 기반 챗봇입니다. 어느 화면에서든 바로 물어볼 수 있습니다. |
| **내 일정 · 문의하기** | 개인 일정을 관리하고, 계정·권한 등 운영 관련 문의를 남깁니다. |
| **대시보드** | 진행 중인 교육, 최근 문서, 내 질문 현황, 오늘의 일정을 한눈에 확인합니다. |

### 관리자

| 기능 | 설명 |
|------|------|
| **사용자 관리** | 계정 등록·수정, 부서/권한/상태 변경, 계정 잠금 해제 요청 처리 |
| **콘텐츠 관리** | 지식문서·FAQ 등록/수정, 공개 상태 관리, 오래 갱신되지 않은 문서 확인 |
| **답변 관리** | 질문 확인 및 답변 등록, 상태 관리(접수·처리중·답변완료·보류), FAQ 전환 |
| **교육 관리** | 교육 과정·단계 등록/수정, 수료 기준·대상 부서 설정, 신입사원별 학습 현황 조회 |
| **문의 · 일정 · 부서 관리** | 문의 답변, 대시보드에 노출할 일정 관리, 부서 등록 및 인원 현황 |
| **설정** | 공지사항 관리(로그인 화면·대시보드 노출), 계정 잠금 해제 |

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
| **Backend** | Java 21, Spring Boot 4.1 |
| **DB 연동** | Spring Data JPA, MyBatis |
| **Database** | PostgreSQL (AWS RDS) + pgvector |
| **인증/권한** | Spring Security + JWT (jjwt) |
| **AI** | Spring AI — ChatModel + VectorStore(pgvector) 기반 RAG |
| **Frontend** | React 19, Vite, React Router, Zustand, Axios |
| **테스트** | JUnit 5 · Mockito (백엔드) / Vitest · Testing Library · MSW (프론트엔드) |
| **배포** | AWS, Docker |
| **형상 관리** | Git / GitHub |
| **CI/CD** | GitHub Actions (`.github/workflows/`) |

---

## 프로젝트 구조

하나의 레포지토리에서 백엔드·프론트엔드·문서를 함께 관리하는 모노레포입니다.
전원이 프론트엔드와 백엔드를 모두 개발하는 구조라 모노레포가 적합합니다.

```
RookiePlaybook/               ← 루트 (Git 레포)
├── backend/                  ← Spring Boot 백엔드
├── frontend/                 ← React 프론트엔드
├── docs/                     ← 개발 규칙 문서
├── docker-compose.yml
└── README.md                 ← 이 파일
```

### 백엔드 패키지 구조

**도메인 기준**으로 나누며, 각 도메인 안에 `controller / service / repository / entity / dto` 를 둡니다.

```
backend/src/main/java/com/visited/www/
├── account/                  # 계정 잠금 해제
├── ai/                       # AI 온보딩 도우미 (RAG)
├── auth/                     # 로그인 · 인증
├── doc/                      # 지식문서 · FAQ
├── edu/                      # 온보딩 교육 (과정 · 단계 · 진도)
├── inquiry/                  # 문의
├── notice/                   # 공지사항
├── qna/                      # 질문 · 답변
├── schedule/                 # 일정
├── statistics/               # 통계 (대시보드)
├── user/                     # 사용자 관리
├── entity/                   # 공통 엔티티 (BaseEntity 등)
└── global/                   # 공통 설정 · 예외 · 응답 · 보안(JWT)
```

```
backend/src/main/resources/
├── mapper/                   # MyBatis XML 쿼리
└── application.yml           # 프로파일별 설정은 application-*.yml (git 제외)
```

```
backend/src/test/java/com/visited/www/    # main과 동일한 패키지 구조
```

> 상세는 [백엔드 개발 가이드](./docs/backend-convention.md) 참조.

### 프론트엔드 폴더 구조

```
frontend/src/
├── api/                      # axiosInstance + 도메인별 API 모듈
├── assets/
├── components/               # 공통 컴포넌트 (Layout, AdminLayout, Modal, Dropdown 등)
├── constants/                # routes · styles · message
├── hooks/                    # 공통 훅 + 도메인별 훅 (auth / edu / admin)
├── pages/
│   ├── auth/                 # 로그인 · 비밀번호 변경 · 계정 잠금해제 요청
│   ├── dashboard/            # 대시보드
│   ├── doc/                  # 지식문서 · FAQ
│   ├── qna/                  # 질문 · 답변
│   ├── edu/                  # 온보딩 교육 (목록 · 상세 · 영상 시청)
│   ├── notice/               # 공지사항
│   ├── schedule/             # 내 일정
│   ├── inquiry/              # 문의하기
│   ├── error/                # 에러 페이지
│   └── admin/                # 관리자 백오피스
│       ├── AdminDashboardPage/
│       ├── AdminUsersPage/
│       ├── AdminDocPage/
│       ├── AdminQnaPage/
│       ├── AdminEduPage/
│       ├── AdminInquiryPage/
│       ├── AdminSchedulePage/
│       ├── AdminDepartmentsPage/
│       └── AdminSettingsPage/
├── stores/                   # zustand 스토어 (authStore · toastStore)
├── styles/                   # global.css · common.module.css
├── utils/
├── __tests__/                # 단위 · 통합 테스트
├── App.jsx
└── main.jsx
```

> 상세는 [프론트엔드 개발 가이드](./docs/frontend-convention.md) 참조.

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
| [CI/CD](./docs/cicd.md) | 빌드/테스트/배포 파이프라인 |
