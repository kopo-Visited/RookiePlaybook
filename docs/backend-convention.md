# 백엔드 개발 가이드 (Spring Boot)

## 패키지 구조

도메인이 확정되어 도메인 기준 구조로 작성한다. IntelliJ의 Move 리팩터링(`F6`)으로 패키지 이동 시 import가 자동으로 변경된다.

```
src/
├── main/
│   ├── java/com/visited/www/
│   │   ├── domain/
│   │   │   ├── auth/                       # 회원/권한
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Department.java
│   │   │   │   │   ├── User.java
│   │   │   │   │   └── Role.java
│   │   │   │   ├── enums/
│   │   │   │   └── dto/
│   │   │   │       ├── request/
│   │   │   │       └── response/
│   │   │   ├── doc/                        # 지식 문서/FAQ
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── mapper/
│   │   │   │   ├── entity/
│   │   │   │   ├── enums/
│   │   │   │   └── dto/
│   │   │   │       ├── request/
│   │   │   │       └── response/
│   │   │   ├── qna/                        # 질문/답변
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   ├── enums/
│   │   │   │   └── dto/
│   │   │   │       ├── request/
│   │   │   │       └── response/
│   │   │   └── edu/                        # 온보딩 교육
│   │   │       ├── controller/
│   │   │       │   ├── EducationController.java
│   │   │       │   ├── ProgressController.java
│   │   │       │   └── AdminEducationController.java
│   │   │       ├── service/
│   │   │       │   ├── EducationService.java
│   │   │       │   ├── EducationServiceImpl.java
│   │   │       │   ├── ProgressService.java
│   │   │       │   └── ProgressServiceImpl.java
│   │   │       ├── repository/             # JPA Repository
│   │   │       │   ├── EducationRepository.java
│   │   │       │   ├── EducationStageRepository.java
│   │   │       │   ├── EducationMaterialRepository.java
│   │   │       │   ├── EducationProgressRepository.java
│   │   │       │   ├── StageCompletionRepository.java
│   │   │       │   └── VideoProgressRepository.java
│   │   │       ├── mapper/                 # MyBatis (복잡한 통계/조회 쿼리)
│   │   │       │   └── EducationMapper.java
│   │   │       ├── entity/
│   │   │       │   ├── Education.java
│   │   │       │   ├── EducationStage.java
│   │   │       │   ├── EducationMaterial.java
│   │   │       │   ├── EducationProgress.java
│   │   │       │   ├── StageCompletion.java
│   │   │       │   └── VideoProgress.java
│   │   │       ├── enums/
│   │   │       │   └── ProgressStatus.java  # NOT_STARTED / IN_PROGRESS / COMPLETED
│   │   │       └── dto/
│   │   │           ├── request/
│   │   │           │   ├── EducationCreateRequestDto.java
│   │   │           │   ├── EducationUpdateRequestDto.java
│   │   │           │   ├── StageCreateRequestDto.java
│   │   │           │   ├── StageUpdateRequestDto.java
│   │   │           │   ├── VideoProgressRequestDto.java
│   │   │           │   └── StageCompleteRequestDto.java
│   │   │           └── response/
│   │   │               ├── EducationListResponseDto.java
│   │   │               ├── EducationDetailResponseDto.java
│   │   │               ├── MaterialResponseDto.java
│   │   │               ├── MyProgressResponseDto.java
│   │   │               ├── AdminProgressResponseDto.java
│   │   │               └── IncompleteResponseDto.java
│   │   └── global/
│   │       ├── config/                     # Spring 설정 (Security, CORS, Swagger 등)
│   │       ├── entity/                     # 공통 엔티티 (BaseEntity)
│   │       │   └── BaseEntity.java
│   │       ├── exception/
│   │       │   ├── GlobalExceptionHandler.java
│   │       │   └── ErrorCode.java
│   │       ├── response/
│   │       │   └── ApiResponse.java
│   │       └── util/
│   └── resources/
│       ├── mapper/                         # MyBatis XML 쿼리 파일
│       │   └── EducationMapper.xml
│       ├── application.yml
│       ├── application-local.yml
│       ├── application-dev.yml
│       └── application-prod.yml
└── test/
    └── java/com/visited/www/
        └── domain/
            └── edu/
                ├── service/                # 단위 테스트
                │   ├── EducationServiceTest.java
                │   └── ProgressServiceTest.java
                └── controller/             # 통합 테스트
                    ├── EducationControllerTest.java
                    └── AdminEducationControllerTest.java
```

## 네이밍 규칙

### 클래스 · 인터페이스 네이밍

| 종류 | 형식 | 예시 |
|------|------|------|
| Controller (클래스) | `{도메인}Controller` | `DocumentController` |
| Service (인터페이스) | `{도메인}Service` | `DocumentService` |
| ServiceImpl (클래스) | `{도메인}ServiceImpl` | `DocumentServiceImpl` |
| Repository (인터페이스) | `{도메인}Repository` | `DocumentRepository` |
| Entity (클래스) | `{도메인}` | `Document` |
| DTO 요청 (클래스) | `{도메인}{동작}RequestDto` | `DocumentCreateRequestDto` |
| DTO 응답 (클래스) | `{도메인}{동작}ResponseDto` | `DocumentSearchResponseDto` |
| Config (클래스) | `{대상}Config` | `SecurityConfig` |
| Exception (클래스) | `{상황}Exception` | `DocumentNotFoundException` |

> **Service vs ServiceImpl 구분**
> - `DocumentService` → **인터페이스**. "이 서비스가 어떤 메서드를 제공하는지" 계약만 정의
> - `DocumentServiceImpl` → **구현체**. 실제 비즈니스 로직이 들어가는 클래스
>
> Controller는 `DocumentService` 인터페이스에만 의존하고, 실제 구현체(`DocumentServiceImpl`)는 몰라도 됨. 나중에 구현 방식이 바뀌어도 Controller 코드를 건드릴 필요가 없어지는 구조.

### 메서드명

**Controller — HTTP 메서드 기준:**

| HTTP | prefix | 예시 |
|------|--------|------|
| GET (단건) | `get` | `getDocument()` |
| GET (목록) | `get` + 복수형 | `getDocuments()` |
| POST | `create` | `createDocument()` |
| PUT / PATCH | `update` | `updateDocument()` |
| DELETE | `delete` | `deleteDocument()` |

**Service — 비즈니스 행위 기준:**

| 상황 | prefix | 예시 |
|------|--------|------|
| 단건 조회 | `get` | `getDocument()` |
| 목록/검색 조회 | `get`, `search`, `find` | `getDocuments()`, `searchDocuments()` |
| 등록 | `create`, `register`, `save` | `createDocument()` |
| 수정 | `update` | `updateDocument()` |
| 삭제 | `delete`, `remove` | `deleteDocument()` |
| 특정 비즈니스 행위 | 행위 그대로 | `completeOnboarding()`, `approveDocument()` |

**Repository — JPA 관례 기준:**
- 관례 전체 목록: [Spring Data JPA 공식 문서 - Query Methods](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)

### 변수명

- camelCase 사용
- 축약어 금지: `docNm` ❌ → `documentName` ✅
- boolean은 `is`/`has` prefix: `isCompleted`, `hasPermission`
- 상수는 UPPER_SNAKE_CASE: `MAX_RETRY_COUNT`

## API 설계 규칙

### URL 규칙

- 소문자 + 하이픈(`-`) 사용, 동사 금지
- 복수형 명사 사용
- 리소스 계층은 `/` 로 구분
- 관리자 API는 `/api/admin/` prefix로 구분

아래는 규칙 적용 예시이며, 실제 API는 기능정의서 확정 후 별도 작성한다:

```
GET    /api/documents                   # 목록 조회
GET    /api/documents/{id}              # 단건 조회
GET    /api/documents/search?q=키워드   # 검색 (쿼리 파라미터)
POST   /api/documents                   # 등록
PUT    /api/documents/{id}              # 수정
DELETE /api/documents/{id}              # 삭제
POST   /api/admin/documents             # 관리자 등록
GET    /api/admin/statistics            # 관리자 통계 조회
```

### 공통 응답 형식 / HTTP 상태코드

→ [common-convention.md](./common-convention.md) 참조. 모든 API 응답은 `ApiResponse<T>` 로 감싼다.

### 페이지네이션

**다수의 목록 조회는 페이지네이션을 구현한다.**

**왜 필요한가:**
- 데이터가 많을수록 전체를 한 번에 조회하면 DB 부하와 응답 시간이 증가한다
- 프론트엔드가 한 번에 수백 개의 데이터를 렌더링하면 성능이 떨어진다
- 페이지네이션으로 필요한 만큼만 조회해서 성능과 UX를 모두 개선할 수 있다

**Spring Data JPA `Pageable` 사용:**

```
GET /api/documents?page=0&size=10&sort=createdAt,desc
```
- `page`: 페이지 번호 (0부터 시작)
- `size`: 한 페이지에 가져올 데이터 수
- `sort`: 정렬 기준 필드, 방향 (asc/desc)

```java
// Controller
@GetMapping
public ResponseEntity<ApiResponse<Page<DocumentResponseDto>>> getDocuments(
        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
    Page<DocumentResponseDto> data = documentService.getDocuments(pageable);
    return ResponseEntity.ok(ApiResponse.success(data));
}

// Service
public Page<DocumentResponseDto> getDocuments(Pageable pageable) {
    return documentRepository.findAll(pageable)
            .map(doc -> new DocumentResponseDto(
                    doc.getId(),
                    doc.getTitle(),
                    doc.getCreatedAt()
            ));
}
```

**응답 형식 예시:**
```json
{
  "success": true,
  "data": {
    "content": [
      { "id": 1, "title": "온보딩 가이드", "createdAt": "2024-03-15T09:30:00Z" },
      { "id": 2, "title": "업무 매뉴얼", "createdAt": "2024-03-14T09:30:00Z" }
    ],
    "totalElements": 42,
    "totalPages": 5,
    "size": 10,
    "number": 0,
    "first": true,
    "last": false
  },
  "message": null
}
```

- `totalElements`: 전체 데이터 수
- `totalPages`: 전체 페이지 수
- `number`: 현재 페이지 번호 (0부터)
- `first` / `last`: 첫/마지막 페이지 여부

### ApiResponse\<T\> 구현 예시

아래는 구현 예시이며, 팀 상황에 맞게 수정해도 된다. `global/response/ApiResponse.java` 에 작성한다:

```java
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private String errorCode;

    // 성공 (데이터 있음)
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.message = "요청이 정상 처리되었습니다.";
        response.data = data;
        return response;
    }

    // 성공 (데이터 없음 — 생성/삭제 등)
    public static <T> ApiResponse<T> success() {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.message = "요청이 정상 처리되었습니다.";
        return response;
    }

    // 실패
    public static <T> ApiResponse<T> fail(String message, String errorCode) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = message;
        response.errorCode = errorCode;
        return response;
    }
}
```

> **`@NoArgsConstructor(access = AccessLevel.PRIVATE)` 이란?**
> Lombok이 기본 생성자(`new ApiResponse<>()`)를 `private`으로 만들어주는 어노테이션.
> 즉 클래스 외부에서 `new ApiResponse<>()` 로 직접 객체를 만들 수 없게 막는 거야.
> 대신 `ApiResponse.success()`, `ApiResponse.fail()` 같은 팩토리 메서드로만 생성하도록 강제해서,
> 팀원이 실수로 필드 일부를 빠뜨린 채 응답 객체를 만드는 걸 방지한다.

**Controller 사용 예시 (참고용):**

```java
// 단건 조회
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<DocumentResponseDto>> getDocument(@PathVariable Long id) {
    DocumentResponseDto data = documentService.getDocument(id);
    return ResponseEntity.ok(ApiResponse.success(data));
}

// 목록 조회
@GetMapping
public ResponseEntity<ApiResponse<List<DocumentResponseDto>>> getDocuments() {
    List<DocumentResponseDto> data = documentService.getDocuments();
    return ResponseEntity.ok(ApiResponse.success(data));
}

// 생성 (반환 데이터 없음)
@PostMapping
public ResponseEntity<ApiResponse<Void>> createDocument(@RequestBody DocumentCreateRequestDto request) {
    documentService.createDocument(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success());
}
```

## Swagger (SpringDoc OpenAPI) 설정

### build.gradle 의존성 추가

```groovy
dependencies {
    // SpringDoc OpenAPI (Spring Boot 3.x 기준)
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
}
```

> Spring Boot 2.x라면 `springdoc-openapi-ui:1.7.0` 사용 (패키지명 다름)

### SwaggerConfig 설정 파일

`global/config/SwaggerConfig.java` 에 아래 클래스를 추가한다:

```java
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("신입의 정석 API")
                        .description("사내 지식 공유 및 온보딩 교육 플랫폼 API 명세서")
                        .version("v1.0.0"));
    }
}
```

### 확인 방법

로컬 서버 실행 후 브라우저에서 접속:
```
http://localhost:8080/swagger-ui/index.html
```

### 어노테이션 작성 규칙

API를 추가하거나 수정한 사람이 직접 어노테이션을 작성한다.

```java
@RestController
@RequestMapping("/api/documents")
@Tag(name = "Document", description = "지식 문서 API")
public class DocumentController {

    @Operation(summary = "문서 검색", description = "키워드로 지식 문서를 검색한다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @GetMapping("/search")
    public ApiResponse<List<DocumentResponseDto>> searchDocuments(
            @Parameter(description = "검색 키워드") @RequestParam String q) {
        // ...
    }
}
```

- `@Tag`: 컨트롤러 단위 그룹핑 (Swagger UI에서 묶어서 보임)
- `@Operation`: API 하나의 요약/설명
- `@ApiResponse`: 응답 코드별 설명
- `@Parameter`: 파라미터 설명

### application.yml 설정 (필요 시)

배포 환경에서 Swagger를 비활성화하려면:

```yaml
# application-prod.yml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

## 예외 처리 규칙

- 비즈니스 예외는 커스텀 Exception 클래스로 정의
- `@RestControllerAdvice` + `GlobalExceptionHandler` 에서 일괄 처리
- Controller에서 try-catch 금지 — 예외는 Handler까지 올려 보낸다
- **빈 catch 블록 금지** — 예외를 잡고 아무것도 안 하면 오류가 조용히 묻혀 디버깅이 불가능해진다

```java
// ❌ 금지 — 빈 catch 블록
try {
    documentRepository.save(document);
} catch (Exception e) {
    // 아무것도 안 함
}

// ✅ 최소한 로그라도 남긴다
try {
    documentRepository.save(document);
} catch (Exception e) {
    log.error("문서 저장 실패: {}", e.getMessage(), e);
    throw e;
}
```

아래는 구현 예시이며, 팀 상황에 맞게 수정해도 된다.

**커스텀 예외 (예시):**
```java
// global/exception/DocumentNotFoundException.java
public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException(Long id) {
        super("문서를 찾을 수 없습니다. id: " + id);
    }
}
```

**GlobalExceptionHandler (예시):**
```java
// global/exception/GlobalExceptionHandler.java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 커스텀 예외 처리 (비즈니스 예외)
    @ExceptionHandler(DocumentNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleDocumentNotFoundException(
            DocumentNotFoundException e) {
        log.warn("DocumentNotFoundException: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.fail(e.getMessage(), "NOT_FOUND"));
    }

    // 유효성 검사 실패 (@Valid 위반)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("요청값을 확인해주세요.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(message, "INVALID_REQUEST"));
    }

    // 그 외 모든 예외 (예상치 못한 서버 오류)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("일시적인 오류가 발생했습니다.", "SERVER_ERROR"));
    }
}
```

> `ErrorResponse` 별도 클래스 없이 `ApiResponse.fail(message, errorCode)` 로 통일한다.
> 실패 응답도 `ApiResponse` 형식으로 오므로 프론트엔드가 성공/실패 구분 없이 동일한 구조로 파싱할 수 있다.

## 기타 규칙

- Lombok 사용 허용: `@Getter`, `@RequiredArgsConstructor`, `@Builder`
  - `@Data` 금지 (불필요한 setter 노출 방지)
- **Entity에 Lombok `@Setter` 금지 — 비즈니스 메서드 사용**
  - 객체지향의 캡슐화 원칙: "객체 내부 상태는 객체 스스로 관리한다." `@Setter`를 붙이면 외부(Service 등) 어디서나 Entity 내부를 직접 조작할 수 있게 돼서 이 원칙이 깨진다
  - setter 방식은 하나의 비즈니스 행위(예: 수료 처리)에 필요한 필드 변경이 Service 코드에 흩어지고, 팀원이 관련 필드를 하나 빠뜨리면 버그가 생긴다
  - 비즈니스 메서드를 쓰면 관련 필드 변경이 Entity 안에 모여 있어서, 로직이 바뀌어도 Entity 한 군데만 수정하면 된다

  ```java
  // ❌ setter 방식 — 수료 처리 로직이 Service에 흩어짐
  document.setStatus("COMPLETED");
  document.setCompletedAt(LocalDateTime.now());
  document.setCompletedBy(userId);

  // ✅ 비즈니스 메서드 방식 — Entity가 스스로 상태 관리
  // Service에서는 한 줄만 호출
  document.complete(userId);

  // Entity 안에서 처리
  public void complete(Long userId) {
      this.status = "COMPLETED";
      this.completedAt = LocalDateTime.now();
      this.completedBy = userId;
  }
  ```
- DTO ↔ Entity 변환은 Service 레이어에서 처리

## Enum 활용 규칙

**고정된 상수값은 `String` 대신 `Enum`으로 정의한다.** 오타 방지, 코드 자동완성, 허용된 값 범위 제한이 장점이다.

### 에러 코드 Enum

```java
// global/exception/ErrorCode.java
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_REQUEST(400, "요청값을 확인해주세요."),
    UNAUTHORIZED(401, "로그인이 필요합니다."),
    FORBIDDEN(403, "접근 권한이 없습니다."),
    NOT_FOUND(404, "조회된 데이터가 없습니다."),
    SERVER_ERROR(500, "일시적인 오류가 발생했습니다.");

    private final int status;
    private final String message;
}
```

`ApiResponse.fail()`과 `GlobalExceptionHandler`에서 `String` 대신 `ErrorCode`를 사용한다:

```java
// ApiResponse에서 ErrorCode 사용
public static <T> ApiResponse<T> fail(ErrorCode errorCode) {
    ApiResponse<T> response = new ApiResponse<>();
    response.success = false;
    response.message = errorCode.getMessage();
    response.errorCode = errorCode.name();
    return response;
}

// GlobalExceptionHandler에서 사용
return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.fail(ErrorCode.NOT_FOUND));
```

### 도메인 상태값 Enum

도메인에서 정해진 상태값도 Enum으로 정의한다:

```java
// 온보딩 수료 상태
public enum OnboardingStatus {
    PENDING,        // 미시작
    IN_PROGRESS,    // 진행 중
    COMPLETED       // 수료 완료
}

// 사용자 권한
public enum UserRole {
    ROLE_USER,      // 일반 사용자
    ROLE_ADMIN      // 관리자
}
```

Entity 필드에 적용:

```java
@Entity
public class Onboarding extends BaseEntity {

    @Enumerated(EnumType.STRING)  // DB에 "COMPLETED" 문자열로 저장 (숫자 저장 금지)
    private OnboardingStatus status = OnboardingStatus.PENDING;

    public void complete() {
        this.status = OnboardingStatus.COMPLETED;
    }
}
```

> **`@Enumerated(EnumType.STRING)` 필수** — `EnumType.ORDINAL`(기본값)은 순서 숫자(0, 1, 2)로 저장해서 Enum 순서가 바뀌면 기존 데이터가 깨진다. 반드시 `EnumType.STRING`으로 문자열 저장.

### Enum을 쓰면 좋은 경우 요약

| 상황 | 예시 |
|------|------|
| 에러 코드 | `ErrorCode.NOT_FOUND`, `ErrorCode.UNAUTHORIZED` |
| 도메인 상태 | `OnboardingStatus.COMPLETED`, `DocumentStatus.DELETED` |
| 사용자 권한 | `UserRole.ROLE_ADMIN` |
| 카테고리 타입 | `CategoryType.HR`, `CategoryType.DEVELOPMENT` |

**Enum을 쓰지 않는 경우**: 값이 동적으로 추가/삭제되는 경우(예: 사용자가 직접 카테고리를 만드는 경우)는 DB 테이블로 관리한다.

## 로깅 규칙

- `System.out.println` 금지 — 반드시 `@Slf4j` + `log.xxx()` 사용
- `e.printStackTrace()` 금지 — 스택 정보가 콘솔/로그에 그대로 노출되어 시스템 내부 구조가 공격자에게 노출될 수 있다 (행안부 보안약점 33번: 오류 메시지를 통한 정보 노출)
- 로그 레벨은 아래 기준으로 선택한다

| 레벨 | 메서드 | 사용 기준 | 예시 |
|------|--------|----------|------|
| DEBUG | `log.debug()` | 개발 중 흐름 추적. 운영에선 출력 안 됨 | 메서드 진입, 변수값 확인 |
| INFO | `log.info()` | 정상 동작 중 주요 이벤트 기록 | 로그인 성공, 문서 등록 완료 |
| WARN | `log.warn()` | 즉각 오류는 아니지만 주의가 필요한 상황 | 존재하지 않는 리소스 조회 시도, 재시도 발생 |
| ERROR | `log.error()` | 예상치 못한 오류, 서비스 영향 가능성 있는 상황 | 외부 API 호출 실패, DB 연결 오류 |

```java
@Slf4j
@Service
public class DocumentServiceImpl implements DocumentService {

    public DocumentResponseDto getDocument(Long id) {
        log.debug("문서 조회 시작. id={}", id);

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("존재하지 않는 문서 조회 시도. id={}", id);
                    return new DocumentNotFoundException(id);
                });

        log.info("문서 조회 성공. id={}, title={}", id, document.getTitle());
        return new DocumentResponseDto(document.getId(), document.getTitle(), document.getCreatedAt());
    }
}
```

- 민감 정보(비밀번호, 토큰 등)는 로그에 절대 출력하지 않는다
- 로그 메시지에 변수는 `{}` 플레이스홀더로 넣는다 (`"id=" + id` 형태 금지 — 불필요한 문자열 연산 발생)

## 쿼리 처리 전략

**JPA + MyBatis 혼용.** 역할을 명확히 나눠서 사용한다.

| 상황 | 도구 | 기준 |
|------|------|------|
| 단순 CRUD, 연관관계 처리 | **JPA** | 엔티티 단위 조회/저장/수정/삭제 |
| 복잡한 통계 쿼리, 다중 테이블 조인, 동적 쿼리 | **MyBatis** | JPA로 표현하기 어려운 복잡한 SQL |

### JPA 사용 — 단순 CRUD

**1. JPA 메서드명 쿼리 (가장 단순):**
```java
List<Document> findAllByCategoryId(Long categoryId);
Optional<Document> findByTitleAndIsDeleted(String title, boolean isDeleted);
boolean existsByTitle(String title);
```
- 관례 전체 목록: [Spring Data JPA 공식 문서 - Query Methods](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)

**2. `@Query` JPQL (중간 복잡도):**
```java
@Query("SELECT d FROM Document d JOIN d.category c WHERE c.name = :categoryName AND d.isDeleted = false")
List<Document> findByCategoryName(@Param("categoryName") String categoryName);
```

### MyBatis 사용 — 복잡한 쿼리

> **⚠️ SQL Injection 방지 — `${}` 금지, `#{}` 사용 필수**
> - `#{}` — PreparedStatement 방식. 입력값을 파라미터로 바인딩해서 SQL Injection 방어
> - `${}` — 문자열 치환 방식. 입력값이 SQL에 직접 삽입되어 SQL Injection에 취약
> ```xml
> <!-- ❌ 금지 — SQL Injection 취약 -->
> WHERE title = '${title}'
>
> <!-- ✅ 사용 — SQL Injection 방어 -->
> WHERE title = #{title}
> ```
> 테이블명, 컬럼명처럼 파라미터 바인딩이 불가능한 경우에만 `${}` 사용을 허용하되, 해당 값은 반드시 서버에서 검증된 값만 사용한다.

```xml
<!-- resources/mapper/DocumentMapper.xml -->
<select id="findStatisticsByCategoryId" resultType="DocumentStatisticsDto">
    SELECT
        c.name AS categoryName,
        COUNT(d.id) AS totalCount,
        SUM(CASE WHEN d.is_deleted = false THEN 1 ELSE 0 END) AS activeCount
    FROM document d
    JOIN category c ON d.category_id = c.id
    WHERE c.id = #{categoryId}
    GROUP BY c.id, c.name
</select>
```

```java
// Mapper 인터페이스
@Mapper
public interface DocumentMapper {
    DocumentStatisticsDto findStatisticsByCategoryId(Long categoryId);
}
```

### build.gradle 의존성 추가 (MyBatis, PostgreSQL)

```groovy
dependencies {
    // MyBatis
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'

    // PostgreSQL 드라이버
    runtimeOnly 'org.postgresql:postgresql'
}
```

## DTO 작성 규칙

DTO는 기본적으로 **record**로 정의한다. record는 불변 객체라 DTO의 목적(데이터 전달)에 맞고, 생성자/getter/equals/hashCode/toString을 자동으로 만들어줘서 코드가 간결해진다.

```java
// Response DTO — record 사용
public record DocumentResponseDto(
        Long id,
        String title,
        String categoryName,
        LocalDateTime createdAt
) {}

// Service에서 변환 예시
public DocumentResponseDto getDocument(Long id) {
    Document document = documentRepository.findById(id)
            .orElseThrow(() -> new DocumentNotFoundException(id));
    return new DocumentResponseDto(
            document.getId(),
            document.getTitle(),
            document.getCategory().getName(),
            document.getCreatedAt()
    );
}
```

**record를 쓰지 않는 경우:**

| 경우 | 이유 | 대안 |
|------|------|------|
| `@Valid` 유효성 검사가 필요한 Request DTO | Spring Boot 버전에 따라 record에서 `@Valid` 동작이 불안정할 수 있음 | class + `@Getter` + `@NoArgsConstructor` |
| 필드를 나중에 채워야 하는 경우 (빌더 패턴) | record는 생성 시 모든 필드를 받아야 함 | class + `@Builder` |

```java
// Request DTO — @Valid 필요 시 class 사용
@Getter
@NoArgsConstructor
public class DocumentCreateRequestDto {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    @NotNull(message = "카테고리는 필수입니다.")
    private Long categoryId;
}
```

## BaseEntity

공통 컬럼(`createdAt`, `updatedAt`)은 `BaseEntity` 추상 클래스에 정의하고 모든 Entity가 상속한다. 각 Entity마다 반복 선언하지 않는다.

- **인터페이스가 아닌 추상 클래스(`@MappedSuperclass`)** 를 사용한다. 인터페이스는 JPA가 컬럼 매핑을 인식하지 못하기 때문.
- `@EntityListeners(AuditingEntityListener.class)` + `@EnableJpaAuditing` 으로 생성/수정 시각을 자동으로 채운다 (직접 set 불필요)

```java
// global/entity/BaseEntity.java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

```java
// 사용 예시
@Entity
public class Document extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    // createdAt, updatedAt은 BaseEntity에서 상속
}
```

```java
// Application 클래스 또는 Config 클래스에 추가 필요
@EnableJpaAuditing
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## Soft Delete (삭제 처리 방식)

> **이 방식은 추천 방식이며, 팀 합의에 따라 실제 삭제 방식으로 변경할 수 있다.**

데이터를 DB에서 실제로 삭제하지 않고 `isDeleted = true` 로 변경하는 방식을 사용한다.

**이유:**
- 관리자가 문서를 실수로 삭제했을 때 복구 가능
- 온보딩 수료 이력 등 기록이 남아야 하는 데이터에서 관련 문서가 실제 삭제되면 이력이 깨짐

**BaseEntity에 추가:**

```java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean isDeleted = false;  // 삭제 여부

    private LocalDateTime deletedAt;    // 삭제 시각 (null이면 미삭제)
}
```

**Entity에 `@SQLDelete` + `@SQLRestriction` 적용 (추천):**

```java
@Entity
@SQLDelete(sql = "UPDATE document SET is_deleted = true, deleted_at = NOW() WHERE id = ?")
@SQLRestriction("is_deleted = false")  // 모든 조회에 자동으로 WHERE is_deleted = false 추가
public class Document extends BaseEntity {
    ...
}
```

- `@SQLDelete`: JpaRepository의 `delete()` 호출 시 실제 DELETE 대신 UPDATE로 자동 변환
- `@SQLRestriction`: 조회 시 삭제된 데이터가 자동으로 필터링됨. 이 어노테이션 없으면 삭제된 데이터가 조회에 섞이는 버그 발생

> **실제 삭제가 필요한 경우 (예: 개인정보 완전 삭제)** 는 `@SQLDelete`를 거치지 않고 JPQL로 직접 처리한다:
> ```java
> @Modifying
> @Query("DELETE FROM Document d WHERE d.id = :id")
> void hardDelete(@Param("id") Long id);
> ```

## Checkstyle IDE 설정 (선택사항)

> ⚠️ **이 섹션 전체는 선택사항이다.** 코딩 컨벤션 문서로 팀 합의가 돼 있으면 Checkstyle 없이도 충분하다. 10일 프로젝트에서 기능 구현이 우선이라 설치 문제로 시간 낭비하는 것보다 건너뛰는 게 나을 수 있다. 해보고 싶은 팀원만 설치한다.
>
> ⚠️ **확인 필요**: 아래 설치 방법은 2019년 가이드 문서 기반으로 작성되었으며 일부 경로나 버전이 현재와 다를 수 있다. 설치 시 문제가 생기면 공식 문서를 참조한다.
> - Checkstyle 공식: https://checkstyle.org/
> - Eclipse 플러그인: https://checkstyle.org/eclipse-cs/

**Checkstyle이란?**
Java 소스코드가 팀에서 정한 코딩 컨벤션(들여쓰기, 줄 길이, 네이밍 규칙 등)을 잘 따르고 있는지 자동으로 검사해주는 도구다. IDE 플러그인을 설치하면 코드 작성 중 위반 항목을 실시간으로 표시해주고, CI에 연동하면 컨벤션 위반 시 빌드를 실패시켜 merge를 막을 수 있다. SpotBugs가 버그/보안 취약점을 잡는다면 Checkstyle은 코드 스타일을 잡는다.

Checkstyle은 CI에서 강제되지만, 로컬에서 미리 확인하려면 IDE 플러그인을 설치한다.

> **실제 강제는 CI(TeamCity)** 가 한다. IDE 플러그인은 커밋 전 로컬에서 미리 확인하는 편의 도구.

### IntelliJ

1. `Settings → Plugins → Marketplace` 에서 `CheckStyle-IDEA` 검색 후 설치
2. `Settings → Tools → Checkstyle`
   - **Configuration File** → `+` 버튼 → 프로젝트의 `backend/checkstyle.xml` 경로 등록
   - Checkstyle version은 프로젝트에서 사용하는 버전과 맞춘다
3. (선택) 저장 시 자동 포매팅 연동:
   - `Settings → Editor → Code Style → Java → 톱니바퀴 아이콘 → Import Scheme → CheckStyle configuration`
   - `checkstyle.xml` 파일 선택하면 IntelliJ 자동 포매팅도 Checkstyle 규칙에 맞춰짐

### Eclipse

1. `Help → Install New Software → Add`
   - Name: `Checkstyle`
   - Location: `https://checkstyle.org/eclipse-cs-update-site/`
2. 목록에서 Checkstyle 선택 후 설치, Eclipse 재시작
3. 프로젝트 우클릭 → `Properties → Checkstyle`
   - `Enable project specific settings` 체크
   - `New → External Configuration File` → 프로젝트의 `backend/checkstyle.xml` 경로 등록
4. 이후 코드 저장 시 위반 항목이 Problems 탭에 표시됨

## 트랜잭션 처리 규칙

- `@Transactional`은 **Service 레이어에만** 붙인다. Controller나 Repository에 붙이지 않는다
- 데이터 변경이 없는 조회 메서드는 `@Transactional(readOnly = true)` 를 붙인다
  - readOnly = true는 JPA의 영속성 컨텍스트가 스냅샷을 저장하지 않아 성능이 개선됨
  - 실수로 데이터를 변경하는 버그를 방지하는 효과도 있음
- 예외 발생 시 롤백은 `RuntimeException` 기준으로 자동 처리된다 (checked exception은 롤백 안 됨)

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)   // 클래스 기본값: 조회 메서드 위주라면 readOnly를 기본으로
public class DocumentServiceImpl implements DocumentService {

    // 조회 — readOnly = true 상속
    public DocumentResponseDto getDocument(Long id) {
        return documentRepository.findById(id)
                .map(doc -> new DocumentResponseDto(doc.getId(), doc.getTitle(), doc.getCreatedAt()))
                .orElseThrow(() -> new DocumentNotFoundException(id));
    }

    // 변경 — 별도로 @Transactional 붙여서 readOnly 오버라이드
    @Transactional
    public void createDocument(DocumentCreateRequestDto request) {
        documentRepository.save(Document.create(request.title(), request.categoryId()));
    }
}
```

## CORS 설정

프론트엔드(React)와 백엔드(Spring)가 다른 포트에서 실행되기 때문에 CORS 설정을 하지 않으면 로컬에서 API 호출 시 브라우저가 요청을 차단한다. 팀원이 개발 시작할 때 가장 먼저 부딪히는 문제라 프로젝트 초기에 반드시 설정해야 한다.

> **CORS(Cross-Origin Resource Sharing)란?**
> 브라우저는 보안상 다른 출처(Origin)의 리소스 요청을 기본적으로 차단한다. 출처는 `프로토콜 + 도메인 + 포트`의 조합이다.
> 로컬 개발 환경에서 React는 보통 `http://localhost:3000`, Spring은 `http://localhost:8080` 에서 실행되는데, 포트가 달라 다른 출처로 간주되어 CORS 오류가 발생한다.

### CorsConfig.java 예시

`global/config/CorsConfig.java` 에 아래 클래스를 추가한다:

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 허용할 출처 (로컬 React 개발 서버)
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",   // 로컬 프론트엔드
                "https://도메인.com"       // 배포 프론트엔드 (확정 후 변경)
        ));

        // 허용할 HTTP 메서드
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 허용할 헤더
        config.setAllowedHeaders(List.of("*"));

        // 인증 정보(쿠키, Authorization 헤더) 포함 허용
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);  // /api/** 경로에만 적용
        return source;
    }
}
```

### SecurityConfig에 CORS 연동

Spring Security를 사용하면 Security 필터 체인에도 CORS를 연동해야 한다. `CorsConfig`를 그냥 Bean으로만 등록하면 Security가 먼저 요청을 차단해버려서 CORS 설정이 적용 안 되는 경우가 생긴다.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))  // CORS 연동
            // ... 나머지 Security 설정
        return http.build();
    }
}
```

### 환경별 허용 출처 관리

로컬과 운영의 허용 출처가 다르므로 `application.yml`로 분리하는 게 좋다:

```yaml
# application-local.yml
cors:
  allowed-origins: http://localhost:3000

# application-prod.yml
cors:
  allowed-origins: https://도메인.com
```

```java
@Value("${cors.allowed-origins}")
private String allowedOrigins;

config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
```

## 인증 · 권한 처리 규칙

인증 방식은 **JWT (JSON Web Token)** 를 사용한다.

### JWT 방식 선택 이유

- 서버가 세션을 저장하지 않아도 돼서 서버 확장이 쉬움 (Stateless)
- 토큰 자체에 사용자 정보가 담겨 있어 별도 DB 조회 없이 인증 가능

### 권한 구분

| 역할 | 설명 | 접근 가능 API |
|------|------|--------------|
| `ROLE_USER` | 일반 사용자 (신입사원, 직원) | `/api/**` |
| `ROLE_ADMIN` | 관리자 | `/api/**`, `/api/admin/**` |

### 규칙

- JWT 토큰은 `Authorization: Bearer {token}` 헤더로 전달
- 토큰 검증 로직은 `global/config/` 의 Security 설정에서 처리 — Controller에서 직접 토큰 파싱 금지
- 현재 로그인한 사용자 정보는 `@AuthenticationPrincipal` 로 Controller에서 받는다

```java
// Controller에서 현재 사용자 정보 받는 예시
@GetMapping("/me")
public ResponseEntity<ApiResponse<UserResponseDto>> getMyInfo(
        @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.success(
            userService.getUser(userDetails.getUsername())
    ));
}
```

- 관리자 API(`/api/admin/**`)는 Security 설정에서 `ROLE_ADMIN` 만 접근 가능하도록 강제

## 환경 분리 (application.yml)

환경별로 프로파일을 나눠서 설정을 분리한다.

로컬에서 개발할 때 DB 주소, 로그 레벨, 외부 API 키가 운영 서버랑 달라야 한다. 하나의 파일에 다 넣으면 배포할 때 실수로 로컬 설정이 운영에 올라가거나, 운영 DB 정보가 코드에 노출되는 사고가 생긴다. 환경별로 파일을 나누면 "이 파일은 로컬 전용"이 명확해져서 실수가 줄어든다.

### 파일 구조

```
src/main/resources/
├── application.yml           # 공통 설정 (프로파일 무관하게 항상 적용)
├── application-local.yml     # 로컬 개발 환경
├── application-dev.yml       # 개발 서버
└── application-prod.yml      # 운영 서버
```

### application.yml (공통)

```yaml
spring:
  profiles:
    active: local   # 기본값: 로컬. 서버 배포 시 환경변수로 덮어씀
  application:
    name: sinip-jeongseok
```

### application-local.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sinip_local   # 로컬 PostgreSQL
    username: postgres
    password: password                                  # 로컬 DB 비밀번호
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop   # 로컬은 실행할 때마다 테이블 새로 생성
    show-sql: true            # 로컬에서만 SQL 로그 출력
    database-platform: org.hibernate.dialect.PostgreSQLDialect

logging:
  level:
    com.visited.www: DEBUG
```

> 로컬에서 PostgreSQL을 직접 설치하거나 Docker로 띄운 후 접속한다.
> ```bash
> # Docker로 PostgreSQL 실행 예시
> docker run --name sinip-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sinip_local -p 5432:5432 -d postgres
> ```

### application-prod.yml

```yaml
spring:
  datasource:
    url: ${DB_URL}            # 환경변수로 주입 (코드에 DB 정보 노출 금지)
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: none          # 운영은 절대 자동 DDL 금지
    show-sql: false
    database-platform: org.hibernate.dialect.PostgreSQLDialect
  springdoc:
    api-docs:
      enabled: false          # 운영에서 Swagger 비활성화
    swagger-ui:
      enabled: false

logging:
  level:
    com.visited.www: WARN
```

### application-dev.yml

개발 서버(팀원 공용 테스트 서버) 환경. 운영 서버와 동일하게 실제 DB를 사용하되, Swagger는 열어두고 로그는 DEBUG보다 조금 더 자세히 남긴다.

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate      # 개발 서버는 스키마 검증만 (자동 변경 금지)
    show-sql: true            # 개발 서버에서는 SQL 확인 가능
    database-platform: org.hibernate.dialect.PostgreSQLDialect

logging:
  level:
    com.visited.www: INFO
```

> `ddl-auto: validate` — 운영처럼 `none`으로 두면 스키마 불일치를 애플리케이션 시작 전엔 알 수 없어. `validate`는 Entity와 실제 테이블이 맞는지 시작 시점에 검증하고 불일치 시 실행을 거부해서 개발 서버에 적합해.

### 민감 정보 관리 규칙

- DB 비밀번호, JWT 시크릿 키, API 키 등 민감 정보는 **절대 코드에 직접 작성하지 않는다**
- `${환경변수명}` 형태로 참조하고, 실제 값은 서버 환경변수 또는 `.env` 파일로 관리
- `.env` 파일은 `.gitignore` 에 반드시 추가 — **Git에 올라가면 절대 안 됨**

## Checkstyle 설정 파일 (checkstyle.xml) (선택사항)

> ⚠️ **선택사항.** Checkstyle IDE 설정 섹션과 함께 사용한다. CI에서도 Checkstyle을 강제하려면 이 파일이 필요하다.

아래는 Google Java Style 기반의 기본 설정 예시이며, 팀 상황에 맞게 수정해도 된다:

```xml
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
    "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
    "https://checkstyle.org/dtds/configuration_1_3.dtd">
<module name="Checker">
    <property name="charset" value="UTF-8"/>
    <property name="severity" value="error"/>

    <module name="TreeWalker">
        <!-- 들여쓰기: 4칸 -->
        <module name="Indentation">
            <property name="basicOffset" value="4"/>
            <property name="caseIndent" value="4"/>
        </module>

        <!-- 줄 길이: 120자 -->
        <module name="LineLength">
            <property name="max" value="120"/>
        </module>

        <!-- 미사용 import 금지 -->
        <module name="UnusedImports"/>

        <!-- 와일드카드 import 금지 (import java.util.*; 금지) -->
        <module name="AvoidStarImport"/>

        <!-- 빈 블록 금지 (catch (Exception e) {} 금지) -->
        <module name="EmptyBlock"/>

        <!-- 중괄호 스타일 강제 -->
        <module name="NeedBraces"/>
    </module>
</module>
```

**build.gradle에 Checkstyle 플러그인 추가:**

```groovy
plugins {
    id 'checkstyle'
}

checkstyle {
    toolVersion = '10.12.4'
    configFile = file('checkstyle.xml')
    ignoreFailures = false   // 위반 시 빌드 실패
}
```

> CI에서 `./gradlew check` 실행 시 Checkstyle도 함께 검사된다.
> 위반 항목이 있으면 빌드가 실패하므로 PR merge가 막힌다.

## 테스트 규칙

### 테스트 전략

| 종류 | 도구 | 대상 | 작성 의무 | CI 강제 |
|------|------|------|----------|---------|
| 단위 테스트 | JUnit5 + Mockito | Service 레이어 | **필수** | 2단계부터 |
| 통합 테스트 | `@SpringBootTest` + MockMvc | Controller (API 요청/응답) | **필수** | 2단계부터 |

- **작성 의무**: 기능 구현과 함께 항상 작성해야 한다. CI 강제 시점과 무관
- **CI 강제**: 1단계에선 CI가 테스트 통과를 강제하지 않음. 2단계부터 테스트 미통과 시 merge 불가 ([cicd.md](./cicd.md) 참조)

### 단위 테스트 규칙

Service 레이어의 비즈니스 로직을 검증한다. 외부 의존성(Repository, 외부 API 등)은 Mockito로 대체해서 순수하게 Service 로직만 테스트한다.

> **어노테이션 설명**
> - `@ExtendWith(MockitoExtension.class)`: JUnit5에 Mockito를 연동하는 설정. 이게 있어야 `@Mock`, `@InjectMocks`가 동작함. Spring 컨텍스트를 띄우지 않아서 실행 속도가 빠름
> - `@Mock`: 가짜 객체(Mock)를 만든다. `DocumentRepository`가 실제 DB에 연결하는 대신, 내가 원하는 값을 반환하도록 지정할 수 있음. "DB 없이 Service 로직만 테스트"할 때 씀
> - `@InjectMocks`: 테스트할 실제 객체를 생성하고, `@Mock`으로 만든 가짜 객체를 자동으로 주입해줌. `DocumentServiceImpl` 안에 `DocumentRepository`가 있으면 `@Mock`으로 만든 가짜 Repository를 알아서 넣어줌

```java
// DocumentServiceTest.java
@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @InjectMocks
    private DocumentServiceImpl documentService;

    @Mock
    private DocumentRepository documentRepository;

    @Test
    @DisplayName("존재하는 문서 ID로 조회하면 DocumentResponseDto를 반환한다")
    void getDocument_success() {
        // given
        Document document = Document.builder()
                .id(1L)
                .title("온보딩 가이드")
                .build();
        given(documentRepository.findById(1L)).willReturn(Optional.of(document));

        // when
        DocumentResponseDto result = documentService.getDocument(1L);

        // then
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.title()).isEqualTo("온보딩 가이드");
    }

    @Test
    @DisplayName("존재하지 않는 문서 ID로 조회하면 DocumentNotFoundException이 발생한다")
    void getDocument_notFound() {
        // given
        given(documentRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> documentService.getDocument(999L))
                .isInstanceOf(DocumentNotFoundException.class);
    }
}
```

### 통합 테스트 규칙

실제 Spring 컨텍스트를 띄워서 Controller까지 포함한 API 요청/응답을 검증한다.

> **어노테이션 설명**
> - `@SpringBootTest`: 실제 Spring 컨텍스트를 전부 띄운다. 애플리케이션을 실제로 실행하는 것과 거의 동일한 환경에서 테스트. 그래서 단위 테스트보다 실행 속도가 느림
> - `@AutoConfigureMockMvc`: 실제 HTTP 서버를 띄우지 않고 MockMvc를 자동으로 설정해줌. MockMvc는 가짜 HTTP 요청을 만들어서 Controller를 테스트할 수 있게 해주는 도구
> - `@Autowired MockMvc`: `@AutoConfigureMockMvc`가 만들어준 MockMvc 객체를 주입받음. `mockMvc.perform(get("/api/documents/1"))` 같이 실제 API 요청처럼 테스트할 수 있음
> - `@MockBean`: Spring 컨텍스트 안에 있는 실제 Bean을 가짜 객체로 교체함. `@Mock`과 비슷하지만 Spring 컨텍스트에 등록된다는 차이가 있음. Controller는 실제 Service 대신 이 가짜 Service를 사용하게 됨
>
> **`@Mock` vs `@MockBean` 차이:**
> - `@Mock`: Spring 컨텍스트 없이 순수 Mockito 환경에서 사용 (단위 테스트)
> - `@MockBean`: Spring 컨텍스트 안에서 Bean을 가짜로 교체할 때 사용 (통합 테스트)

```java
// DocumentControllerTest.java
@SpringBootTest
@AutoConfigureMockMvc
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DocumentService documentService;

    @Test
    @DisplayName("GET /api/documents/{id} — 존재하는 문서 조회 시 200 반환")
    void getDocument_success() throws Exception {
        // given
        DocumentResponseDto response = new DocumentResponseDto(1L, "온보딩 가이드", LocalDateTime.now());
        given(documentService.getDocument(1L)).willReturn(response);

        // when & then
        mockMvc.perform(get("/api/documents/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("온보딩 가이드"));
    }

    @Test
    @DisplayName("GET /api/documents/{id} — 존재하지 않는 문서 조회 시 404 반환")
    void getDocument_notFound() throws Exception {
        // given
        given(documentService.getDocument(999L))
                .willThrow(new DocumentNotFoundException(999L));

        // when & then
        mockMvc.perform(get("/api/documents/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
```

### 테스트 파일 위치 및 네이밍

테스트 코드는 `src/test/java/` 아래에 **프로덕션 코드와 동일한 패키지 구조**로 둔다.

```
src/
├── main/java/com/visited/www/
│   ├── service/
│   │   └── DocumentServiceImpl.java
│   └── controller/
│       └── DocumentController.java
└── test/java/com/visited/www/
    ├── service/
    │   └── DocumentServiceTest.java       # 단위 테스트
    └── controller/
        └── DocumentControllerTest.java    # 통합 테스트
```

- 파일명: 테스트 대상 클래스명 + `Test` (예: `DocumentServiceImpl` → `DocumentServiceTest`)
- 패키지 경로가 main과 일치해야 `@SpringBootTest` 환경에서 Bean 스캔이 정상 동작함

### 테스트 작성 규칙

- **기능 구현 후 바로 테스트 작성** — PR에 기능 코드와 테스트 코드를 함께 올린다. CI의 테스트 강제 시점과 무관하게 테스트 코드 작성은 항상 필수다 (CI 단계별 적용 계획은 [cicd.md](./cicd.md) 참조)
- **테스트 메서드명은 한국어** — `@DisplayName`으로 "어떤 상황에서 어떤 결과가 나와야 하는지" 명확히 작성
- **given/when/then 패턴** — 준비/실행/검증 세 단계로 구조화
  - `given`: 테스트 실행을 준비하는 단계 (Mock 동작 지정, 데이터 세팅)
  - `when`: 테스트를 진행하는 단계 (실제 메서드 호출)
  - `then`: 테스트 결과를 검증하는 단계 (반환값, 예외 발생 여부 확인)
- 성공 케이스와 **실패 케이스 모두** 작성 (존재하지 않는 ID 조회, 권한 없는 접근 등)
- 테스트끼리 독립적이어야 한다 — 테스트 실행 순서가 바뀌어도 결과가 같아야 함

## 보안 코딩 규칙

행정안전부 SW 보안약점 기준으로 개발 시 반드시 지켜야 할 보안 규칙이다. SpotBugs + FindSecurityBugs IDE 플러그인을 설치하면 아래 항목 상당수를 자동으로 탐지할 수 있다.

### SpotBugs + FindSecurityBugs IDE 플러그인 설치

Checkstyle은 코드 스타일만 잡는다. 보안 취약점은 SpotBugs + FindSecurityBugs가 잡아준다.

**Eclipse:**
1. `Help → Install New Software → Add`
   - Name: `SpotBugs`
   - Location: `https://spotbugs.github.io/eclipse/`
2. 목록에서 SpotBugs 선택 후 설치, Eclipse 재시작
3. `Windows → Preferences → Java → SpotBugs → Plugins` 에서 FindSecurityBugs jar 추가
   - https://find-sec-bugs.github.io/ 에서 다운로드
4. `Reported bug categories` 에서 `Security` 활성화
5. 프로젝트 우클릭 → `SpotBugs → Find Bugs` 로 검사 실행

**IntelliJ (확인 필요 — IntelliJ 설치 후 직접 확인):**
- 공식 문서: https://spotbugs.github.io/ / https://find-sec-bugs.github.io/
- `Settings → Plugins → Marketplace` 에서 `SpotBugs` 또는 `FindBugs` 검색 후 설치
- 플러그인 버전에 따라 메뉴 경로가 다를 수 있으니 설치 후 확인 필요

### SQL Injection 방지 (MyBatis)

→ 쿼리 처리 전략 섹션 참조. MyBatis에서 `${}` 사용 금지, `#{}` 필수.

### 취약한 암호화 알고리즘 금지

비밀번호 해시, 데이터 암호화 시 아래 기준을 따른다:

| 용도 | 금지 | 사용 |
|------|------|------|
| 해시 (비밀번호) | MD5, SHA-1, MD2, MD4 | BCrypt, SHA-256 이상 |
| 대칭 암호화 | DES, 3DES | AES-256 |
| 비대칭 암호화 | RSA 1024bit 이하 | RSA 2048bit 이상 |

```java
// ❌ 금지 — 취약한 해시 알고리즘
MessageDigest md = MessageDigest.getInstance("MD5");
MessageDigest sha1 = MessageDigest.getInstance("SHA-1");

// ✅ 사용 — 강력한 해시 알고리즘
MessageDigest sha256 = MessageDigest.getInstance("SHA-256");

// ✅ 비밀번호 해시는 BCrypt 권장 (Spring Security 내장)
PasswordEncoder encoder = new BCryptPasswordEncoder();
String encoded = encoder.encode(rawPassword);
```

### 하드코드된 비밀번호/암호화 키 금지

```java
// ❌ 금지 — 코드에 직접 작성
String password = "admin1234";
String secretKey = "mySecretKey";

// ✅ 환경변수로 주입
@Value("${jwt.secret}")
private String secretKey;
```

- FindSecurityBugs의 `HARD_CODE_PASSWORD`, `HARD_CODE_KEY` 룰이 자동 탐지
- 코드에 비밀번호/키가 있으면 Git에 올라가는 순간 노출됨

### 난수 생성

```java
// ❌ 금지 — 예측 가능한 난수
Random random = new Random();

// ✅ 사용 — 암호학적으로 안전한 난수
SecureRandom secureRandom = new SecureRandom();
```

### 민감정보 로그 출력 금지

```java
// ❌ 금지 — 비밀번호, 토큰이 로그에 찍힘
log.info("로그인 시도: id={}, password={}", userId, password);
log.debug("JWT 토큰: {}", token);

// ✅ 민감정보는 로그에서 제외
log.info("로그인 시도: id={}", userId);
```