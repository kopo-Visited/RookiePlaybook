-- DOC 모듈 더미 데이터 (EC2 PostgreSQL)
-- 실행: psql -h <DB_HOST> -U rookie -d rookie_playbook -f dummy-data.sql

-- 카테고리 (categories)
INSERT INTO categories (category_name, description, is_public, status, created_at) VALUES
('인사/총무', '인사, 채용, 급여, 복리후생 관련 문서', true, 'ACTIVE', NOW()),
('IT/시스템', '사내 IT 환경, 시스템 계정, 개발 도구 관련 문서', true, 'ACTIVE', NOW()),
('복리후생', '식대, 교통비, 동호회, 건강검진 관련 문서', true, 'ACTIVE', NOW()),
('업무 프로세스', '결재, 출장, 보고서 작성 등 업무 절차 문서', true, 'ACTIVE', NOW()),
('보안/규정', '개인정보 보호, 보안 정책, 사고 신고 절차 문서', true, 'ACTIVE', NOW());

-- 문서 (documents) - category_id: 1~5
INSERT INTO documents (category_id, title, content, is_public, status, view_count, created_at) VALUES
(1, '입사 온보딩 절차 안내', '신입사원 온보딩은 총 3단계로 진행됩니다.
1단계: 인사팀 오리엔테이션 (첫째 날)
2단계: 부서 배치 및 팀장 면담 (2~3일차)
3단계: 업무 시스템 교육 및 멘토 배정 (1주차)', true, 'ACTIVE', 0, NOW()),
(1, '연차 및 휴가 신청 방법', '연차 신청은 사내 HR 시스템을 통해 진행합니다.
- 연차: 입사 1년 후 15일 부여
- 반차: 오전/오후 각각 신청 가능
- 신청 방법: HR 포털 → 근태관리 → 휴가신청', true, 'ACTIVE', 0, NOW()),
(1, '급여 지급일 및 명세서 확인', '급여는 매월 25일 지급됩니다.
명세서는 HR 포털에서 확인 가능합니다.
문의: 인사팀 내선 1234', true, 'ACTIVE', 0, NOW()),
(2, '사내 Wi-Fi 및 VPN 접속 방법', '사내 Wi-Fi: SSID "Company_Internal", 비밀번호는 IT팀에 문의
VPN 접속: GlobalProtect 앱 설치 후 사번과 비밀번호로 로그인
원격근무 시 반드시 VPN 연결 후 업무 진행', true, 'ACTIVE', 0, NOW()),
(2, '사내 메신저 및 협업 툴 안내', '사내 협업 툴 목록:
- 메신저: Slack (팀별 채널 운영)
- 문서 협업: Google Workspace
- 프로젝트 관리: Jira
계정 발급은 IT팀에 요청하세요.', true, 'ACTIVE', 0, NOW()),
(2, '노트북 환경 세팅 가이드', '1. 회사 지급 노트북 초기 설정
2. 보안 솔루션 설치 (백신, DLP)
3. 사내 시스템 계정 등록
4. 개발 환경 설정 (IDE, Git 등)
자세한 내용은 IT팀 포털 참고', true, 'ACTIVE', 0, NOW()),
(3, '식대 및 복리후생 안내', '복리후생 항목:
- 식대: 월 10만원 지원 (복지카드)
- 교통비: 실비 지원
- 건강검진: 연 1회
- 자기계발비: 연 50만원
복지카드 신청은 총무팀에 문의하세요.', true, 'ACTIVE', 0, NOW()),
(3, '사내 동호회 및 문화 활동', '현재 운영 중인 동호회:
- 독서모임 (매주 목요일)
- 풋살팀 (매주 토요일)
- 사진 동호회 (월 1회)
가입 문의: 총무팀 내선 2345', true, 'ACTIVE', 0, NOW()),
(4, '결재 및 품의서 작성 방법', '결재 프로세스:
1. 전자결재 시스템 접속
2. 양식 선택 후 작성
3. 결재라인 지정 (팀장 → 부서장 → 임원)
긴급 결재 시 팀장에게 직접 연락', true, 'ACTIVE', 0, NOW()),
(4, '출장 신청 및 경비 처리 절차', '출장 신청:
1. 출장계획서 작성 (전자결재)
2. 팀장 승인 후 출장
3. 귀사 후 3일 이내 경비 정산
항공권/숙박은 총무팀 통해 예약 가능', true, 'ACTIVE', 0, NOW()),
(5, '개인정보 보호 정책', '임직원 개인정보 보호 의무:
- 고객 정보 외부 유출 금지
- 업무용 PC에서만 고객 데이터 접근
- 퇴근 시 PC 잠금 필수
위반 시 징계 처리', true, 'ACTIVE', 0, NOW()),
(5, '보안 사고 신고 절차', '보안 사고 발생 시:
1. 즉시 IT 보안팀 연락 (내선 9999)
2. 관련 시스템 접근 중단
3. 상황 보고서 작성
4. 보안팀 조사 협조
24시간 신고 핫라인: 1588-0000', true, 'ACTIVE', 0, NOW());
