-- QNA 모듈 더미 데이터 (EC2 PostgreSQL)
-- 실행: psql -h <DB_HOST> -U rookie -d rookie_playbook -f qna-dummy-data.sql
-- ⚠️ 반드시 dummy-data.sql(DOC) 을 먼저 실행한 뒤 실행할 것.
--    아래 faqs INSERT 가 DOC 의 categories(공통/개발/인프라/보안/네트워크)를 JOIN 한다.

BEGIN;

INSERT INTO departments (code, name, active, created_at) VALUES
  ('DEV','개발팀',true,NOW()),('INFRA','인프라팀',true,NOW()),
  ('SECURITY','보안팀',true,NOW()),('HR','인사팀',true,NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles (code, name, active, created_at) VALUES
  ('ROLE_USER','일반 사용자',true,NOW()),('ROLE_ADMIN','관리자',true,NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (name, email, password, department_id, role_id, position, status, created_at)
SELECT u.name, u.email, u.password,
       (SELECT id FROM departments WHERE code=u.dept_code),
       (SELECT id FROM roles WHERE code=u.role_code),
       u.position, 'ACTIVE', NOW()
FROM (VALUES
  ('관리자','admin@company.com','$2a$10$J0/0l5we7xOyVKq6jIjSUuM5E8F8AW1q78SaIqL/lZsFwZtVqrPWS','DEV','ROLE_ADMIN','관리자'),
  ('윤정연','yoon@company.com','$2b$10$WuJnJfA/Wa7d/rt6gIcCkeBeb5F9hqDBfnmyQtJ3csrySLrGxt45O','HR','ROLE_USER','사원'),
  ('박신입','park@company.com','$2b$10$WuJnJfA/Wa7d/rt6gIcCkeBeb5F9hqDBfnmyQtJ3csrySLrGxt45O','DEV','ROLE_USER','사원'),
  ('김개발','kim@company.com','$2b$10$WuJnJfA/Wa7d/rt6gIcCkeBeb5F9hqDBfnmyQtJ3csrySLrGxt45O','DEV','ROLE_USER','사원')
) AS u(name,email,password,dept_code,role_code,position)
ON CONFLICT (email) DO NOTHING;

DELETE FROM notifications;
DELETE FROM answers;
DELETE FROM faqs;
DELETE FROM questions;
DELETE FROM question_categories;

INSERT INTO question_categories (name, description, status, sort_order, created_at) VALUES
  ('공통','전 부서 공통 · 사내 제도','ACTIVE',1,NOW()),
  ('개발','개발 환경, 빌드, 코드','ACTIVE',2,NOW()),
  ('인프라','서버, 배포, 장비','ACTIVE',3,NOW()),
  ('보안','계정, 비밀번호, 접근 권한','ACTIVE',4,NOW()),
  ('네트워크','VPN, 사내망, 네트워크 장애','ACTIVE',5,NOW());

INSERT INTO questions (user_id, question_category_id, title, content, status, is_deleted, created_at, updated_at)
SELECT u.id, c.id, q.title, q.content, q.status, false, q.created_at, q.updated_at
FROM (VALUES
  ('yoon@company.com','개발','RECEIVED',NOW()-interval '1 hour',CAST(NULL AS timestamp),'로컬 개발 환경 세팅이 궁금합니다','신규 입사자인데 백엔드/프론트 로컬 실행 방법을 알고 싶습니다.'),
  ('yoon@company.com','네트워크','IN_PROGRESS',NOW()-interval '5 hours',NOW()-interval '2 hours','사내 VPN 접속이 안 됩니다','재택 중인데 VPN 클라이언트에서 인증 오류가 납니다.'),
  ('yoon@company.com','보안','ANSWERED',NOW()-interval '2 days',NOW()-interval '1 day','비밀번호 변경 주기 정책이 어떻게 되나요','보안 정책상 비밀번호를 얼마마다 바꿔야 하는지 궁금합니다.'),
  ('kim@company.com','개발','ANSWERED',NOW()-interval '3 days',NOW()-interval '2 days','Git 브랜치 전략이 궁금합니다','팀에서 사용하는 브랜치 네이밍과 머지 전략을 알려주세요.'),
  ('yoon@company.com','공통','ON_HOLD',NOW()-interval '4 days',CAST(NULL AS timestamp),'재택근무 신청 절차 문의','재택근무를 하려면 어떤 절차를 밟아야 하나요?'),
  ('park@company.com','개발','RECEIVED',NOW()-interval '3 hours',CAST(NULL AS timestamp),'사내 위키는 어디서 보나요','박신입입니다. 개발 관련 문서를 어디서 찾는지 궁금합니다.'),
  ('park@company.com','인프라','IN_PROGRESS',NOW()-interval '6 hours',CAST(NULL AS timestamp),'노트북 사양 업그레이드 문의','빌드가 너무 느린데 장비 교체 신청이 가능한가요?'),
  ('kim@company.com','보안','RECEIVED',NOW()-interval '30 minutes',CAST(NULL AS timestamp),'비밀번호 변경 주기 어떻게 되나요','비밀번호를 얼마마다 바꿔야 하는지 궁금합니다.')
) AS q(writer_email,category_name,status,created_at,updated_at,title,content)
JOIN users u ON u.email = q.writer_email
JOIN question_categories c ON c.name = q.category_name;

INSERT INTO answers (question_id, admin_id, content, created_at, updated_at)
SELECT q.id, a.id, ans.content, ans.created_at, CAST(NULL AS timestamp)
FROM (VALUES
  ('비밀번호 변경 주기 정책이 어떻게 되나요','admin@company.com',NOW()-interval '1 day','비밀번호는 90일마다 변경하도록 정책이 설정되어 있으며, 최근 3회 사용한 비밀번호는 재사용할 수 없습니다.'),
  ('Git 브랜치 전략이 궁금합니다','admin@company.com',NOW()-interval '2 days','develop 기준 feat/<도메인>/<이슈> 브랜치를 파서 작업 후 PR로 머지합니다.')
) AS ans(question_title,admin_email,created_at,content)
JOIN questions q ON q.title = ans.question_title
JOIN users a ON a.email = ans.admin_email;

INSERT INTO notifications (user_id, question_id, message, type, is_read, created_at)
SELECT u.id, q.id, n.message, n.type, n.is_read, n.created_at
FROM (VALUES
  ('yoon@company.com','비밀번호 변경 주기 정책이 어떻게 되나요','ANSWER_REGISTERED',false,NOW()-interval '1 day','문의하신 질문에 답변이 등록되었습니다: 비밀번호 변경 주기 정책'),
  ('kim@company.com','Git 브랜치 전략이 궁금합니다','ANSWER_REGISTERED',false,NOW()-interval '2 days','문의하신 질문에 답변이 등록되었습니다: Git 브랜치 전략'),
  ('yoon@company.com','사내 VPN 접속이 안 됩니다','STATUS_CHANGED',true,NOW()-interval '2 hours','문의하신 질문의 상태가 처리중으로 변경되었습니다: 사내 VPN 접속')
) AS n(user_email,question_title,type,is_read,created_at,message)
JOIN users u ON u.email = n.user_email
JOIN questions q ON q.title = n.question_title;

INSERT INTO faqs (category_id, question, answer, is_public, status, created_at, updated_at)
SELECT c.id, f.question, f.answer, true, 'ACTIVE', f.created_at, NOW()
FROM (VALUES
  ('보안',NOW()-interval '1 day','비밀번호 변경 주기 정책이 어떻게 되나요','비밀번호는 90일마다 변경하며, 최근 3회 사용한 비밀번호는 재사용할 수 없습니다.'),
  ('개발',NOW()-interval '2 days','Git 브랜치 전략이 궁금합니다','develop 기준 feat/<도메인>/<이슈> 브랜치로 작업 후 PR로 머지합니다.'),
  ('네트워크',NOW()-interval '3 days','VPN 접속이 안 될 때는 어떻게 하나요','VPN 클라이언트 재설치 → 계정 재인증 → 그래도 안 되면 인프라팀에 문의하세요.')
) AS f(category_name,created_at,question,answer)
JOIN categories c ON c.category_name = f.category_name;

COMMIT;
