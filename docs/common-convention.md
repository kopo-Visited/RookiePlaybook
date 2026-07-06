# 공통 코딩 규칙

## 공통 응답 형식

모든 API 응답은 아래 형식으로 통일한다. 프론트엔드는 이 구조를 기준으로 응답 처리 로직(인터셉터)을 단일화한다.

**성공:**
```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {}
}
```

**실패:**
```json
{
  "success": false,
  "message": "오류 메시지",
  "errorCode": "ERROR_CODE"
}
```

- `success`: 요청 성공 여부 (boolean)
- `message`: 성공 시 처리 결과 메시지, 실패 시 오류 메시지
- `data`: 응답 데이터. 성공 시에만 존재, 실패 시 없음
- `errorCode`: 실패 시에만 존재. 프론트엔드가 에러 종류를 구분할 때 사용

## 공통 에러 코드

| HTTP Status | Error Code | 발생 상황 | 메시지 |
|-------------|-----------|----------|--------|
| 400 | `INVALID_REQUEST` | 요청값 오류 | 요청값을 확인해주세요. |
| 401 | `UNAUTHORIZED` | 로그인 필요 | 로그인이 필요합니다. |
| 403 | `FORBIDDEN` | 권한 없음 | 접근 권한이 없습니다. |
| 404 | `NOT_FOUND` | 데이터 없음 | 조회된 데이터가 없습니다. |
| 500 | `SERVER_ERROR` | 서버 오류 | 일시적인 오류가 발생했습니다. |

### 케이스별 예시

**단건 조회 (data = 객체):**
```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {
    "id": 1,
    "title": "신입사원 온보딩 가이드",
    "createdAt": "2024-03-15T09:30:00Z"
  }
}
```

**목록 조회 (data = 배열):**
```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": [
    { "id": 1, "title": "온보딩 가이드" },
    { "id": 2, "title": "업무 매뉴얼" }
  ]
}
```

**생성/삭제 성공 (반환할 데이터 없음):**
```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다."
}
```

**실패:**
```json
{
  "success": false,
  "message": "조회된 데이터가 없습니다.",
  "errorCode": "NOT_FOUND"
}
```

## JSON 형식 규칙

### 키 네이밍

- **camelCase** 사용 (snake_case 금지)
- 축약어 금지: `docNm` ❌ → `documentName` ✅

```json
// ✅ 좋은 예
{
  "documentTitle": "신입사원 온보딩 가이드",
  "categoryName": "인사팀",
  "isCompleted": true,
  "createdAt": "2024-03-15T09:30:00Z"
}

// ❌ 나쁜 예
{
  "doc_title": "신입사원 온보딩 가이드",
  "cat_nm": "인사팀",
  "is_completed": true
}
```

### 빈 값 처리

- 값이 없을 때 빈 문자열(`""`) 금지 → `null` 사용
- 빈 배열은 `null` 대신 `[]` 사용

```json
{
  "description": null,
  "tags": []
}
```

### 날짜/시간 형식

- ISO 8601 형식 사용: `"2024-03-15T09:30:00Z"`
- 타임존은 UTC 기준으로 통일 (KST/UTC 혼용 시 날짜 계산 오류 발생)
- 화면에 표시할 때의 KST 변환은 프론트엔드에서 처리

## API 명세서 관리

- 명세서 도구: **Swagger (SpringDoc OpenAPI)**
- 로컬 실행 후 `http://localhost:8080/swagger-ui/index.html` 에서 확인
- 설정 방법 및 어노테이션 규칙 → [backend-convention.md](./backend-convention.md) 참조
- 명세서 업데이트 담당: **API를 추가/수정한 사람이 직접 책임**
- 프론트엔드가 명세서와 다른 응답을 받으면 백엔드에 이슈로 제보

## 주석 규칙

- 코드를 보면 바로 알 수 있는 내용은 주석 금지 (노이즈)
- **왜** 이렇게 했는지를 주석으로 — 무엇을 했는지는 코드 자체가 설명해야 함

```java
// ❌ 나쁜 예 — 코드 읽으면 바로 아는 내용
// 문서 ID로 문서 조회
Document document = documentRepository.findById(id);

// ✅ 좋은 예 — 이유가 있는 주석
// 관리자와 일반 사용자가 같은 문서를 조회하지만
// 관리자는 삭제된 문서도 볼 수 있어야 하므로 분기 처리
Document document = isAdmin
    ? documentRepository.findByIdIncludeDeleted(id)
    : documentRepository.findById(id);
```

## 들여쓰기 및 포매팅

- 포매팅은 린터가 강제한다 (백엔드: Checkstyle — 선택사항, 프론트엔드: ESLint + Prettier)

## 커밋 전 체크리스트

- [ ] 콘솔 출력 코드 제거 (`System.out.println`, `console.log`)
- [ ] 미사용 import 제거
- [ ] 린터 오류 없음
- [ ] 로컬에서 빌드/실행 확인
- [ ] Swagger 어노테이션 작성 완료 (API 추가/수정 시)