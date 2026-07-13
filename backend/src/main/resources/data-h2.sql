INSERT INTO departments (id, code, name, active, created_at)
VALUES
    (1, 'DEV', '개발팀', true, CURRENT_TIMESTAMP),
    (2, 'INFRA', '인프라팀', true, CURRENT_TIMESTAMP),
    (3, 'SECURITY', '보안팀', true, CURRENT_TIMESTAMP),
    (4, 'HR', '인사팀', true, CURRENT_TIMESTAMP);

INSERT INTO roles (id, code, name, active, created_at)
VALUES
    (1, 'ROLE_USER', '일반 사용자', true, CURRENT_TIMESTAMP),
    (2, 'ROLE_ADMIN', '관리자', true, CURRENT_TIMESTAMP);

-- 로컬 개발용 기본 관리자 계정 (admin@company.com / Admin1234!)
INSERT INTO users (id, name, email, password, department_id, role_id, position, status, created_at)
VALUES
    (1, '관리자', 'admin@company.com', '$2a$10$J0/0l5we7xOyVKq6jIjSUuM5E8F8AW1q78SaIqL/lZsFwZtVqrPWS', 1, 2, '관리자', 'ACTIVE', CURRENT_TIMESTAMP);

-- 로컬 개발용 일반 사용자 계정 (user@company.com / Admin1234!) — develop 기준, QNA 시드 소유자(id=2)
INSERT INTO users (id, name, email, password, department_id, role_id, position, status, created_at)
VALUES
    (2, '홍길동', 'user@company.com', '$2a$10$J0/0l5we7xOyVKq6jIjSUuM5E8F8AW1q78SaIqL/lZsFwZtVqrPWS', 1, 1, '사원', 'ACTIVE', CURRENT_TIMESTAMP);

-- 로컬 개발용 두 번째 일반 사용자 (user2@company.com / User1234!) — '모든 QNA'에서 다른 작성자 확인용 (id=3)
INSERT INTO users (id, name, email, password, department_id, role_id, position, status, created_at)
VALUES
    (3, '박신입', 'user2@company.com', '$2b$10$WuJnJfA/Wa7d/rt6gIcCkeBeb5F9hqDBfnmyQtJ3csrySLrGxt45O', 1, 1, '사원', 'ACTIVE', CURRENT_TIMESTAMP);

-- users.id는 IDENTITY 컬럼이라 수동 INSERT 이후 시퀀스를 다음 값으로 맞춰주지 않으면
-- 이후 회원가입 시 동일한 id를 다시 생성하려다 PK 충돌이 발생함
ALTER TABLE users ALTER COLUMN id RESTART WITH 4;

-- ============================================================
-- QNA 샘플 데이터 (카테고리 4 / 질문 5 / 답변 2 / 알림 3)
-- ============================================================

-- 카테고리는 DOC(지식문서) 카테고리와 동일하게 맞춤: 공통/개발/인프라/보안/네트워크
INSERT INTO question_categories (id, name, description, status, sort_order, created_at)
VALUES
    (1, '공통',     '전 부서 공통 · 사내 제도 등',        'ACTIVE', 1, CURRENT_TIMESTAMP),
    (2, '개발',     '개발 환경, 빌드, 코드 등',           'ACTIVE', 2, CURRENT_TIMESTAMP),
    (3, '인프라',   '서버, 배포, 장비 등',               'ACTIVE', 3, CURRENT_TIMESTAMP),
    (4, '보안',     '계정, 비밀번호 정책, 접근 권한 등',  'ACTIVE', 4, CURRENT_TIMESTAMP),
    (5, '네트워크', 'VPN, 사내망, 네트워크 장애 등',      'ACTIVE', 5, CURRENT_TIMESTAMP);
ALTER TABLE question_categories ALTER COLUMN id RESTART WITH 6;

INSERT INTO questions (id, user_id, question_category_id, title, content, status, is_deleted, created_at, updated_at)
VALUES
    (1, 2, 2, '로컬 개발 환경 세팅이 궁금합니다',      '신규 입사자인데 백엔드/프론트 로컬 실행 방법을 알고 싶습니다.', 'RECEIVED',    false, DATEADD('HOUR', -1, CURRENT_TIMESTAMP), NULL),
    (2, 2, 5, '사내 VPN 접속이 안 됩니다',             '재택 중인데 VPN 클라이언트에서 인증 오류가 납니다.',            'IN_PROGRESS', false, DATEADD('HOUR', -5, CURRENT_TIMESTAMP), DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
    (3, 2, 4, '비밀번호 변경 주기 정책이 어떻게 되나요', '보안 정책상 비밀번호를 얼마마다 바꿔야 하는지 궁금합니다.',     'ANSWERED',    false, DATEADD('DAY',  -2, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
    (4, 2, 2, 'Git 브랜치 전략이 궁금합니다',          '팀에서 사용하는 브랜치 네이밍과 머지 전략을 알려주세요.',        'ANSWERED',    false, DATEADD('DAY',  -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP)),
    (5, 2, 1, '재택근무 신청 절차 문의',               '재택근무를 하려면 어떤 절차를 밟아야 하나요?',                  'ON_HOLD',     false, DATEADD('DAY',  -4, CURRENT_TIMESTAMP), NULL),
    (6, 3, 2, '사내 위키는 어디서 보나요',              '박신입입니다. 개발 관련 문서를 어디서 찾는지 궁금합니다.',        'RECEIVED',    false, DATEADD('HOUR', -3, CURRENT_TIMESTAMP), NULL),
    (7, 3, 3, '노트북 사양 업그레이드 문의',            '빌드가 너무 느린데 장비 교체 신청이 가능한가요?',                'IN_PROGRESS', false, DATEADD('HOUR', -6, CURRENT_TIMESTAMP), NULL);
ALTER TABLE questions ALTER COLUMN id RESTART WITH 8;

INSERT INTO answers (id, question_id, admin_id, content, created_at, updated_at)
VALUES
    (1, 3, 1, '비밀번호는 90일마다 변경하도록 정책이 설정되어 있으며, 최근 3회 사용한 비밀번호는 재사용할 수 없습니다.', DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL),
    (2, 4, 1, 'develop 브랜치를 기준으로 feat/<도메인>/<이슈> 형태의 브랜치를 파서 작업 후 PR로 머지합니다.',        DATEADD('DAY', -2, CURRENT_TIMESTAMP), NULL);
ALTER TABLE answers ALTER COLUMN id RESTART WITH 3;

INSERT INTO notifications (id, user_id, question_id, message, type, is_read, created_at)
VALUES
    (1, 2, 3, '문의하신 질문에 답변이 등록되었습니다: 비밀번호 변경 주기 정책', 'ANSWER_REGISTERED', false, DATEADD('DAY',  -1, CURRENT_TIMESTAMP)),
    (2, 2, 4, '문의하신 질문에 답변이 등록되었습니다: Git 브랜치 전략',       'ANSWER_REGISTERED', false, DATEADD('DAY',  -2, CURRENT_TIMESTAMP)),
    (3, 2, 2, '문의하신 질문의 상태가 처리중으로 변경되었습니다: 사내 VPN 접속', 'STATUS_CHANGED',   true,  DATEADD('HOUR', -2, CURRENT_TIMESTAMP));
ALTER TABLE notifications ALTER COLUMN id RESTART WITH 4;

-- ============================================================
-- DOC(문서/FAQ) 카테고리 — QNA→FAQ 전환 시 필요 (QNA 카테고리와 동일 명칭)
-- ============================================================
INSERT INTO categories (id, category_name, description, is_public, status, created_at)
VALUES
    (1, '공통',     '전 부서 공통 · 사내 제도',   true, 'ACTIVE', CURRENT_TIMESTAMP),
    (2, '개발',     '개발 환경, 빌드, 코드',       true, 'ACTIVE', CURRENT_TIMESTAMP),
    (3, '인프라',   '서버, 배포, 장비',            true, 'ACTIVE', CURRENT_TIMESTAMP),
    (4, '보안',     '계정, 비밀번호, 접근 권한',   true, 'ACTIVE', CURRENT_TIMESTAMP),
    (5, '네트워크', 'VPN, 사내망, 네트워크 장애',  true, 'ACTIVE', CURRENT_TIMESTAMP);
ALTER TABLE categories ALTER COLUMN id RESTART WITH 6;

-- 태그 (tags)
INSERT INTO tags (tag_name, status, created_at) VALUES
('Git',      'ACTIVE', CURRENT_TIMESTAMP),
('PR',       'ACTIVE', CURRENT_TIMESTAMP),
('Java',     'ACTIVE', CURRENT_TIMESTAMP),
('Spring',   'ACTIVE', CURRENT_TIMESTAMP),
('Docker',   'ACTIVE', CURRENT_TIMESTAMP),
('AWS',      'ACTIVE', CURRENT_TIMESTAMP),
('Linux',    'ACTIVE', CURRENT_TIMESTAMP),
('MySQL',    'ACTIVE', CURRENT_TIMESTAMP),
('보안',     'ACTIVE', CURRENT_TIMESTAMP),
('네트워크', 'ACTIVE', CURRENT_TIMESTAMP),
('VPN',      'ACTIVE', CURRENT_TIMESTAMP),
('온보딩',   'ACTIVE', CURRENT_TIMESTAMP),
('코드리뷰', 'ACTIVE', CURRENT_TIMESTAMP),
('CI/CD',    'ACTIVE', CURRENT_TIMESTAMP),
('운영',     'ACTIVE', CURRENT_TIMESTAMP);

-- 문서 (documents)
INSERT INTO documents (category_id, title, content, is_public, status, view_count, created_at)
SELECT c.id, d.title, d.content, d.is_public, 'ACTIVE', d.view_count, d.created_at
FROM (VALUES
  ('공통', TRUE, 152, DATEADD('DAY', -40, CURRENT_TIMESTAMP), '신입사원 온보딩 안내',
   '입사를 환영합니다! 아래 내용을 꼭 확인해 주세요.
1. 사원증 수령: 총무팀 방문 (1층 안내데스크)
2. 노트북 및 장비 세팅: IT팀 내선 1234
3. 사내 메신저(Slack) 가입 후 #공지채널 참여
4. 첫 주 일정: 팀장 면담 → 부서 OJT → 업무 배정'),
  ('공통', TRUE, 98, DATEADD('DAY', -35, CURRENT_TIMESTAMP), '사내 복지 및 제도 안내',
   '임직원을 위한 복지 제도를 안내합니다.
- 점심 식대 지원: 1일 1만원 (법인카드 사용)
- 유연근무제: 코어타임 10:00~16:00 준수
- 연차: 입사 1년 미만 월 1일 발생
- 경조사 지원: 총무팀 신청서 제출
- 교육비 지원: 연 50만원 한도 (팀장 승인 후 신청)'),
  ('공통', TRUE, 74, DATEADD('DAY', -30, CURRENT_TIMESTAMP), '사내 커뮤니케이션 채널 안내',
   '팀 간 원활한 소통을 위한 채널 안내입니다.
- 공식 메신저: Slack (#전체공지, #개발팀, #인프라팀 등)
- 이메일: 외부 커뮤니케이션 및 공식 문서 전달
- 화상회의: Google Meet (캘린더 초대 링크 사용)
- 이슈 트래킹: GitHub Issues
- 긴급 공지: 문자 또는 전화'),
  ('개발', TRUE, 210, DATEADD('DAY', -28, CURRENT_TIMESTAMP), '개발 환경 세팅 가이드',
   '신입 개발자를 위한 로컬 개발 환경 세팅 가이드입니다.
1. Node.js LTS 버전 설치 후 node -v로 확인
2. Git 초기 설정 (이름, 이메일, SSH 키 등록)
3. 프로젝트 클론 후 .env 파일 설정
4. npm install 실행 후 로컬 서버 구동'),
  ('개발', TRUE, 187, DATEADD('DAY', -25, CURRENT_TIMESTAMP), 'Git 브랜치 전략 및 PR 작성 규칙',
   '팀 협업을 위한 Git 브랜치 전략과 PR 규칙입니다.
- 브랜치명: feat/fe/기능명, feat/be/기능명 형식 사용
- 커밋 메시지: feat, fix, chore, refactor 등 prefix 사용
- PR 작성 시 관련 이슈 번호 반드시 연결
- 최소 1명 이상 코드 리뷰 승인 후 머지'),
  ('개발', TRUE, 143, DATEADD('DAY', -22, CURRENT_TIMESTAMP), '코드 리뷰 가이드',
   '효율적인 코드 리뷰를 위한 가이드입니다.
- 리뷰어: 로직 오류, 성능, 가독성 중심으로 리뷰
- 작성자: 리뷰 코멘트에 24시간 내 응답
- Nit(사소한 개선)은 별도 표시
- 승인 전 모든 Requested Changes 해결 필수'),
  ('인프라', TRUE, 121, DATEADD('DAY', -20, CURRENT_TIMESTAMP), '서버 접속 및 SSH 키 등록',
   '사내 서버 접속을 위한 SSH 키 등록 방법입니다.
1. ssh-keygen -t rsa -b 4096 으로 키 생성
2. ~/.ssh/id_rsa.pub 내용을 인프라팀에 전달
3. 등록 완료 후 ssh [사용자명]@[서버IP] 로 접속
4. 접속 문제 발생 시 인프라팀 내선 5678 연락'),
  ('인프라', TRUE, 165, DATEADD('DAY', -18, CURRENT_TIMESTAMP), '배포 체크리스트',
   '운영 서버 배포 전 확인해야 할 체크리스트입니다.
- 로컬 및 개발 서버에서 정상 동작 확인
- 환경변수 설정 확인 (.env.production)
- DB 마이그레이션 스크립트 검토
- 배포 후 헬스체크 API 응답 확인
- 롤백 계획 수립'),
  ('인프라', TRUE, 89, DATEADD('DAY', -15, CURRENT_TIMESTAMP), '로그 확인 및 장애 대응',
   '서버 로그 확인 방법과 장애 대응 절차입니다.
- 로그 위치: /var/log/app/application.log
- 실시간 로그: tail -f /var/log/app/application.log
- 에러 레벨: ERROR 로그 발생 시 즉시 팀 공유
- 장애 발생: 인프라팀 긴급 연락 후 장애 보고서 작성'),
  ('보안', TRUE, 134, DATEADD('DAY', -12, CURRENT_TIMESTAMP), '보안 정책 및 개인정보 보호',
   '임직원이 반드시 숙지해야 할 보안 정책입니다.
- 고객 개인정보 외부 유출 절대 금지
- 업무용 PC 이외 기기에서 고객 데이터 접근 금지
- 퇴근 시 PC 잠금 및 민감 문서 잠금 보관
- 개인정보 처리 관련 문의: 보안팀 내선 9000'),
  ('보안', TRUE, 76, DATEADD('DAY', -10, CURRENT_TIMESTAMP), '보안 사고 신고 절차',
   '보안 사고 발생 시 즉시 아래 절차를 따르세요.
1. 즉시 보안팀 연락 (내선 9999 / 24시간 핫라인)
2. 관련 시스템 접근 즉시 중단
3. 상황 보고서 작성 (발생 시각, 범위, 경위)
4. 보안팀 조사에 적극 협조'),
  ('보안', TRUE, 112, DATEADD('DAY', -8, CURRENT_TIMESTAMP), '계정 보안 및 비밀번호 정책',
   '안전한 계정 관리를 위한 보안 정책입니다.
- 비밀번호: 영문+숫자+특수문자 조합 8자 이상
- 비밀번호 90일마다 변경 필수
- 계정 공유 절대 금지
- 2차 인증(MFA) 설정 권장
- 퇴사자 계정 즉시 비활성화 요청'),
  ('네트워크', TRUE, 198, DATEADD('DAY', -6, CURRENT_TIMESTAMP), 'VPN 접속 방법 및 오류 해결',
   '재택근무 시 VPN 접속 방법과 주요 오류 해결 가이드입니다.
1. GlobalProtect 앱 설치 (사내 포털에서 다운로드)
2. 서버 주소 입력: vpn.company.com
3. 사번과 사내 비밀번호로 로그인
[오류 해결]
- 인증 실패: 비밀번호 초기화 후 재시도
- 연결 불가: IT팀 내선 1234 문의'),
  ('네트워크', TRUE, 87, DATEADD('DAY', -4, CURRENT_TIMESTAMP), '사내 Wi-Fi 및 네트워크 접속',
   '사내 네트워크 접속 방법 안내입니다.
- 사내 Wi-Fi: SSID "Company_Office" (5GHz 권장)
- 비밀번호: IT팀에 문의
- 유선 연결: 자리 배치도 확인 후 LAN 케이블 연결
- 외부 공유기/핫스팟 사내 사용 금지'),
  ('네트워크', TRUE, 63, DATEADD('DAY', -2, CURRENT_TIMESTAMP), '방화벽 정책 및 포트 개방 요청',
   '서버 방화벽 정책과 포트 개방 요청 절차입니다.
- 기본 허용 포트: 80(HTTP), 443(HTTPS), 22(SSH)
- 추가 포트 개방 필요 시: 인프라팀에 요청서 제출
- 요청 항목: 대상 서버, 포트, 프로토콜, 사유
- 처리 기간: 영업일 기준 2일 이내')
) AS d(category_name, is_public, view_count, created_at, title, content)
JOIN categories c ON c.category_name = d.category_name;

-- 문서-태그 연결 (document_tags)
INSERT INTO document_tags (document_id, tag_id, created_at)
SELECT d.id, t.id, CURRENT_TIMESTAMP
FROM (VALUES
  ('신입사원 온보딩 안내',           '온보딩'),
  ('사내 복지 및 제도 안내',         '운영'),
  ('사내 커뮤니케이션 채널 안내',     '온보딩'),
  ('개발 환경 세팅 가이드',          'Git'),
  ('개발 환경 세팅 가이드',          '온보딩'),
  ('Git 브랜치 전략 및 PR 작성 규칙', 'Git'),
  ('Git 브랜치 전략 및 PR 작성 규칙', 'PR'),
  ('Git 브랜치 전략 및 PR 작성 규칙', '코드리뷰'),
  ('코드 리뷰 가이드',               '코드리뷰'),
  ('코드 리뷰 가이드',               'PR'),
  ('서버 접속 및 SSH 키 등록',       'Linux'),
  ('서버 접속 및 SSH 키 등록',       '운영'),
  ('배포 체크리스트',                'CI/CD'),
  ('배포 체크리스트',                'Docker'),
  ('배포 체크리스트',                '운영'),
  ('로그 확인 및 장애 대응',         'Linux'),
  ('로그 확인 및 장애 대응',         '운영'),
  ('보안 정책 및 개인정보 보호',      '보안'),
  ('보안 사고 신고 절차',            '보안'),
  ('계정 보안 및 비밀번호 정책',      '보안'),
  ('VPN 접속 방법 및 오류 해결',     'VPN'),
  ('VPN 접속 방법 및 오류 해결',     '네트워크'),
  ('사내 Wi-Fi 및 네트워크 접속',    '네트워크'),
  ('방화벽 정책 및 포트 개방 요청',   '네트워크'),
  ('방화벽 정책 및 포트 개방 요청',   '보안')
) AS m(doc_title, tag_name)
JOIN documents d ON d.title = m.doc_title
JOIN tags t ON t.tag_name = m.tag_name;

-- 추가 태그
INSERT INTO tags (tag_name, status, created_at) VALUES
('PostgreSQL', 'ACTIVE', CURRENT_TIMESTAMP),
('React',      'ACTIVE', CURRENT_TIMESTAMP),
('API',        'ACTIVE', CURRENT_TIMESTAMP),
('테스트',     'ACTIVE', CURRENT_TIMESTAMP),
('Python',     'ACTIVE', CURRENT_TIMESTAMP);

-- 추가 문서
INSERT INTO documents (category_id, title, content, is_public, status, view_count, created_at)
SELECT c.id, d.title, d.content, d.is_public, 'ACTIVE', d.view_count, d.created_at
FROM (VALUES
  ('공통', TRUE, 88, DATEADD('DAY', -38, CURRENT_TIMESTAMP), '사내 OA 도구 활용 가이드',
   '업무에 필요한 OA 도구 사용 방법을 안내합니다.
- Google Workspace: Gmail, Drive, Docs, Sheets, Slides 사용
- 공유 드라이브: 팀별 폴더 생성 후 권한 관리
- 캘린더: 회의 초대 시 참석자 전원 초대 필수
- 파일 명명 규칙: [날짜]_[팀명]_[문서명] 형식 사용
- 보안 문서: 외부 공유 금지, 내부 공유만 허용'),
  ('공통', TRUE, 56, DATEADD('DAY', -33, CURRENT_TIMESTAMP), '출장 및 외근 신청 절차',
   '출장 및 외근 발생 시 아래 절차를 따르세요.
1. 출장 신청서 작성: ERP 시스템 → 출장관리 메뉴
2. 팀장 승인 후 출발 (당일 출장은 전일 신청)
3. 교통비: 대중교통 우선, 택시는 심야·긴급 시만 허용
4. 숙박비: 1박 10만원 한도 (법인카드 사용)
5. 귀환 후 3일 이내 정산 완료'),
  ('개발', TRUE, 176, DATEADD('DAY', -20, CURRENT_TIMESTAMP), 'Spring Boot 개발 컨벤션',
   '팀 공통 Spring Boot 개발 컨벤션입니다.
- 패키지 구조: controller / service / repository / entity / dto 분리
- 예외 처리: 전역 ExceptionHandler 사용, 커스텀 Exception 정의
- 응답 형식: ApiResponse 래퍼 클래스 통일
- 트랜잭션: @Transactional 서비스 레이어에만 적용
- 로깅: SLF4J + Logback 사용, System.out.println 금지'),
  ('개발', TRUE, 132, DATEADD('DAY', -16, CURRENT_TIMESTAMP), '단위 테스트 작성 가이드',
   '코드 품질을 위한 단위 테스트 작성 가이드입니다.
- 테스트 프레임워크: JUnit 5 + Mockito
- 테스트 커버리지 목표: 서비스 레이어 80% 이상
- 네이밍: 메서드명_상황_기대결과 형식
- Given-When-Then 패턴 사용
- 외부 의존성(DB, API)은 반드시 Mock 처리'),
  ('개발', TRUE, 109, DATEADD('DAY', -12, CURRENT_TIMESTAMP), 'API 설계 및 문서화 가이드',
   'RESTful API 설계 원칙과 문서화 방법입니다.
- URI 설계: 소문자, 복수형 명사 사용 (예: /api/users)
- HTTP 메서드: GET(조회), POST(생성), PUT(수정), DELETE(삭제)
- 응답 코드: 200/201/400/401/403/404/500 표준 사용
- Swagger: @Operation, @ApiResponse 어노테이션 필수 작성
- API 변경 시 버전 관리 (/api/v1, /api/v2)'),
  ('인프라', TRUE, 143, DATEADD('DAY', -14, CURRENT_TIMESTAMP), 'Docker 컨테이너 운영 가이드',
   '운영 환경 Docker 컨테이너 관리 방법입니다.
- 이미지 빌드: docker build -t [이미지명]:[태그] .
- 컨테이너 실행: docker-compose up -d
- 로그 확인: docker logs -f [컨테이너명]
- 컨테이너 재시작: docker-compose restart [서비스명]
- 이미지 정리: docker system prune -a (주기적 실행)
- 볼륨 백업: 데이터 볼륨 주기적 스냅샷 생성'),
  ('인프라', TRUE, 97, DATEADD('DAY', -9, CURRENT_TIMESTAMP), 'CI/CD 파이프라인 운영 가이드',
   '자동화 배포 파이프라인 운영 가이드입니다.
- 파이프라인 구성: 빌드 → 테스트 → Docker 이미지 빌드 → 배포
- develop 브랜치 push 시 자동 배포 트리거
- 빌드 실패 시 Slack 알림 발송
- 롤백: 이전 이미지 태그로 docker-compose pull 후 재시작
- 배포 이력: GitHub Actions 탭에서 확인 가능'),
  ('보안', TRUE, 91, DATEADD('DAY', -7, CURRENT_TIMESTAMP), '오픈소스 라이브러리 보안 점검',
   '외부 라이브러리 도입 시 보안 점검 절차입니다.
- 라이브러리 도입 전 CVE 취약점 확인 (snyk, npm audit)
- 라이선스 확인: MIT, Apache 2.0 외 라이선스는 법무팀 검토
- 버전 고정: package.json에 정확한 버전 명시
- 주기적 업데이트: 보안 패치 릴리즈 시 즉시 적용
- 취약점 발견 시 보안팀 즉시 보고'),
  ('보안', TRUE, 68, DATEADD('DAY', -5, CURRENT_TIMESTAMP), '소스코드 보안 리뷰 가이드',
   '코드 리뷰 시 보안 관점 체크리스트입니다.
- SQL Injection: PreparedStatement 또는 ORM 사용 확인
- XSS: 사용자 입력값 이스케이프 처리 확인
- 인증/인가: API 엔드포인트 권한 체크 확인
- 민감 정보: 소스코드에 비밀번호/키 하드코딩 금지
- 로그: 개인정보, 비밀번호 로그 출력 금지'),
  ('네트워크', TRUE, 115, DATEADD('DAY', -3, CURRENT_TIMESTAMP), 'DNS 및 도메인 관리 가이드',
   '사내 DNS 설정 및 도메인 관리 방법입니다.
- 내부 DNS: 10.0.0.1 (사내망 전용)
- 외부 DNS: 공식 도메인 변경은 인프라팀 요청
- 도메인 추가: Route53 콘솔 → 인프라팀 담당자 요청
- TTL 설정: 운영 환경 300초, 변경 작업 시 60초로 낮춤
- SSL 인증서: Let''s Encrypt 자동 갱신 설정'),
  ('네트워크', TRUE, 79, DATEADD('DAY', -1, CURRENT_TIMESTAMP), '네트워크 장애 대응 매뉴얼',
   '네트워크 장애 발생 시 대응 절차입니다.
1. 장애 범위 파악: 개인 PC / 팀 / 전사 구분
2. 인프라팀 긴급 연락: 내선 5678 / 휴대폰 010-XXXX-XXXX
3. 임시 조치: 모바일 핫스팟으로 긴급 업무 처리
4. 장애 보고서: 발생 시각, 영향 범위, 원인, 조치 내용 기록
5. 재발 방지: 원인 분석 후 개선 조치')
) AS d(category_name, is_public, view_count, created_at, title, content)
JOIN categories c ON c.category_name = d.category_name;

-- 추가 문서-태그 연결
INSERT INTO document_tags (document_id, tag_id, created_at)
SELECT d.id, t.id, CURRENT_TIMESTAMP
FROM (VALUES
  ('사내 OA 도구 활용 가이드',       '운영'),
  ('사내 OA 도구 활용 가이드',       '온보딩'),
  ('출장 및 외근 신청 절차',         '운영'),
  ('Spring Boot 개발 컨벤션',        'Spring'),
  ('Spring Boot 개발 컨벤션',        'Java'),
  ('단위 테스트 작성 가이드',         '테스트'),
  ('단위 테스트 작성 가이드',         'Java'),
  ('단위 테스트 작성 가이드',         'Spring'),
  ('API 설계 및 문서화 가이드',       'API'),
  ('API 설계 및 문서화 가이드',       'Spring'),
  ('Docker 컨테이너 운영 가이드',     'Docker'),
  ('Docker 컨테이너 운영 가이드',     'Linux'),
  ('Docker 컨테이너 운영 가이드',     '운영'),
  ('CI/CD 파이프라인 운영 가이드',    'CI/CD'),
  ('CI/CD 파이프라인 운영 가이드',    'Docker'),
  ('오픈소스 라이브러리 보안 점검',   '보안'),
  ('소스코드 보안 리뷰 가이드',       '보안'),
  ('소스코드 보안 리뷰 가이드',       '코드리뷰'),
  ('DNS 및 도메인 관리 가이드',       '네트워크'),
  ('DNS 및 도메인 관리 가이드',       'AWS'),
  ('네트워크 장애 대응 매뉴얼',       '네트워크'),
  ('네트워크 장애 대응 매뉴얼',       '운영')
) AS m(doc_title, tag_name)
JOIN documents d ON d.title = m.doc_title
JOIN tags t ON t.tag_name = m.tag_name;

-- ============================================================
-- 교육(edu) 도메인 시드 데이터
-- ============================================================

-- 교육 과정 (department_id: NULL=공통, 1=개발팀, 3=보안팀)
INSERT INTO educations (id, title, description, completion_criteria, department_id, created_at, updated_at)
VALUES
    (1, '신입사원 온보딩 교육', '신입사원이 반드시 이수해야 하는 기본 온보딩 과정', 80, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, '백엔드 기초 교육', 'Spring Boot와 JPA 기반 백엔드 기초 과정', 100, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, '보안 심화 교육', '웹 취약점과 보안 대응을 다루는 심화 과정', 60, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
ALTER TABLE educations ALTER COLUMN id RESTART WITH 4;

-- 교육 단계
INSERT INTO education_stages (id, education_id, title, description, order_number, created_at, updated_at)
VALUES
    (1, 1, '회사 소개', '회사 비전과 조직 구조 소개', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 1, '정보보안 기초', '기본 보안 수칙과 사내 정책', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, '개발 프로세스', 'Git 협업 및 개발 워크플로우', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 2, 'Spring Boot 입문', 'Spring Boot 기본 개념과 구조', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 2, 'JPA 기초', 'JPA 영속성 컨텍스트 이해', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 3, '웹 취약점 이해', 'OWASP Top 10 개요', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
ALTER TABLE education_stages ALTER COLUMN id RESTART WITH 7;

-- 교육 자료 (단계 1:1), total_duration 단위: 초
INSERT INTO education_materials (id, stage_id, title, video_url, total_duration)
VALUES
    -- 로컬 개발용 재생 가능한 영상: MDN 공개 CC0(퍼블릭 도메인, 출처표기 불필요) 클립.
    -- 배포 시에는 CloudFront에 올린 CC0 영상 URL로 교체한다(운영 데이터는 이 파일이 아닌 별도 관리).
    (1, 1, '회사 소개 영상', 'https://mdn.github.io/shared-assets/videos/flower.mp4', 600),
    (2, 2, '정보보안 기초 강의', 'https://mdn.github.io/shared-assets/videos/flower.mp4', 900),
    (3, 3, 'Git 워크플로우', 'https://mdn.github.io/shared-assets/videos/flower.mp4', 720),
    (4, 4, 'Spring Boot 시작하기', 'https://mdn.github.io/shared-assets/videos/flower.mp4', 1200),
    (5, 5, 'JPA 영속성 컨텍스트', 'https://mdn.github.io/shared-assets/videos/flower.mp4', 1500),
    (6, 6, 'OWASP Top 10', 'https://mdn.github.io/shared-assets/videos/flower.mp4', 1800);
ALTER TABLE education_materials ALTER COLUMN id RESTART WITH 7;

-- 과정 진도 (관리자 id=1, 일반 사용자 id=2)
INSERT INTO education_progress (id, user_id, education_id, progress_rate, status, completed_at, created_at, updated_at)
VALUES
    (1, 1, 1, 66, 'IN_PROGRESS', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 2, 2, 100, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
ALTER TABLE education_progress ALTER COLUMN id RESTART WITH 3;

-- 단계 완료 이력
INSERT INTO stage_completions (id, user_id, stage_id, completed_at)
VALUES
    (1, 1, 1, CURRENT_TIMESTAMP),
    (2, 1, 2, CURRENT_TIMESTAMP),
    (3, 2, 4, CURRENT_TIMESTAMP),
    (4, 2, 5, CURRENT_TIMESTAMP);
ALTER TABLE stage_completions ALTER COLUMN id RESTART WITH 5;

-- 영상 시청 위치 (이어보기) — 로컬 CC0 클립 길이(~30초) 안으로 설정해 이어보기 복원이 끝을 넘지 않게 함
INSERT INTO video_progress (id, user_id, material_id, watched_position)
VALUES
    (1, 1, 3, 10),
    (2, 2, 4, 15);
ALTER TABLE video_progress ALTER COLUMN id RESTART WITH 3;
