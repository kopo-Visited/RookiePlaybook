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

-- 로컬 개발용 일반 사용자 계정 (user@company.com / User1234!) — QNA 시드의 소유자(id=2)
-- 비밀번호 해시는 평문 User1234!의 BCrypt 해시
INSERT INTO users (id, name, email, password, department_id, role_id, position, status, created_at)
VALUES
    (2, '윤정연', 'user@company.com', '$2b$10$WuJnJfA/Wa7d/rt6gIcCkeBeb5F9hqDBfnmyQtJ3csrySLrGxt45O', 4, 1, '사원', 'ACTIVE', CURRENT_TIMESTAMP);

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

INSERT INTO question_categories (id, name, description, status, sort_order, created_at)
VALUES
    (1, '개발 환경', '로컬 세팅, 빌드, 배포 등 개발 환경 관련', 'ACTIVE', 1, CURRENT_TIMESTAMP),
    (2, '인프라',    'VPN, 서버 접근, 네트워크 관련',            'ACTIVE', 2, CURRENT_TIMESTAMP),
    (3, '보안',      '계정, 비밀번호 정책, 접근 권한 관련',      'ACTIVE', 3, CURRENT_TIMESTAMP),
    (4, '인사·복지', '근태, 휴가, 재택근무 등 인사 제도 관련',   'ACTIVE', 4, CURRENT_TIMESTAMP);
ALTER TABLE question_categories ALTER COLUMN id RESTART WITH 5;

INSERT INTO questions (id, user_id, question_category_id, title, content, status, is_deleted, created_at, updated_at)
VALUES
    (1, 2, 1, '로컬 개발 환경 세팅이 궁금합니다',      '신규 입사자인데 백엔드/프론트 로컬 실행 방법을 알고 싶습니다.', 'RECEIVED',    false, DATEADD('HOUR', -1, CURRENT_TIMESTAMP), NULL),
    (2, 2, 2, '사내 VPN 접속이 안 됩니다',             '재택 중인데 VPN 클라이언트에서 인증 오류가 납니다.',            'IN_PROGRESS', false, DATEADD('HOUR', -5, CURRENT_TIMESTAMP), DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
    (3, 2, 3, '비밀번호 변경 주기 정책이 어떻게 되나요', '보안 정책상 비밀번호를 얼마마다 바꿔야 하는지 궁금합니다.',     'ANSWERED',    false, DATEADD('DAY',  -2, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
    (4, 2, 1, 'Git 브랜치 전략이 궁금합니다',          '팀에서 사용하는 브랜치 네이밍과 머지 전략을 알려주세요.',        'ANSWERED',    false, DATEADD('DAY',  -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP)),
    (5, 2, 4, '재택근무 신청 절차 문의',               '재택근무를 하려면 어떤 절차를 밟아야 하나요?',                  'ON_HOLD',     false, DATEADD('DAY',  -4, CURRENT_TIMESTAMP), NULL),
    (6, 3, 1, '사내 위키는 어디서 보나요',              '박신입입니다. 개발 관련 문서를 어디서 찾는지 궁금합니다.',        'RECEIVED',    false, DATEADD('HOUR', -3, CURRENT_TIMESTAMP), NULL),
    (7, 3, 2, '노트북 사양 업그레이드 문의',            '빌드가 너무 느린데 장비 교체 신청이 가능한가요?',                'IN_PROGRESS', false, DATEADD('HOUR', -6, CURRENT_TIMESTAMP), NULL);
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