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