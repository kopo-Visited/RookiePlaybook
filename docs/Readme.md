# 팀 개발 규칙

이 폴더는 팀 공통 개발 규칙을 정의한다. 코드 작성 전에 한 번씩 읽어볼 것.

## 문서 목록

### Git 규칙

| 문서 | 내용 |
|------|------|
| [commit-convention.md](./commit-convention.md) | 커밋 메시지 형식, type/scope/기능ID 규칙 |
| [branch-strategy.md](./branch-strategy.md) | 브랜치 구조, 네이밍, merge 방식, 보호 규칙, hotfix |
| [pr-guide.md](./pr-guide.md) | PR 작성, Draft PR, 리뷰 프로세스, 코멘트 컨벤션 |
| [issue-guide.md](./issue-guide.md) | 이슈 제목 형식, 라벨 체계 |

### 개발 가이드

| 문서 | 내용 |
|------|------|
| [common-convention.md](./common-convention.md) | JSON 형식, 공통 응답 형식, HTTP 상태코드, API 명세서 관리 |
| [backend-convention.md](./backend-convention.md) | 패키지 구조, 네이밍, API 설계, 예외 처리, 테스트, CORS, 인증, 환경 분리 등 |
| [frontend-convention.md](./frontend-convention.md) | 폴더 구조, 컴포넌트/훅 규칙, API 호출 규칙 |

### CI/CD

| 문서 | 내용 |
|------|------|
| [cicd.md](./cicd.md) | TeamCity 기반 빌드/테스트/배포 파이프라인, 단계별 적용 계획 |

## 작업 흐름 요약

```
이슈 생성 → develop에서 feature 브랜치 생성 → 작업/커밋
→ PR 생성 (closes #이슈) → 리뷰 승인 + CI 통과 → squash merge → 브랜치 삭제
```

## 기계가 읽는 파일 (docs 밖, 위치 고정)

| 파일 | 위치 | 역할 |
|------|------|------|
| PR 템플릿 | `.github/PULL_REQUEST_TEMPLATE.md` | PR 생성 시 자동 삽입 |
| 이슈 템플릿 | `.github/ISSUE_TEMPLATE/` | 이슈 생성 시 선택 |
| CI 워크플로 | TeamCity 설정 | 빌드/테스트 자동 실행 |