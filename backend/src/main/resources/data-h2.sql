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