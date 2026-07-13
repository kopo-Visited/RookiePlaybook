# QNA API 테스트 리포트

- **대상**: QNA 백엔드 API (질문 / 관리자 답변 / 알림 / 카테고리)
- **환경**: 로컬 `local` 프로파일 (H2 인메모리 + `data-h2.sql` 시드), `http://localhost:8080`
- **인증**: `POST /api/auth/login` → `Authorization: Bearer <accessToken>`
- **실행일**: 2026-07-13
- **방식**: `curl` + `jq` 통합 테스트 스크립트로 엔드포인트별 상태코드/응답 검증
- **계정**: `admin@company.com` / `Admin1234!` (ROLE_ADMIN, id=1), `user@company.com` / `Admin1234!` (ROLE_USER, id=2)

## 요약

| 구분 | 결과 |
|------|------|
| 총 테스트 케이스 | 24 |
| 정상 동작 | 23 |
| 결함 발견 | 1 (관리자 상태변경에 잘못된 enum 값 → 400 대신 500) |
| 결함 조치 | **✅ 수정 완료** (2026-07-13, 재검증 통과) |

전체 QNA CRUD·권한·검증·알림 흐름은 정상. 발견된 이슈(잘못된 상태값 입력 시 500 반환)는 수정 후 400으로 정상 반환됨을 재검증 완료.

## 테스트한 엔드포인트 (컨트롤러 기준)

- `AuthController` — `/api/auth/login`
- `QuestionController` — `/api/questions*` (등록·내 목록·전체 공개·상세·수정·삭제)
- `AdminQnaController` — `/api/admin/questions*` (목록·상세·답변·상태변경)
- `NotificationController` — `/api/notifications*` (목록·읽음·전체삭제)
- `QuestionCategoryController` — `/api/question-categories`

## 상세 결과

### 1. 인증 (AuthController)

| ID | 시나리오 | 메서드/경로 | 기대 | 실제 | 결과 |
|----|----------|-------------|:----:|:----:|:----:|
| AUTH-01 | 로그인 성공(admin) | POST `/api/auth/login` | 200 | 200 | ✅ |
| AUTH-02 | 잘못된 비밀번호 | POST `/api/auth/login` | 401 | 401 | ✅ |
| AUTH-03 | 이메일 형식 오류(검증) | POST `/api/auth/login` | 400 | 400 | ✅ |
| AUTH-04 | 토큰 없이 보호 API 접근 | GET `/api/questions/me` | 401 | 401 | ✅ |

- 실패/검증 응답 메시지 정상: `"이메일 또는 비밀번호가 일치하지 않습니다."`, `"이메일 형식이 올바르지 않습니다."`, `"로그인이 필요합니다."`
- 로그인 응답에 `accessToken`, `userId`, `name`, `roleCode`, `passwordChangeRequired` 등 포함 확인.

### 2. 질문 카테고리 (QuestionCategoryController)

| ID | 시나리오 | 메서드/경로 | 기대 | 실제 | 결과 |
|----|----------|-------------|:----:|:----:|:----:|
| CAT-01 | 카테고리 목록 조회 | GET `/api/question-categories` | 200 | 200 | ✅ |

- 시드 카테고리(공통/개발/인프라/보안/네트워크) `categoryId`·`name` 정상 반환.

### 3. 사용자 질문 CRUD (QuestionController)

| ID | 시나리오 | 메서드/경로 | 기대 | 실제 | 결과 |
|----|----------|-------------|:----:|:----:|:----:|
| Q-01 | 내 질문 목록(페이징) | GET `/api/questions/me?page=0&size=10` | 200 | 200 | ✅ |
| Q-02 | 질문 등록 | POST `/api/questions` | 201 | 201 | ✅ |
| Q-03 | 등록 검증실패(제목 누락) | POST `/api/questions` | 400 | 400 | ✅ |
| Q-04 | 등록 검증실패(카테고리 누락) | POST `/api/questions` | 400 | 400 | ✅ |
| Q-05 | 내 질문 상세 조회 | GET `/api/questions/{id}` | 200 | 200 | ✅ |
| Q-06 | 질문 수정(RECEIVED) | PUT `/api/questions/{id}` | 200 | 200 | ✅ |
| Q-07 | 없는 질문 상세(404) | GET `/api/questions/999999` | 404 | 404 | ✅ |
| Q-08 | 전체 공개 질문 목록 | GET `/api/questions/all` | 200 | 200 | ✅ |
| Q-09 | 공개 질문 상세 | GET `/api/questions/all/1` | 200 | 200 | ✅ |
| Q-10 | 신규 질문 즉시 삭제(RECEIVED) | DELETE `/api/questions/{id}` | 200 | 200 | ✅ |
| Q-11 | 답변 진행 질문 삭제(불가) | DELETE `/api/questions/{id}` | 403 | 403 | ✅ |

- 등록 성공 시 `questionId`, `status: RECEIVED` 반환. 페이징 응답은 `content` 배열 구조.
- 검증 메시지 정상: `"제목은 200자 이내로 입력해 주세요."`, `"카테고리를 선택해 주세요."`, 404 시 `"존재하지 않는 질문입니다."`
- **삭제 규칙 정상**: RECEIVED 본인 질문은 삭제 200, 답변 진행/완료 질문은 403 `"답변이 진행 중인 질문은 삭제할 수 없습니다."`

### 4. 관리자 QNA (AdminQnaController)

| ID | 시나리오 | 메서드/경로 | 기대 | 실제 | 결과 |
|----|----------|-------------|:----:|:----:|:----:|
| AQ-01 | 관리자 질문 목록 | GET `/api/admin/questions` | 200 | 200 | ✅ |
| AQ-02 | 일반 사용자의 관리자 API 접근 | GET `/api/admin/questions` | 403 | 403 | ✅ |
| AQ-03 | 관리자 질문 상세 | GET `/api/admin/questions/{id}` | 200 | 200 | ✅ |
| AQ-04 | 답변 등록 | PUT `/api/admin/questions/{id}/answer` | 200 | 200 | ✅ |
| AQ-05 | 상태 변경(보류) | PATCH `/api/admin/questions/{id}/status` | 200 | 200 | ✅ |
| AQ-06 | 잘못된 상태값 입력 | PATCH `/api/admin/questions/{id}/status` | 400 | 500 → **400** | ✅ (수정 후) |

- 목록 응답에 `writerName` 등 작성자 정보 채워짐(N+1 방지 배치조회) 확인.
- 답변 등록 시 `answerId`, `questionStatus: ANSWERED`, `isNewAnswer` 반환 → 질문 상태 자동 전이 및 질문자 알림 생성 확인.
- 상태 변경 시 `{questionId, status}` 반환, `memo` 반영.
- 권한 분리 정상: ROLE_USER의 `/api/admin/*` 접근은 403 `"접근 권한이 없습니다."`

### 5. 알림 (NotificationController)

| ID | 시나리오 | 메서드/경로 | 기대 | 실제 | 결과 |
|----|----------|-------------|:----:|:----:|:----:|
| N-01 | 내 알림 목록 | GET `/api/notifications` | 200 | 200 | ✅ |
| N-02 | 알림 읽음 처리 | PATCH `/api/notifications/{id}/read` | 200 | 200 | ✅ |
| N-03 | 알림 전체 삭제 | DELETE `/api/notifications` | 200 | 200 | ✅ |

- 목록 응답 구조: `{ unreadCount, content: [{ notificationId, questionId, type, message, isRead, createdAt }] }`.
- 답변 등록/상태 변경 후 해당 사용자에게 `ANSWER_REGISTERED`·`STATUS_CHANGED` 알림 실시간 생성 확인.

## 발견된 이슈

### ISSUE-1 · 잘못된 상태 enum 값 입력 시 500 반환 (경미) — ✅ 수정 완료

- **엔드포인트**: `PATCH /api/admin/questions/{id}/status`
- **요청**: `{"status":"NOPE"}` (정의되지 않은 `QuestionStatus` 값)
- **기대**: 400 `INVALID_REQUEST` (검증 오류)
- **수정 전 실제**: `500` `{"errorCode":"SERVER_ERROR","message":"일시적인 오류가 발생했습니다."}`
- **원인**: 요청 본문의 문자열을 `QuestionStatus` enum으로 역직렬화(Jackson)하다 실패하면 `HttpMessageNotReadableException`이 발생하는데, 이를 400으로 매핑하는 핸들러가 없어 공통 `Exception` 핸들러(500)로 떨어짐.
- **조치**: `GlobalExceptionHandler`에 `@ExceptionHandler(HttpMessageNotReadableException.class)`를 추가하여 400 `INVALID_REQUEST`로 매핑. 잘못된 enum 값뿐 아니라 깨진 JSON 본문 전반이 400으로 처리됨.
  - 파일: `backend/.../global/exception/GlobalExceptionHandler.java`
- **수정 후 재검증 (2026-07-13)**:
  | 케이스 | 요청 | 결과 |
  |--------|------|:----:|
  | 잘못된 enum status | `{"status":"NOPE"}` | 400 ✅ |
  | 깨진 JSON 본문 | `{"categoryId":2,"title":` | 400 ✅ |
  | 정상 상태변경(회귀) | `{"status":"IN_PROGRESS"}` | 200 ✅ |
  | 필드검증(회귀, 제목 누락) | — | 400 ✅ |

## 미커버 항목 (후속 테스트 권장)

- `POST /api/admin/questions/{id}/faq` (FAQ 전환) — 시드에 FAQ 카테고리 데이터가 없어 유효 `faqCategoryId` 확보 불가로 미실행.
- `AdminQuestionCategoryController` (`/api/admin/question-categories` 생성·수정·삭제) — 이번 범위 외.
- `POST /api/auth/logout` — 이번 범위 외.
- 동시성/부하 테스트, 대량 페이징 경계값.

## 재현 방법

```bash
# 1) 백엔드 기동 (Java 21)
cd backend
JAVA_HOME=/Users/adieu/Library/Java/JavaVirtualMachines/ms-21.0.11/Contents/Home \
  sh ./gradlew bootRun --args='--spring.profiles.active=local'

# 2) 로그인 후 토큰으로 각 엔드포인트 호출 (예시)
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@company.com","password":"Admin1234!"}' | jq -r .data.accessToken)
curl -s http://localhost:8080/api/questions/me -H "Authorization: Bearer $TOKEN" | jq
```
