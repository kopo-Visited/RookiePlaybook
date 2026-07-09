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

-- users.id는 IDENTITY 컬럼이라 수동 INSERT 이후 시퀀스를 다음 값으로 맞춰주지 않으면
-- 이후 회원가입 시 동일한 id(1)를 다시 생성하려다 PK 충돌이 발생함
ALTER TABLE users ALTER COLUMN id RESTART WITH 2;

-- 로컬 개발용 일반 사용자 계정 (user@company.com / Admin1234!)
INSERT INTO users (id, name, email, password, department_id, role_id, position, status, created_at)
VALUES
    (2, '홍길동', 'user@company.com', '$2a$10$J0/0l5we7xOyVKq6jIjSUuM5E8F8AW1q78SaIqL/lZsFwZtVqrPWS', 1, 1, '사원', 'ACTIVE', CURRENT_TIMESTAMP);

-- 위에서 id=2 사용자를 수동 INSERT 했으므로 다음 시퀀스를 3으로 맞춤
ALTER TABLE users ALTER COLUMN id RESTART WITH 3;

-- ============================================================
-- 교육(edu) 도메인 시드 데이터
-- ============================================================

-- 교육 과정
INSERT INTO educations (id, title, completion_criteria, created_at, updated_at)
VALUES
    (1, '신입사원 온보딩 교육', 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, '백엔드 기초 교육', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, '보안 심화 교육', 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 교육 단계
INSERT INTO education_stages (id, education_id, title, order_number, created_at, updated_at)
VALUES
    (1, 1, '회사 소개', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 1, '정보보안 기초', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, '개발 프로세스', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 2, 'Spring Boot 입문', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 2, 'JPA 기초', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 3, '웹 취약점 이해', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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