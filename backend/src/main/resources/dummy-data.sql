-- DOC 모듈 더미 데이터 (EC2 PostgreSQL)
-- 실행: psql -h <DB_HOST> -U rookie -d rookie_playbook -f dummy-data.sql
-- ⚠️ 실행 순서: 이 DOC 스크립트를 먼저 실행한 뒤 QNA 더미(qna-dummy-data.sql)를 실행한다.
--    QNA의 faqs INSERT가 여기서 만든 categories(공통/개발/인프라/보안/네트워크)를 JOIN하기 때문.

-- 기존 데이터 삭제 (재실행 대비)
-- faqs 는 QNA 블록이 채우지만 categories 를 FK 참조하므로, categories 삭제 전에 먼저 비운다.
DELETE FROM faqs;
DELETE FROM document_tags;
DELETE FROM documents;
DELETE FROM tags;
DELETE FROM categories;

-- ============================================================
-- 1. 카테고리 (categories) - 테이블 정의서 기준
-- ============================================================
INSERT INTO categories (category_name, description, is_public, status, created_at) VALUES
('공통', '전 부서 공통 공지 및 필수 문서', true, 'ACTIVE', NOW()),
('개발', '개발 관련 지식 문서', true, 'ACTIVE', NOW()),
('인프라', '서버·클라우드·배포 관련 문서', true, 'ACTIVE', NOW()),
('보안', '보안 정책·접근 권한 관련 문서', true, 'ACTIVE', NOW()),
('네트워크', '네트워크 구성·장애 대응 관련 문서', true, 'ACTIVE', NOW());

-- ============================================================
-- 2. 태그 (tags)
-- ============================================================
INSERT INTO tags (tag_name, status, created_at) VALUES
('Git',      'ACTIVE', NOW()),
('PR',       'ACTIVE', NOW()),
('Java',     'ACTIVE', NOW()),
('Spring',   'ACTIVE', NOW()),
('Docker',   'ACTIVE', NOW()),
('AWS',      'ACTIVE', NOW()),
('Linux',    'ACTIVE', NOW()),
('MySQL',    'ACTIVE', NOW()),
('보안',     'ACTIVE', NOW()),
('네트워크', 'ACTIVE', NOW()),
('VPN',      'ACTIVE', NOW()),
('온보딩',   'ACTIVE', NOW()),
('코드리뷰', 'ACTIVE', NOW()),
('CI/CD',    'ACTIVE', NOW()),
('운영',     'ACTIVE', NOW());

-- ============================================================
-- 3. 문서 (documents)
-- category_name: 공통 / 개발 / 인프라 / 보안 / 네트워크
-- ============================================================
INSERT INTO documents (category_id, title, content, is_public, status, view_count, created_at)
SELECT c.id, d.title, d.content, d.is_public, 'ACTIVE', d.view_count, d.created_at
FROM (VALUES
  -- (category_name, is_public, view_count, created_at, title, content)
  ('공통', true, 152, NOW() - interval '40 days', '신입사원 온보딩 안내',
   '입사를 환영합니다! 아래 내용을 꼭 확인해 주세요.
1. 사원증 수령: 총무팀 방문 (1층 안내데스크)
2. 노트북 및 장비 세팅: IT팀 내선 1234
3. 사내 메신저(Slack) 가입 후 #공지채널 참여
4. 첫 주 일정: 팀장 면담 → 부서 OJT → 업무 배정'),
  ('공통', true, 98, NOW() - interval '35 days', '사내 복지 및 제도 안내',
   '임직원을 위한 복지 제도를 안내합니다.
- 점심 식대 지원: 1일 1만원 (법인카드 사용)
- 유연근무제: 코어타임 10:00~16:00 준수
- 연차: 입사 1년 미만 월 1일 발생
- 경조사 지원: 총무팀 신청서 제출
- 교육비 지원: 연 50만원 한도 (팀장 승인 후 신청)'),
  ('공통', true, 74, NOW() - interval '30 days', '사내 커뮤니케이션 채널 안내',
   '팀 간 원활한 소통을 위한 채널 안내입니다.
- 공식 메신저: Slack (#전체공지, #개발팀, #인프라팀 등)
- 이메일: 외부 커뮤니케이션 및 공식 문서 전달
- 화상회의: Google Meet (캘린더 초대 링크 사용)
- 이슈 트래킹: GitHub Issues
- 긴급 공지: 문자 또는 전화'),
  ('개발', true, 210, NOW() - interval '28 days', '개발 환경 세팅 가이드',
   '신입 개발자를 위한 로컬 개발 환경 세팅 가이드입니다.
1. Node.js LTS 버전 설치 후 node -v로 확인
2. Git 초기 설정 (이름, 이메일, SSH 키 등록)
3. 프로젝트 클론 후 .env 파일 설정
4. npm install 실행 후 로컬 서버 구동'),
  ('개발', true, 187, NOW() - interval '25 days', 'Git 브랜치 전략 및 PR 작성 규칙',
   '팀 협업을 위한 Git 브랜치 전략과 PR 규칙입니다.
- 브랜치명: feat/fe/기능명, feat/be/기능명 형식 사용
- 커밋 메시지: feat, fix, chore, refactor 등 prefix 사용
- PR 작성 시 관련 이슈 번호 반드시 연결
- 최소 1명 이상 코드 리뷰 승인 후 머지'),
  ('개발', true, 143, NOW() - interval '22 days', '코드 리뷰 가이드',
   '효율적인 코드 리뷰를 위한 가이드입니다.
- 리뷰어: 로직 오류, 성능, 가독성 중심으로 리뷰
- 작성자: 리뷰 코멘트에 24시간 내 응답
- Nit(사소한 개선)은 별도 표시
- 승인 전 모든 Requested Changes 해결 필수'),
  ('인프라', true, 121, NOW() - interval '20 days', '서버 접속 및 SSH 키 등록',
   '사내 서버 접속을 위한 SSH 키 등록 방법입니다.
1. ssh-keygen -t rsa -b 4096 으로 키 생성
2. ~/.ssh/id_rsa.pub 내용을 인프라팀에 전달
3. 등록 완료 후 ssh [사용자명]@[서버IP] 로 접속
4. 접속 문제 발생 시 인프라팀 내선 5678 연락'),
  ('인프라', true, 165, NOW() - interval '18 days', '배포 체크리스트',
   '운영 서버 배포 전 확인해야 할 체크리스트입니다.
- 로컬 및 개발 서버에서 정상 동작 확인
- 환경변수 설정 확인 (.env.production)
- DB 마이그레이션 스크립트 검토
- 배포 후 헬스체크 API 응답 확인
- 롤백 계획 수립'),
  ('인프라', true, 89, NOW() - interval '15 days', '로그 확인 및 장애 대응',
   '서버 로그 확인 방법과 장애 대응 절차입니다.
- 로그 위치: /var/log/app/application.log
- 실시간 로그: tail -f /var/log/app/application.log
- 에러 레벨: ERROR 로그 발생 시 즉시 팀 공유
- 장애 발생: 인프라팀 긴급 연락 후 장애 보고서 작성'),
  ('보안', true, 134, NOW() - interval '12 days', '보안 정책 및 개인정보 보호',
   '임직원이 반드시 숙지해야 할 보안 정책입니다.
- 고객 개인정보 외부 유출 절대 금지
- 업무용 PC 이외 기기에서 고객 데이터 접근 금지
- 퇴근 시 PC 잠금 및 민감 문서 잠금 보관
- 개인정보 처리 관련 문의: 보안팀 내선 9000'),
  ('보안', true, 76, NOW() - interval '10 days', '보안 사고 신고 절차',
   '보안 사고 발생 시 즉시 아래 절차를 따르세요.
1. 즉시 보안팀 연락 (내선 9999 / 24시간 핫라인)
2. 관련 시스템 접근 즉시 중단
3. 상황 보고서 작성 (발생 시각, 범위, 경위)
4. 보안팀 조사에 적극 협조'),
  ('보안', true, 112, NOW() - interval '8 days', '계정 보안 및 비밀번호 정책',
   '안전한 계정 관리를 위한 보안 정책입니다.
- 비밀번호: 영문+숫자+특수문자 조합 8자 이상
- 비밀번호 90일마다 변경 필수
- 계정 공유 절대 금지
- 2차 인증(MFA) 설정 권장
- 퇴사자 계정 즉시 비활성화 요청'),
  ('네트워크', true, 198, NOW() - interval '6 days', 'VPN 접속 방법 및 오류 해결',
   '재택근무 시 VPN 접속 방법과 주요 오류 해결 가이드입니다.
1. GlobalProtect 앱 설치 (사내 포털에서 다운로드)
2. 서버 주소 입력: vpn.company.com
3. 사번과 사내 비밀번호로 로그인
[오류 해결]
- 인증 실패: 비밀번호 초기화 후 재시도
- 연결 불가: IT팀 내선 1234 문의'),
  ('네트워크', true, 87, NOW() - interval '4 days', '사내 Wi-Fi 및 네트워크 접속',
   '사내 네트워크 접속 방법 안내입니다.
- 사내 Wi-Fi: SSID "Company_Office" (5GHz 권장)
- 비밀번호: IT팀에 문의
- 유선 연결: 자리 배치도 확인 후 LAN 케이블 연결
- 외부 공유기/핫스팟 사내 사용 금지'),
  ('네트워크', true, 63, NOW() - interval '2 days', '방화벽 정책 및 포트 개방 요청',
   '서버 방화벽 정책과 포트 개방 요청 절차입니다.
- 기본 허용 포트: 80(HTTP), 443(HTTPS), 22(SSH)
- 추가 포트 개방 필요 시: 인프라팀에 요청서 제출
- 요청 항목: 대상 서버, 포트, 프로토콜, 사유
- 처리 기간: 영업일 기준 2일 이내')
) AS d(category_name, is_public, view_count, created_at, title, content)
JOIN categories c ON c.category_name = d.category_name;

-- ============================================================
-- 4. 문서-태그 연결 (document_tags)
-- 문서 제목 + 태그명으로 JOIN (하드코딩 ID 대신 이름 매핑 → INSERT 순서/ID에 무관)
-- ============================================================
INSERT INTO document_tags (document_id, tag_id, created_at)
SELECT d.id, t.id, NOW()
FROM (VALUES
  -- (문서 제목, 태그명)
  ('신입사원 온보딩 안내',            '온보딩'),
  ('사내 복지 및 제도 안내',          '운영'),
  ('사내 커뮤니케이션 채널 안내',      '온보딩'),
  ('개발 환경 세팅 가이드',           'Git'),
  ('개발 환경 세팅 가이드',           '온보딩'),
  ('Git 브랜치 전략 및 PR 작성 규칙',  'Git'),
  ('Git 브랜치 전략 및 PR 작성 규칙',  'PR'),
  ('Git 브랜치 전략 및 PR 작성 규칙',  '코드리뷰'),
  ('코드 리뷰 가이드',                '코드리뷰'),
  ('코드 리뷰 가이드',                'PR'),
  ('서버 접속 및 SSH 키 등록',        'Linux'),
  ('서버 접속 및 SSH 키 등록',        '운영'),
  ('배포 체크리스트',                 'CI/CD'),
  ('배포 체크리스트',                 'Docker'),
  ('배포 체크리스트',                 '운영'),
  ('로그 확인 및 장애 대응',          'Linux'),
  ('로그 확인 및 장애 대응',          '운영'),
  ('보안 정책 및 개인정보 보호',       '보안'),
  ('보안 사고 신고 절차',             '보안'),
  ('계정 보안 및 비밀번호 정책',       '보안'),
  ('VPN 접속 방법 및 오류 해결',      'VPN'),
  ('VPN 접속 방법 및 오류 해결',      '네트워크'),
  ('사내 Wi-Fi 및 네트워크 접속',     '네트워크'),
  ('방화벽 정책 및 포트 개방 요청',    '네트워크'),
  ('방화벽 정책 및 포트 개방 요청',    '보안')
) AS m(doc_title, tag_name)
JOIN documents d ON d.title = m.doc_title
JOIN tags t ON t.tag_name = m.tag_name;
