# API 명세서

## 1. 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | 사내 지식 문서 및 온보딩 교육 관리 웹서비스 |
| 문서명 | API 명세서 |
| Base URL | /api |
| 인증 방식 | Spring Security + Session 또는 JWT |

---

## 2. 모듈 분담

| 구분 | 모듈 코드 | 모듈명 |
| --- | --- | --- |
| A | AUTH | 회원/권한 + 공통 관리 |
| B | DOC | 지식 문서/FAQ |
| C | QNA | 질문/답변 + FAQ 전환 |
| D | EDU | 온보딩 교육 |

---

## 3. API 공통 규칙

### 3.1 URL 규칙

| 구분 | 규칙 | 예시 |
| --- | --- | --- |
| 일반 API | /api/{resource} | /api/documents |
| 관리자 API | /api/admin/{resource} | /api/admin/documents |
| 상세 조회 | /api/{resource}/{id} | /api/documents/1 |
| 검색 | /api/{resource}/search | /api/documents/search |

### 3.1.1 인증/현재 사용자 API 예외 규칙

| 구분 | 예외 URL | 사유 |
| --- | --- | --- |
| 로그인 | /api/auth/login | Spring Security 인증 흐름을 고려하여 예외적으로 사용한다. |
| 로그아웃 | /api/auth/logout | Spring Security 인증 흐름을 고려하여 예외적으로 사용한다. |
| 현재 사용자 조회 | /api/users/me | 현재 로그인한 사용자를 의미하는 관용적 경로로 사용한다. |

### 3.2 Method 규칙

| Method | 사용 목적 |
| --- | --- |
| GET | 목록 조회, 상세 조회 |
| POST | 등록, 요청 처리 |
| PUT | 전체 수정 |
| PATCH | 일부 수정, 상태 변경 |
| DELETE | 삭제 |

### 3.3 공통 응답 형식

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {}
}
```

### 3.4 공통 에러 응답 형식

```json
{
  "success": false,
  "message": "오류 메시지",
  "errorCode": "ERROR_CODE"
}
```

### 3.5 공통 에러 코드

| HTTP Status | Error Code | 발생 상황 | 메시지 |
| --- | --- | --- | --- |
| 400 | INVALID_REQUEST | 요청값 오류 | 요청값을 확인해주세요. |
| 401 | UNAUTHORIZED | 로그인 필요 | 로그인이 필요합니다. |
| 403 | FORBIDDEN | 권한 없음 | 접근 권한이 없습니다. |
| 404 | NOT_FOUND | 데이터 없음 | 조회된 데이터가 없습니다. |
| 409 | CONFLICT | 데이터 충돌 | 이미 처리되었거나 중복된 요청입니다. |
| 500 | SERVER_ERROR | 서버 오류 | 일시적인 오류가 발생했습니다. |

---

# 4. AUTH API

## 4.1 API 목록

| API ID | 기능 ID | Method | URL | 권한 | 설명 |
| --- | --- | --- | --- | --- | --- |
| AUTH-API-001 | AUTH-FR-001 | POST | /api/admin/users | ROLE_ADMIN | 관리자가 사내 사용자를 등록한다. |
| AUTH-API-002 | AUTH-FR-002 | POST | /api/auth/login | ALL | 등록된 사용자가 로그인한다. |
| AUTH-API-003 | AUTH-FR-003 | POST | /api/auth/logout | ROLE_USER, ROLE_ADMIN | 로그인한 사용자가 로그아웃한다. |
| AUTH-API-004 | AUTH-FR-004 | GET | /api/users/me | ROLE_USER, ROLE_ADMIN | 로그인한 사용자의 정보를 조회한다. |
| AUTH-API-005 | AUTH-FR-005 | GET | /api/admin/users | ROLE_ADMIN | 관리자가 사용자 목록을 페이지 단위로 조회한다. |
| AUTH-API-006 | AUTH-FR-006 | PUT | /api/admin/users/{userId} | ROLE_ADMIN | 관리자가 사용자 정보를 수정한다. |
| AUTH-API-007 | AUTH-FR-007 | PATCH | /api/admin/users/{userId}/roles | ROLE_ADMIN | 관리자가 사용자 권한을 변경한다. |
| AUTH-API-008 | AUTH-FR-008 | GET | /api/departments | ROLE_USER, ROLE_ADMIN | 부서 목록을 조회한다. |
| AUTH-API-009 | AUTH-FR-009 | PATCH | /api/users/me/password | ROLE_USER, ROLE_ADMIN | 로그인한 사용자가 본인 비밀번호를 변경한다. |

---

## 4.2 API 상세 명세

### [AUTH-API-001] 사용자 등록

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-001 |
| 기능 ID | AUTH-FR-001 |
| Method | POST |
| URL | /api/admin/users |
| 권한 | ROLE_ADMIN |
| 설명 | 관리자가 사내 사용자의 계정을 등록한다. |
| 관련 테이블 | users, departments, roles |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "name":"홍길동",
  "email":"user@company.com",
  "password":"Temp1234!",
  "departmentId":1,
  "roleId":1,
  "status":"ACTIVE"
}
```

#### Response Body

```json
{
  "success":true,
  "message":"사용자 등록이 완료되었습니다.",
  "data": {
    "userId":1,
    "name":"홍길동",
    "email":"user@company.com",
    "departmentName":"개발",
    "roleCode": "ROLE_USER",
		"roleName": "일반 사용자"
    "status":"ACTIVE"
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| name | 빈 값 불가 | 이름을 입력해주세요. |
| email | 빈 값 불가, 이메일 형식 | 올바른 이메일 형식이 아닙니다. |
| password | 빈 값 불가 | 초기 비밀번호를 입력해주세요. |
| departmentId | 필수 | 부서를 선택해주세요. |
| roleId | 필수 | 권한을 선택해주세요. |
| status | ACTIVE, INACTIVE 중 하나, 생략 시 ACTIVE | 유효하지 않은 상태값입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 필수값 누락 또는 형식 오류 | 요청값 검증 후 오류 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근을 차단한다. |
| 404 | 부서 또는 권한 정보 없음 | 유효하지 않은 부서/권한 메시지를 반환한다. |
| 409 | 이메일 중복 | 이미 등록된 이메일 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [AUTH-API-002] 로그인

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-002 |
| 기능 ID | AUTH-FR-002 |
| Method | POST |
| URL | /api/auth/login |
| 권한 | ALL |
| 설명 | 등록된 사용자가 이메일과 비밀번호로 로그인한다. |
| 관련 테이블 | users, roles |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "email":"user@company.com",
  "password":"Temp1234!"
}
```

#### Response Body

```json
{
  "success":true,
  "message":"로그인에 성공했습니다.",
  "data": {
    "userId":1,
    "name":"홍길동",
    "email":"user@company.com",
    "departmentName":"개발",
    "roleCode": "ROLE_USER",
		"roleName": "일반 사용자"
    "accessToken":"JWT 사용 시 토큰값"
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| email | 빈 값 불가, 이메일 형식 | 이메일을 입력해주세요. |
| password | 빈 값 불가 | 비밀번호를 입력해주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 이메일 또는 비밀번호 미입력 | 입력값 확인 메시지를 반환한다. |
| 401 | 이메일 또는 비밀번호 불일치 | 로그인 실패 메시지를 반환한다. |
| 403 | 비활성화된 계정 | 사용할 수 없는 계정 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [AUTH-API-003] 로그아웃

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-003 |
| 기능 ID | AUTH-FR-003 |
| Method | POST |
| URL | /api/auth/logout |
| 권한 | ROLE_USER |
| 설명 | 로그인한 사용자의 인증 상태를 해제한다. |
| 관련 테이블 | users |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success":true,
  "message":"로그아웃되었습니다.",
  "data":null
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| 없음 |  |  |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [AUTH-API-004] 내 정보 조회

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-004 |
| 기능 ID | AUTH-FR-004 |
| Method | GET |
| URL | /api/users/me |
| 권한 | ROLE_USER |
| 설명 | 로그인한 사용자의 기본 정보와 권한 정보를 조회한다. |
| 관련 테이블 | users, departments, roles |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success":true,
  "message":"내 정보 조회가 완료되었습니다.",
  "data": {
    "userId":1,
    "name":"홍길동",
    "email":"user@company.com",
    "departmentId":1,
    "departmentName":"개발",
    "roleCode": "ROLE_USER",
		"roleName": "일반 사용자"
    "status":"ACTIVE"
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| 없음 |  |  |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 404 | 사용자 정보 없음 | 사용자 정보를 찾을 수 없음 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [AUTH-API-005] 사용자 목록 조회

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-005 |
| 기능 ID | AUTH-FR-005 |
| Method | GET |
| URL | /api/admin/users |
| 권한 | ROLE_ADMIN |
| 설명 | 관리자가 전체 사용자 목록을 조회한다. |
| 관련 테이블 | users, departments, roles |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "사용자 목록 조회가 완료되었습니다.",
  "data": {
    "content": [
      {
        "userId": 1,
        "name": "홍길동",
        "email": "user@company.com",
        "departmentName": "개발",
        "roleCode": "ROLE_USER",
        "roleName": "일반 사용자",
        "status": "ACTIVE"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0,
    "first": true,
    "last": true
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| departmentId | Long | N | 부서 ID | 1 |
| roleId | Long | N | 권한 ID | 1 |
| status | String | N | 계정 상태 | ACTIVE |
| keyword | String | N | 이름 또는 이메일 검색어 | 홍길동 |
| page | Integer | N | 페이지 번호, 0부터 시작 | 0 |
| size | Integer | N | 한 페이지 데이터 수 | 10 |
| sort | String | N | 정렬 기준 | createdAt,desc |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| departmentId | 존재하는 부서 ID | 유효하지 않은 부서입니다. |
| roleId | 존재하는 권한 ID | 유효하지 않은 권한입니다. |
| status | 허용된 상태값 | 유효하지 않은 상태값입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근 권한 없음 메시지를 반환한다. |
| 400 | 잘못된 검색 조건 | 요청값 확인 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [AUTH-API-006] 사용자 정보 수정

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-006 |
| 기능 ID | AUTH-FR-006 |
| Method | PUT |
| URL | /api/admin/users/{userId} |
| 권한 | ROLE_ADMIN |
| 설명 | 관리자가 사용자의 기본 정보를 수정한다. |
| 관련 테이블 | users, departments |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "name":"홍길동",
  "departmentId":2,
  "status":"ACTIVE"
}
```

#### Response Body

```json
{
  "success":true,
  "message":"사용자 정보가 수정되었습니다.",
  "data": {
    "userId":1,
    "name":"홍길동",
    "email":"user@company.com",
    "departmentName":"인프라",
    "status":"ACTIVE"
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| userId | Long | Y | 수정 대상 사용자 ID | 1 |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| name | 빈 값 불가 | 이름을 입력해주세요. |
| departmentId | 존재하는 부서 ID | 유효하지 않은 부서입니다. |
| status | 허용된 상태값 | 유효하지 않은 상태값입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 요청값 오류 | 요청값 확인 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근 권한 없음 메시지를 반환한다. |
| 404 | 수정 대상 사용자 없음 | 사용자 정보를 찾을 수 없음 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [AUTH-API-007] 사용자 권한 변경

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-007 |
| 기능 ID | AUTH-FR-007 |
| Method | PATCH |
| URL | /api/admin/users/{userId}/roles |
| 권한 | ROLE_ADMIN |
| 설명 | 관리자가 사용자의 권한을 변경한다. |
| 관련 테이블 | users, roles |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "roleId":2
}
```

#### Response Body

```json
{
  "success":true,
  "message":"사용자 권한이 변경되었습니다.",
  "data": {
    "userId":1,
    "name":"홍길동",
    "roleCode":"ROLE_ADMIN",
    "roleName":"관리자"
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| userId | Long | Y | 권한 변경 대상 사용자 ID | 1 |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| roleId | 존재하는 권한 ID | 유효하지 않은 권한입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 요청값 오류 | 요청값 확인 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근 권한 없음 메시지를 반환한다. |
| 404 | 사용자 또는 권한 정보 없음 | 대상 정보를 찾을 수 없음 메시지를 반환한다. |
| 409 | 본인 관리자 권한 해제 시도 | 변경 제한 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [AUTH-API-008] 부서 목록 조회

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-008 |
| 기능 ID | AUTH-FR-008 |
| Method | GET |
| URL | /api/departments |
| 권한 | ROLE_USER |
| 설명 | 서비스에서 사용하는 부서 목록을 조회한다. |
| 관련 테이블 | departments |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success":true,
  "message":"부서 목록 조회가 완료되었습니다.",
  "data": [
    {
      "departmentId":1,
      "departmentName":"개발"
    },
    {
      "departmentId":2,
      "departmentName":"인프라"
    },
    {
      "departmentId":3,
      "departmentName":"보안"
    },
    {
      "departmentId":4,
      "departmentName":"네트워크"
    }
  ]
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| 없음 |  |  |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [AUTH-API-009] 비밀번호 변경

| 항목 | 내용 |
| --- | --- |
| API ID | AUTH-API-009 |
| 기능 ID | AUTH-FR-009 |
| Method | PATCH |
| URL | /api/users/me/password |
| 권한 | ROLE_USER |
| 설명 | 로그인한 사용자가 본인의 비밀번호를 변경한다. |
| 관련 테이블 | users |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "currentPassword":"Temp1234!",
  "newPassword":"New1234!"
}
```

#### Response Body

```json
{
  "success":true,
  "message":"비밀번호가 변경되었습니다.",
  "data":null
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| currentPassword | 빈 값 불가 | 현재 비밀번호를 입력해주세요. |
| newPassword | 빈 값 불가 | 새 비밀번호를 입력해주세요. |
| newPassword | 기존 비밀번호와 다르게 입력 | 기존 비밀번호와 다른 비밀번호를 입력해주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 요청값 오류 | 요청값 확인 메시지를 반환한다. |
| 400 | 현재 비밀번호 불일치 | 현재 비밀번호 불일치 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

# 5. DOC API

## 5.1 API 목록

| API ID | 기능 ID | Method | URL | 권한 | 설명 |
| --- | --- | --- | --- | --- | --- |
| DOC-API-001 | DOC-FR-001 | GET | /api/documents | USER | 문서 목록을 조회 |
| DOC-API-002 | DOC-FR-002 | GET | /api/documents/{documentId} | USER | 문서 상세를 조회 |
| DOC-API-003 | DOC-FR-003 | GET | /api/documents?categoryId={id} | USER | 카테고리별 문서를 조회 |
| DOC-API-004 | DOC-FR-004 | GET | /api/documents?tagId={id} | USER | 태그별 문서를 조회 |
| DOC-API-005 | DOC-FR-005 | GET | /api/documents/search | USER | 문서·FAQ를 검색 |
| DOC-API-006 | DOC-FR-006 | GET | /api/documents/popular | USER | 인기 문서를 조회 |
| DOC-API-007 | DOC-FR-007 | POST | /api/documents/{documentId}/views | USER | 문서 조회수를 증가 |
| DOC-API-008 | DOC-FR-008 | POST | /api/documents/{documentId}/bookmarks | USER | 문서 북마크를 토글 |
| DOC-API-009 | DOC-FR-009 | POST | /api/documents/{documentId}/feedback | USER | 문서 도움됨 여부를 표시 |
| DOC-API-010 | DOC-FR-010 | GET | /api/faqs | USER | FAQ 목록을 조회 |
| DOC-API-011 | DOC-FR-011 | POST | /api/admin/documents | ADMIN | 관리자가 문서를 등록 |
| DOC-API-012 | DOC-FR-012 | PUT | /api/admin/documents/{documentId} | ADMIN | 관리자가 문서를 수정 |
| DOC-API-013 | DOC-FR-013 | DELETE | /api/admin/documents/{documentId} | ADMIN | 관리자가 문서를 삭제 |
| DOC-API-014 | DOC-FR-014 | POST | /api/admin/faqs | ADMIN | FAQ 등록 |
| DOC-API-015 | DOC-FR-014 | PUT | /api/admin/faqs/{faqId} | ADMIN | FAQ 수정 |
| DOC-API-016 | DOC-FR-014 | DELETE | /api/admin/faqs/{faqId} | ADMIN | FAQ 삭제 |
| DOC-API-017 | DOC-FR-015 | POST | /api/admin/categories | ADMIN | 카테고리 등록 |
| DOC-API-018 | DOC-FR-015 | PUT | /api/admin/categories/{categoryId} | ADMIN | 카테고리 수정 |
| DOC-API-019 | DOC-FR-015 | DELETE | /api/admin/categories/{categoryId} | ADMIN | 카테고리 삭제 |
| DOC-API-020 | DOC-FR-015 | POST | /api/admin/tags | ADMIN | 태그 등록 |
| DOC-API-021 | DOC-FR-015 | PUT | /api/admin/tags/{tagId} | ADMIN | 태그 수정 |
| DOC-API-022 | DOC-FR-015 | DELETE | /api/admin/tags/{tagId} | ADMIN | 태그 삭제 |
| DOC-API-023 | DOC-FR-016 | PATCH | /api/admin/documents/{documentId}/visibility | ADMIN | 공개/비공개 변경 |
| DOC-API-024 | DOC-FR-017 | PATCH | /api/admin/documents/{documentId}/main-exposure | ADMIN | 메인 노출 설정 |

## 5.2 API 상세 명세

### [DOC-API-001] 문서 목록 조회

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-001 |
| 기능 ID | DOC-FR-001 |
| Method | GET |
| URL | /api/documents |
| 권한 | USER |
| 설명 | 공개 문서 목록을 최신순·인기순으로 페이지 단위로 조회한다. |
| 관련 테이블 | documents, categories |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "문서 목록 조회가 완료되었습니다.",
  "data": {
    "content": [
      {
        "documentId": 1,
        "title": "VPN 접속 가이드",
        "categoryName": "인프라",
        "viewCount": 482,
        "createdAt": "2026-07-01 10:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 42,
    "totalPages": 5
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| sort | String | N | 정렬 기준 (latest, popular) | latest |
| page | Integer | N | 페이지 번호 | 0 |
| size | Integer | N | 페이지 크기 | 10 |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| sort | 허용된 정렬값 | 유효하지 않은 정렬 기준입니다. |
| page | 0 이상 정수 | 유효하지 않은 페이지 번호입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 400 | 잘못된 정렬/페이지 값 | 요청값 확인 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-002] 문서 상세 조회

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-002 |
| 기능 ID | DOC-FR-002 |
| Method | GET |
| URL | /api/documents/{documentId} |
| 권한 | USER |
| 설명 | 선택한 문서의 상세 정보와 관련 문서를 조회한다. |
| 관련 테이블 | documents, categories, tags, document_tags |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "문서 상세 조회가 완료되었습니다.",
  "data": {
    "documentId": 1,
    "title": "VPN 접속 가이드",
    "content": "VPN 접속 방법은 다음과 같습니다...",
    "categoryId": 2,
    "categoryName": "인프라",
    "tags": ["VPN", "네트워크"],
    "viewCount": 483,
    "helpfulCount": 25,
    "isBookmarked": false,
    "createdAt": "2026-07-01 10:00:00",
    "relatedDocuments": [
      { "documentId": 5, "title": "사내 와이파이 설정" }
    ]
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| documentId | Long | Y | 조회 대상 문서 ID | 1 |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| documentId | 존재하는 문서 ID | 존재하지 않는 문서입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 비공개 문서 접근 | 열람 권한 없음 메시지를 반환한다. |
| 404 | 문서 없음 또는 삭제됨 | 존재하지 않는 문서 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-003] 카테고리별 문서 조회

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-003 |
| 기능 ID | DOC-FR-003 |
| Method | GET |
| URL | /api/documents |
| 권한 | USER |
| 설명 | 특정 카테고리에 속한 공개 문서 목록을 조회한다. |
| 관련 테이블 | documents, categories |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "카테고리별 문서 조회가 완료되었습니다.",
  "data": {
    "categoryId": 2,
    "categoryName": "인프라",
    "content": [
      { "documentId": 1, "title": "VPN 접속 가이드", "viewCount": 482 }
    ],
    "totalElements": 12
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| categoryId | Long | Y | 카테고리 ID | 2 |
| page | Integer | N | 페이지 번호 | 0 |
| size | Integer | N | 페이지 크기 | 10 |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| categoryId | 존재하는 카테고리 ID | 존재하지 않는 카테고리입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 404 | 카테고리 없음 | 존재하지 않는 카테고리 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-004] 태그별 문서 조회

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-004 |
| 기능 ID | DOC-FR-004 |
| Method | GET |
| URL | /api/documents |
| 권한 | USER |
| 설명 | 특정 태그가 매핑된 공개 문서 목록을 조회한다. |
| 관련 테이블 | documents, tags, document_tags |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "태그별 문서 조회가 완료되었습니다.",
  "data": {
    "tagId": 3,
    "tagName": "VPN",
    "content": [
      { "documentId": 1, "title": "VPN 접속 가이드", "viewCount": 482 }
    ],
    "totalElements": 4
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| tagId | Long | Y | 태그 ID | 3 |
| page | Integer | N | 페이지 번호 | 0 |
| size | Integer | N | 페이지 크기 | 10 |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| tagId | 존재하는 태그 ID | 존재하지 않는 태그입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 404 | 태그 없음 | 존재하지 않는 태그 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-005] 문서 검색

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-005 |
| 기능 ID | DOC-FR-005 |
| Method | GET |
| URL | /api/documents/search |
| 권한 | USER |
| 설명 | 키워드로 문서와 FAQ를 검색한다. 검색어는 통계용으로 기록한다. |
| 관련 테이블 | documents, faqs, search_logs |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "검색이 완료되었습니다.",
  "data": {
    "keyword": "VPN",
    "documents": [
      { "documentId": 1, "title": "VPN 접속 가이드", "categoryName": "인프라" }
    ],
    "faqs": [
      { "faqId": 7, "question": "VPN 비밀번호는 어디서 바꾸나요?" }
    ],
    "totalCount": 2
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| keyword | String | Y | 검색어 (2자 이상) | VPN |
| page | Integer | N | 페이지 번호 | 0 |
| size | Integer | N | 페이지 크기 | 10 |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| keyword | 빈 값 불가 | 검색어를 입력해주세요. |
| keyword | 2자 이상 | 두 글자 이상 입력해주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 검색어 미입력 또는 2자 미만 | 검색어 확인 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-006] 인기 문서 조회

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-006 |
| 기능 ID | DOC-FR-006 |
| Method | GET |
| URL | /api/documents/popular |
| 권한 | USER |
| 설명 | 조회수 상위 공개 문서를 조회한다. |
| 관련 테이블 | documents, document_views |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "인기 문서 조회가 완료되었습니다.",
  "data": [
    { "documentId": 1, "title": "VPN 접속 가이드", "viewCount": 482 },
    { "documentId": 3, "title": "경비 처리 방법", "viewCount": 361 }
  ]
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| limit | Integer | N | 조회 개수 | 5 |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| limit | 1 이상 정수 | 유효하지 않은 개수입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-007] 문서 조회수 증가

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-007 |
| 기능 ID | DOC-FR-007 |
| Method | POST |
| URL | /api/documents/{documentId}/view |
| 권한 | USER |
| 설명 | 문서 상세 진입 시 조회수를 1 증가시킨다. |
| 관련 테이블 | documents, document_views |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "조회수가 반영되었습니다.",
  "data": {
    "documentId": 1,
    "viewCount": 483
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| documentId | Long | Y | 대상 문서 ID | 1 |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| documentId | 존재하는 문서 ID | 존재하지 않는 문서입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 404 | 문서 없음 | 존재하지 않는 문서 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-008] 문서 북마크 토글

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-008 |
| 기능 ID | DOC-FR-008 |
| Method | POST |
| URL | /api/documents/{documentId}/bookmark |
| 권한 | USER |
| 설명 | 문서 북마크를 등록하거나 해제한다(토글). |
| 관련 테이블 | bookmarks |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "북마크가 반영되었습니다.",
  "data": {
    "documentId": 1,
    "isBookmarked": true
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| documentId | Long | Y | 대상 문서 ID | 1 |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| documentId | 존재하는 문서 ID | 존재하지 않는 문서입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 404 | 문서 없음 | 존재하지 않는 문서 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-009] 문서 도움됨 표시

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-009 |
| 기능 ID | DOC-FR-009 |
| Method | POST |
| URL | /api/documents/{documentId}/helpful |
| 권한 | USER |
| 설명 | 문서에 도움됨/도움 안 됨을 표시한다. |
| 관련 테이블 | documents |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "helpful": true
}
```

#### Response Body

```json
{
  "success": true,
  "message": "평가가 반영되었습니다.",
  "data": {
    "documentId": 1,
    "helpfulCount": 26,
    "notHelpfulCount": 2
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| documentId | Long | Y | 대상 문서 ID | 1 |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| helpful | Boolean 필수 | 평가 값을 확인해주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 요청값 오류 | 요청값 확인 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 404 | 문서 없음 | 존재하지 않는 문서 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-010] FAQ 목록 조회

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-010 |
| 기능 ID | DOC-FR-010 |
| Method | GET |
| URL | /api/faqs |
| 권한 | USER |
| 설명 | 등록된 FAQ 목록을 카테고리별로 조회한다. |
| 관련 테이블 | faqs, categories |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "FAQ 목록 조회가 완료되었습니다.",
  "data": [
    {
      "faqId": 7,
      "question": "VPN 비밀번호는 어디서 바꾸나요?",
      "answer": "사내 포털 > 계정 설정에서 변경할 수 있습니다.",
      "categoryName": "인프라"
    }
  ]
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| categoryId | Long | N | 카테고리 ID | 2 |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| categoryId | 존재하는 카테고리 ID | 유효하지 않은 카테고리입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-011] 문서 등록

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-011 |
| 기능 ID | DOC-FR-011 |
| Method | POST |
| URL | /api/admin/documents |
| 권한 | ADMIN |
| 설명 | 관리자가 신규 문서를 등록한다. |
| 관련 테이블 | documents, categories, tags, document_tags |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "title": "VPN 접속 가이드",
  "content": "VPN 접속 방법은 다음과 같습니다...",
  "categoryId": 2,
  "tags": ["VPN", "네트워크"],
  "isPublic": true,
  "isMain": false
}
```

#### Response Body

```json
{
  "success": true,
  "message": "문서가 등록되었습니다.",
  "data": {
    "documentId": 10,
    "title": "VPN 접속 가이드",
    "categoryName": "인프라",
    "isPublic": true
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| title | 빈 값 불가 | 제목을 입력해주세요. |
| content | 빈 값 불가 | 본문을 입력해주세요. |
| categoryId | 필수, 존재하는 카테고리 | 카테고리를 선택해주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 필수값 누락 또는 형식 오류 | 요청값 확인 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근 권한 없음 메시지를 반환한다. |
| 404 | 카테고리 없음 | 유효하지 않은 카테고리 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-012] 문서 수정

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-012 |
| 기능 ID | DOC-FR-012 |
| Method | PUT |
| URL | /api/admin/documents/{documentId} |
| 권한 | ADMIN |
| 설명 | 관리자가 기존 문서를 수정한다. |
| 관련 테이블 | documents, tags, document_tags |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "title": "VPN 접속 가이드 (수정)",
  "content": "수정된 본문 내용...",
  "categoryId": 2,
  "tags": ["VPN"],
  "isPublic": true,
  "isMain": true
}
```

#### Response Body

```json
{
  "success": true,
  "message": "문서가 수정되었습니다.",
  "data": {
    "documentId": 1,
    "title": "VPN 접속 가이드 (수정)",
    "isPublic": true,
    "isMain": true
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| documentId | Long | Y | 수정 대상 문서 ID | 1 |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| title | 빈 값 불가 | 제목을 입력해주세요. |
| content | 빈 값 불가 | 본문을 입력해주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 요청값 오류 | 요청값 확인 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근 권한 없음 메시지를 반환한다. |
| 404 | 문서 없음 | 존재하지 않는 문서 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-013] 문서 삭제

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-013 |
| 기능 ID | DOC-FR-013 |
| Method | DELETE |
| URL | /api/admin/documents/{documentId} |
| 권한 | ADMIN |
| 설명 | 관리자가 문서를 소프트 딜리트한다. |
| 관련 테이블 | documents |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | N | 요청 본문 없음 |

#### Request Body

```json
{

}
```

#### Response Body

```json
{
  "success": true,
  "message": "문서가 삭제되었습니다.",
  "data": null
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| documentId | Long | Y | 삭제 대상 문서 ID | 1 |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| documentId | 존재하는 문서 ID | 존재하지 않는 문서입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근 권한 없음 메시지를 반환한다. |
| 404 | 문서 없음 또는 이미 삭제됨 | 존재하지 않는 문서 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-014 FAQ] 등록

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-014 |
| 기능 ID | DOC-FR-014 |
| Method | POST |
| URL | /api/admin/faqs |
| 권한 | ADMIN |
| 설명 | 관리자가 FAQ를 등록한다. 
(수정은 PUT, 삭제는 DELETE 동일 리소스 사용) |
| 관련 테이블 | faqs, categories |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "question": "VPN 비밀번호는 어디서 바꾸나요?",
  "answer": "사내 포털 > 계정 설정에서 변경할 수 있습니다.",
  "categoryId": 2,
  "isPublic": true
}
```

#### Response Body

```json
{
  "success": true,
  "message": "FAQ가 등록되었습니다.",
  "data": {
    "faqId": 7,
    "question": "VPN 비밀번호는 어디서 바꾸나요?",
    "categoryName": "인프라"
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| question | 빈 값 불가 | 질문을 입력해주세요. |
| answer | 빈 값 불가 | 답변을 입력해주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 요청값 오류 | 요청값 확인 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근 권한 없음 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

### [DOC-API-015] 카테고리/태그 관리

| 항목 | 내용 |
| --- | --- |
| API ID | DOC-API-015 |
| 기능 ID | DOC-FR-015 |
| Method | POST |
| URL | /api/admin/categories |
| 권한 | ADMIN |
| 설명 | 관리자가 카테고리를 등록한다. (태그는 /api/admin/tags, 수정/삭제는 PUT/DELETE 동일 리소스) |
| 관련 테이블 | categories, tags |

#### Request Header

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSON 요청 |

#### Request Body

```json
{
  "categoryName": "인프라",
  "description": "서버·클라우드·배포 관련 문서",
  "isPublic": true
}
```

#### Response Body

```json
{
  "success": true,
  "message": "카테고리가 등록되었습니다.",
  "data": {
    "categoryId": 2,
    "categoryName": "인프라"
  }
}
```

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| 없음 |  |  |  |  |

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| categoryName | 빈 값 불가 | 카테고리명을 입력해주세요. |
| categoryName | 중복 불가 | 이미 존재하는 카테고리명입니다. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 요청값 오류 | 요청값 확인 메시지를 반환한다. |
| 401 | 로그인 상태가 아님 | 로그인 필요 메시지를 반환한다. |
| 403 | 관리자 권한 없음 | 접근 권한 없음 메시지를 반환한다. |
| 409 | 카테고리명 중복 | 이미 존재하는 카테고리명 메시지를 반환한다. |
| 500 | 서버 오류 | 공통 서버 오류 메시지를 반환한다. |

---

# 6. QNA API

## 6.1 API 목록 예시

| API ID | 기능 ID | Method | URL | 권한 | 설명 |
| --- | --- | --- | --- | --- | --- |
| AUTH-API-001 | AUTH-FR-001 | POST | /api/auth/login | ALL | 로그인 |
| AUTH-API-002 | AUTH-FR-002 | POST | /api/auth/logout | USER | 로그아웃 |
| AUTH-API-003 | AUTH-FR-003 | GET | /api/users/me | USER | 내 정보 조회 |
| AUTH-API-004 | AUTH-FR-004 | GET | /api/admin/users | ADMIN | 사용자 목록 조회 |
| AUTH-API-005 | AUTH-FR-005 | PUT | /api/admin/users/{userId} | ADMIN | 사용자 정보 수정 |
| AUTH-API-006 | AUTH-FR-006 | PATCH | /api/admin/users/{userId}/role | ADMIN | 사용자 권한 변경 |
| AUTH-API-007 | AUTH-FR-007 | GET | /api/departments | USER | 부서 목록 조회 |

## 6.2 API 상세 명세

모든 API의 Request Header는 아래와 동일하다.

| Key | Value | 필수 | 설명 |
| --- | --- | --- | --- |
| Authorization | Bearer {token} | N | JWT 사용 시 작성 |
| Content-Type | application/json | Y | JSO |

---

### [QNA-API-001] 질문 등록

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-001 |
| 기능 ID | QNA-FR-001 |
| Method | POST |
| URL | /api/questions |
| 권한 | USER |
| 설명 | 카테고리, 제목, 내용을 입력받아 질문을 등록한다. 등록 시 상태는 RECEIVED로 설정된다. |
| 관련 테이블 | questions |

#### Request Body

```json
{
  "categoryId": 1,
  "title": "VPN 접속이 안 됩니다.",
  "content": "재택근무 중 VPN 연결이 계속 끊깁니다."
}
```

#### Response Body

```json
{
  "success": true,
  "message": "질문이 등록되었습니다.",
  "data": {
    "questionId": 10,
    "status": "RECEIVED"
  }
}
```

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| categoryId | 필수, 활성 카테고리 | 카테고리를 선택해 주세요. |
| title | 필수, 최대 200자 | 제목은 200자 이내로 입력해 주세요. |
| content | 필수 | 내용을 입력해 주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 필수값 누락, 길이 초과, 비활성 카테고리 | 오류 필드 안내 후 재입력 유도 |
| 401 | 미로그인 | 로그인 화면으로 이동 |
| 404 | 존재하지 않는 카테고리 | 카테고리 목록 갱신 후 재선택 유도 |

---

### [QNA-API-002] 내 질문 목록 조회

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-002 |
| 기능 ID | QNA-FR-002 |
| Method | GET |
| URL | /api/questions/me |
| 권한 | USER |
| 설명 | 본인이 등록한 질문 목록을 최신순으로 조회한다. 상태, 카테고리 필터와 페이징을 지원한다. |
| 관련 테이블 | questions, question_categories |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| status | string | N | 질문 상태 필터 | ANSWERED |
| categoryId | number | N | 카테고리 필터 | 1 |
| page | number | N | 페이지 번호(기본 0) | 0 |
| size | number | N | 페이지 크기(기본 10) | 10 |

#### Response Body

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {
    "content": [
      {
        "questionId": 10,
        "title": "VPN 접속이 안 됩니다.",
        "categoryName": "IT/시스템",
        "status": "RECEIVED",
        "createdAt": "2026-07-03T10:00:00"
      }
    ],
    "page": 0,
    "totalPages": 1,
    "totalElements": 1
  }
}
```

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 미로그인 | 로그인 화면으로 이동 |

---

### [QNA-API-003] 질문 상세 조회

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-003 |
| 기능 ID | QNA-FR-003 |
| Method | GET |
| URL | /api/questions/{questionId} |
| 권한 | USER (본인) |
| 설명 | 본인 질문의 상세 내용과 상태, 답변을 조회한다. |
| 관련 테이블 | questions, answers |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| questionId | number | Y | 질문 ID | 10 |

#### Response Body

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {
    "questionId": 10,
    "categoryName": "IT/시스템",
    "title": "VPN 접속이 안 됩니다.",
    "content": "재택근무 중 VPN 연결이 계속 끊깁니다.",
    "status": "ANSWERED",
    "createdAt": "2026-07-03T10:00:00",
    "updatedAt": null,
    "answer": {
      "answerId": 5,
      "content": "VPN 클라이언트를 최신 버전으로 업데이트해 주세요.",
      "createdAt": "2026-07-03T14:00:00",
      "updatedAt": null
    }
  }
}
```

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 403 | 본인 질문이 아님 | 접근 차단 안내 |
| 404 | 질문 없음(삭제 포함) | 목록으로 이동 |

---

### [QNA-API-004] 질문 수정

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-004 |
| 기능 ID | QNA-FR-004 |
| Method | PUT |
| URL | /api/questions/{questionId} |
| 권한 | USER (본인) |
| 설명 | RECEIVED 상태의 본인 질문을 수정한다. |
| 관련 테이블 | questions |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| questionId | number | Y | 질문 ID | 10 |

#### Request Body

```json
{
  "categoryId": 1,
  "title": "VPN 접속 오류 문의",
  "content": "재택근무 중 VPN 연결이 10분마다 끊깁니다."
}
```

#### Response Body

```json
{
  "success": true,
  "message": "질문이 수정되었습니다.",
  "data": {
    "questionId": 10
  }
}
```

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| categoryId | 필수, 활성 카테고리 | 카테고리를 선택해 주세요. |
| title | 필수, 최대 200자 | 제목은 200자 이내로 입력해 주세요. |
| content | 필수 | 내용을 입력해 주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 필수값 누락, 길이 초과 | 오류 필드 안내 후 재입력 유도 |
| 403 | 본인 질문 아님, RECEIVED 상태 아님 | 수정 불가 안내 |
| 404 | 질문 없음 | 목록으로 이동 |

---

### [QNA-API-005] 질문 삭제

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-005 |
| 기능 ID | QNA-FR-005 |
| Method | DELETE |
| URL | /api/questions/{questionId} |
| 권한 | USER (본인) |
| 설명 | RECEIVED 상태의 본인 질문을 논리 삭제한다(is_deleted = true). |
| 관련 테이블 | questions |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| questionId | number | Y | 질문 ID | 10 |

#### Response Body

```json
{
  "success": true,
  "message": "질문이 삭제되었습니다.",
  "data": null
}
```

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 403 | 본인 질문 아님, RECEIVED 상태 아님 | 삭제 불가 안내 |
| 404 | 질문 없음 | 목록으로 이동 |

---

### [QNA-API-006] 질문 카테고리 목록 조회 (공용)

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-006 |
| 기능 ID | QNA-FR-001, QNA-FR-016 |
| Method | GET |
| URL | /api/question-categories |
| 권한 | USER |
| 설명 | 질문 카테고리 목록을 노출 순서대로 조회한다. 기본은 활성(ACTIVE) 카테고리만 반환하며, 관리자가 includeInactive=true로 요청하면 비활성 카테고리도 포함한다. 질문 등록 화면과 관리자 카테고리 관리 화면에서 공용으로 사용한다. |
| 관련 테이블 | question_categories |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| includeInactive | boolean | N | 비활성 포함 여부 (ADMIN만 허용, 기본 false) | true |

#### Response Body

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {
    "categories": [
      {
        "categoryId": 1,
        "name": "IT/시스템",
        "description": "사내 시스템, 장비 관련 문의",
        "sortOrder": 1,
        "isActive": true,
        "createdAt": "2026-07-01T09:00:00"
      }
    ]
  }
}
```

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 미로그인 | 로그인 화면으로 이동 |
| 403 | 일반 사용자가 includeInactive=true 요청 | 활성 목록만 반환 또는 접근 차단 안내 |

---

### [QNA-API-007] 알림 목록 조회

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-007 |
| 기능 ID | QNA-FR-007 |
| Method | GET |
| URL | /api/notifications |
| 권한 | USER |
| 설명 | 본인 알림 목록과 미확인 알림 개수를 조회한다. |
| 관련 테이블 | notifications |

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| page | number | N | 페이지 번호(기본 0) | 0 |
| size | number | N | 페이지 크기(기본 10) | 10 |

#### Response Body

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {
    "unreadCount": 2,
    "content": [
      {
        "notificationId": 3,
        "questionId": 10,
        "type": "ANSWER_REGISTERED",
        "message": "질문에 답변이 등록되었습니다.",
        "isRead": false,
        "createdAt": "2026-07-03T14:00:00"
      }
    ]
  }
}
```

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 401 | 미로그인 | 로그인 화면으로 이동 |

---

### [QNA-API-008] 알림 읽음 처리

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-008 |
| 기능 ID | QNA-FR-008 |
| Method | PATCH |
| URL | /api/notifications/{notificationId}/read |
| 권한 | USER (본인) |
| 설명 | 알림을 읽음 상태로 변경한다. |
| 관련 테이블 | notifications |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| notificationId | number | Y | 알림 ID | 3 |

#### Response Body

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {
    "notificationId": 3,
    "isRead": true
  }
}
```

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 403 | 본인 알림이 아님 | 접근 차단 안내 |
| 404 | 알림 없음 | 알림 목록 갱신 |

---

### QNA-API-009 질문 목록 관리

#### 기본 정보

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-009 |
| 기능 ID | QNA-FR-009 |
| Method | GET |
| URL | `/api/admin/questions` |
| 권한 | ADMIN |
| 설명 | 전체 질문을 키워드, 상태, 카테고리, 기간 조건으로 검색한다. |
| 관련 테이블 | questions, users, question_categories |

---

#### Query Parameter

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| keyword | string | N | 제목/내용 검색어 | VPN |
| status | string | N | 질문 상태 필터 | RECEIVED |
| categoryId | number | N | 카테고리 필터 | 1 |
| startDate | date | N | 등록일 시작 | 2026-07-01 |
| endDate | date | N | 등록일 종료 | 2026-07-31 |
| page | number | N | 페이지 번호 (기본 0) | 0 |
| size | number | N | 페이지 크기 (기본 20) | 20 |

---

#### Response Body

```
{
  "success":true,
  "message":"요청이 정상 처리되었습니다.",
  "data": {
    "content": [
      {
        "questionId":10,
        "title":"VPN 접속이 안 됩니다.",
        "writerName":"김직원",
        "departmentName":"영업팀",
        "categoryName":"IT/시스템",
        "status":"RECEIVED",
        "createdAt":"2026-07-03T10:00:00"
      }
    ],
    "page":0,
    "totalPages":1,
    "totalElements":1
  }
}
```

---

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 403 | 관리자 권한 없음 | 접근 차단 안내 |

---

### QNA-API-010 질문 상세 확인 (상태 이력 포함)

#### 기본 정보

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-010 |
| 기능 ID | QNA-FR-010, QNA-FR-014 |
| Method | GET |
| URL | `/api/admin/questions/{questionId}` |
| 권한 | ADMIN |
| 설명 | 질문 상세 내용, 질문자 정보, 답변, FAQ 전환 여부, 상태 변경 이력을 조회한다. 이력은 시간순으로 포함된다. |
| 관련 테이블 | questions, answers, users, question_status_history |

---

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| questionId | number | Y | 질문 ID | 10 |

---

#### Response Body

```
{
  "success":true,
  "message":"요청이 정상 처리되었습니다.",
  "data": {
    "questionId":10,
    "title":"VPN 접속이 안 됩니다.",
    "content":"재택근무 중 VPN 연결이 계속 끊깁니다.",
    "status":"ANSWERED",
    "createdAt":"2026-07-03T10:00:00",
    "writer": {
      "userId":2,
      "name":"김직원",
      "departmentName":"영업팀"
    },
    "category": {
      "categoryId":1,
      "name":"IT/시스템"
    },
    "answer": {
      "answerId":5,
      "content":"VPN 클라이언트를 최신 버전으로 업데이트해 주세요.",
      "adminName":"박관리",
      "createdAt":"2026-07-03T14:00:00",
      "updatedAt":null
    },
    "convertedFaqId":null,
    "histories": [
      {
        "historyId":1,
        "previousStatus":"RECEIVED",
        "newStatus":"ANSWERED",
        "changedByName":"박관리",
        "memo":null,
        "createdAt":"2026-07-03T14:00:00"
      }
    ]
  }
}
```

---

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 403 | 관리자 권한 없음 | 접근 차단 안내 |
| 404 | 질문 없음 | 목록으로 이동 |

---

### QNA-API-011 답변 등록/수정

#### 기본 정보

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-011 |
| 기능 ID | QNA-FR-011, QNA-FR-012 |
| Method | PUT |
| URL | `/api/admin/questions/{questionId}/answer` |
| 권한 | ADMIN |
| 설명 | 질문의 답변을 등록 또는 수정한다(질문당 답변 1건). 답변이 없으면 신규 등록으로 처리되어 질문 상태가 ANSWERED로 변경되고 상태 이력 기록, 질문자 알림 생성이 함께 처리된다. 답변이 이미 있으면 내용만 수정하고 수정일시를 기록한다. |
| 관련 테이블 | answers, questions, question_status_history, notifications |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| questionId | number | Y | 질문 ID | 10 |

#### Request Body

```
{
  "content":"VPN 클라이언트를 최신 버전으로 업데이트해 주세요."
}
```

#### Response Body

```
{
  "success":true,
  "message":"답변이 등록되었습니다.",
  "data": {
    "answerId":5,
    "questionStatus":"ANSWERED",
    "isNewAnswer":true
  }
}
```

> **수정인 경우**
> 
> - `"message": "답변이 수정되었습니다."`
> - `"isNewAnswer": false`
> - `questionStatus`는 현재 상태 유지

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| content | 필수 | 답변 내용을 입력해 주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 내용 미입력 | 오류 안내 후 재입력 유도 |
| 403 | 관리자 권한 없음 | 접근 차단 안내 |
| 404 | 질문 없음 | 목록으로 이동 |

---

### QNA-API-012 질문 상태 변경

#### 기본 정보

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-012 |
| 기능 ID | QNA-FR-013 |
| Method | PATCH |
| URL | `/api/admin/questions/{questionId}/status` |
| 권한 | ADMIN |
| 설명 | 질문 상태를 변경한다. 변경 이력 기록과 질문자 알림 생성이 함께 처리된다. 답변이 등록되지 않은 질문은 ANSWERED로 변경할 수 없다. |
| 관련 테이블 | questions, question_status_history, notifications |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| questionId | number | Y | 질문 ID | 10 |

#### Request Body

```
{
  "status":"ON_HOLD",
  "memo":"담당 부서 확인 필요"
}
```

#### Response Body

```
{
  "success":true,
  "message":"상태가 변경되었습니다.",
  "data": {
    "questionId":10,
    "status":"ON_HOLD"
  }
}
```

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| status | 필수, RECEIVED / IN_PROGRESS / ANSWERED / ON_HOLD 중 하나 | 잘못된 상태값입니다. |
| memo | 선택, 최대 500자 | 사유는 500자 이내로 입력해 주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 정의되지 않은 상태값 | 오류 안내 |
| 403 | 관리자 권한 없음 | 접근 차단 안내 |
| 404 | 질문 없음 | 목록으로 이동 |
| 409 | 답변 미등록 질문을 ANSWERED로 변경 시도, 현재와 동일한 상태로 변경 | 변경 불가 안내 |

---

### QNA-API-013 FAQ 전환

#### 기본 정보

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-013 |
| 기능 ID | QNA-FR-015 |
| Method | POST |
| URL | `/api/admin/questions/{questionId}/faq` |
| 권한 | ADMIN |
| 설명 | ANSWERED 상태의 질문을 FAQ로 전환한다. B 모듈의 `faqs`에 FAQ가 생성되고 질문에 `converted_faq_id`가 저장된다. |
| 관련 테이블 | questions, faqs(B 모듈) |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| questionId | number | Y | 질문 ID | 10 |

#### Request Body

```
{
  "faqCategoryId":2,
  "question":"VPN 접속이 안 될 때는 어떻게 하나요?",
  "answer":"VPN 클라이언트를 최신 버전으로 업데이트한 후 재접속해 주세요."
}
```

#### Response Body

```
{
  "success":true,
  "message":"FAQ로 전환되었습니다.",
  "data": {
    "faqId":7,
    "questionId":10
  }
}
```

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| faqCategoryId | 필수 | FAQ 카테고리를 선택해 주세요. |
| question | 필수 | FAQ 질문을 입력해 주세요. |
| answer | 필수 | FAQ 답변을 입력해 주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 필수값 누락 | 오류 안내 후 재입력 유도 |
| 403 | 관리자 권한 없음 | 접근 차단 안내 |
| 404 | 질문 없음 | 목록으로 이동 |
| 409 | ANSWERED 상태 아님, 이미 전환됨 | 전환 불가 안내 |

---

### QNA-API-014 질문 카테고리 등록

#### 기본 정보

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-014 |
| 기능 ID | QNA-FR-016 |
| Method | POST |
| URL | `/api/admin/question-categories` |
| 권한 | ADMIN |
| 설명 | 질문 카테고리를 등록한다. |
| 관련 테이블 | question_categories |

#### Request Body

```
{
  "name":"인사/복지",
  "description":"인사 제도, 복지 관련 문의",
  "sortOrder":2
}
```

#### Response Body

```
{
  "success":true,
  "message":"카테고리가 등록되었습니다.",
  "data": {
    "categoryId":2
  }
}
```

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| name | 필수, 최대 50자, 중복 불가 | 카테고리명을 확인해 주세요. |
| description | 선택, 최대 200자 | 설명은 200자 이내로 입력해 주세요. |
| sortOrder | 선택, 기본 0 | - |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 필수값 누락, 길이 초과 | 오류 안내 후 재입력 유도 |
| 403 | 관리자 권한 없음 | 접근 차단 안내 |
| 409 | 카테고리명 중복 | 다른 이름 입력 유도 |

---

### QNA-API-015 질문 카테고리 수정

#### 기본 정보

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-015 |
| 기능 ID | QNA-FR-016 |
| Method | PUT |
| URL | `/api/admin/question-categories/{categoryId}` |
| 권한 | ADMIN |
| 설명 | 질문 카테고리의 이름, 설명, 노출 순서, 사용 여부를 수정한다. |
| 관련 테이블 | question_categories |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| categoryId | number | Y | 카테고리 ID | 2 |

#### Request Body

```
{
  "name":"인사/복지",
  "description":"인사 제도, 복지, 근태 관련 문의",
  "sortOrder":2,
  "isActive":true
}
```

#### Response Body

```
{
  "success":true,
  "message":"카테고리가 수정되었습니다.",
  "data": {
    "categoryId":2
  }
}
```

#### Validation

| 필드 | 조건 | 메시지 |
| --- | --- | --- |
| name | 필수, 최대 50자, 중복 불가 | 카테고리명을 확인해 주세요. |
| description | 선택, 최대 200자 | 설명은 200자 이내로 입력해 주세요. |

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 400 | 필수값 누락, 길이 초과 | 오류 안내 후 재입력 유도 |
| 403 | 관리자 권한 없음 | 접근 차단 안내 |
| 404 | 카테고리 없음 | 목록 갱신 |
| 409 | 카테고리명 중복 | 다른 이름 입력 유도 |

---

### QNA-API-016 질문 카테고리 삭제

#### 기본 정보

| 항목 | 내용 |
| --- | --- |
| API ID | QNA-API-016 |
| 기능 ID | QNA-FR-016 |
| Method | DELETE |
| URL | `/api/admin/question-categories/{categoryId}` |
| 권한 | ADMIN |
| 설명 | 질문 카테고리를 삭제한다. 질문에서 사용 중인 카테고리는 물리 삭제하지 않고 `isActive = false`로 비활성화 처리한다. |
| 관련 테이블 | question_categories |

#### Path Variable

| 이름 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| categoryId | number | Y | 카테고리 ID | 2 |

#### Response Body

```
{
  "success":true,
  "message":"카테고리가 삭제되었습니다.",
  "data":null
}
```

#### 예외 처리

| 코드 | 원인 | 처리 방법 |
| --- | --- | --- |
| 403 | 관리자 권한 없음 | 접근 차단 안내 |
| 404 | 카테고리 없음 | 목록 갱신 |