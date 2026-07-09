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
-- 교육(edu) 도메인 시드 데이터
-- ============================================================

-- 교육 과정
INSERT INTO educations (id, title, description, completion_criteria, created_at, updated_at)
VALUES
    (1, '신입사원 온보딩 교육', '신입사원이 반드시 이수해야 하는 기본 온보딩 과정', 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, '백엔드 기초 교육', 'Spring Boot와 JPA 기반 백엔드 기초 과정', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, '보안 심화 교육', '웹 취약점과 보안 대응을 다루는 심화 과정', 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 교육 단계
INSERT INTO education_stages (id, education_id, title, description, order_number, created_at, updated_at)
VALUES
    (1, 1, '회사 소개', '회사 비전과 조직 구조 소개', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 1, '정보보안 기초', '기본 보안 수칙과 사내 정책', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, '개발 프로세스', 'Git 협업 및 개발 워크플로우', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 2, 'Spring Boot 입문', 'Spring Boot 기본 개념과 구조', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 2, 'JPA 기초', 'JPA 영속성 컨텍스트 이해', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 3, '웹 취약점 이해', 'OWASP Top 10 개요', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 교육 자료 (단계 1:1), total_duration 단위: 초
INSERT INTO education_materials (id, stage_id, title, video_url, total_duration)
VALUES
    (1, 1, '회사 소개 영상', 'https://videos.example.com/company-intro.mp4', 600),
    (2, 2, '정보보안 기초 강의', 'https://videos.example.com/security-basic.mp4', 900),
    (3, 3, 'Git 워크플로우', 'https://videos.example.com/git-workflow.mp4', 720),
    (4, 4, 'Spring Boot 시작하기', 'https://videos.example.com/springboot-intro.mp4', 1200),
    (5, 5, 'JPA 영속성 컨텍스트', 'https://videos.example.com/jpa-basic.mp4', 1500),
    (6, 6, 'OWASP Top 10', 'https://videos.example.com/owasp-top10.mp4', 1800);

-- 과정 진도 (관리자 id=1, 일반 사용자 id=2)
INSERT INTO education_progress (id, user_id, education_id, progress_rate, status, completed_at, created_at, updated_at)
VALUES
    (1, 1, 1, 66, 'IN_PROGRESS', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 2, 2, 100, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 단계 완료 이력
INSERT INTO stage_completions (id, user_id, stage_id, completed_at)
VALUES
    (1, 1, 1, CURRENT_TIMESTAMP),
    (2, 1, 2, CURRENT_TIMESTAMP),
    (3, 2, 4, CURRENT_TIMESTAMP),
    (4, 2, 5, CURRENT_TIMESTAMP);

-- 영상 시청 위치 (이어보기)
INSERT INTO video_progress (id, user_id, material_id, watched_position)
VALUES
    (1, 1, 3, 120),
    (2, 2, 4, 300);
