# 프론트엔드 개발 가이드 (React)

## 폴더 구조

도메인이 확정되어 도메인 기준 구조로 작성한다.

### 확정 구조: 도메인 기준

```
src/
├── assets/
│   ├── images/
│   └── fonts/
├── components/                     # 공통 컴포넌트 (재사용)
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.module.css
│   ├── Spinner/
│   │   ├── Spinner.jsx
│   │   └── Spinner.module.css
│   ├── ErrorMessage/
│   │   ├── ErrorMessage.jsx
│   │   └── ErrorMessage.module.css
│   └── EmptyState/
│       ├── EmptyState.jsx
│       └── EmptyState.module.css
├── pages/
│   ├── auth/                       # AUTH 모듈
│   │   └── LoginPage/
│   │       ├── LoginPage.jsx
│   │       └── LoginPage.module.css
│   ├── doc/                        # DOC 모듈
│   │   └── ...
│   ├── qna/                        # QNA 모듈
│   │   └── ...
│   ├── edu/                        # EDU 모듈 (일반 사용자)
│   │   ├── EducationListPage/          # EDU-VIEW-001 교육 과정 목록
│   │   │   ├── EducationListPage.jsx
│   │   │   └── EducationListPage.module.css
│   │   ├── EducationDetailPage/        # EDU-VIEW-002 교육 과정 상세
│   │   │   ├── EducationDetailPage.jsx
│   │   │   └── EducationDetailPage.module.css
│   │   ├── VideoPlayerPage/            # EDU-VIEW-003 교육 영상 시청
│   │   │   ├── VideoPlayerPage.jsx
│   │   │   └── VideoPlayerPage.module.css
│   │   └── MyProgressPage/             # EDU-VIEW-004 내 학습 현황
│   │       ├── MyProgressPage.jsx
│   │       └── MyProgressPage.module.css
│   └── admin/                      # 관리자 백오피스
│       └── edu/                    # EDU 모듈 관리자
│           ├── AdminEducationPage/     # EDU-VIEW-005 교육 과정 등록/수정
│           │   ├── AdminEducationPage.jsx
│           │   └── AdminEducationPage.module.css
│           ├── AdminStagePage/         # EDU-VIEW-006 교육 단계 관리
│           │   ├── AdminStagePage.jsx
│           │   └── AdminStagePage.module.css
│           ├── AdminProgressPage/      # EDU-VIEW-007 신입사원별 진도율 조회
│           │   ├── AdminProgressPage.jsx
│           │   └── AdminProgressPage.module.css
│           └── AdminIncompletePage/    # EDU-VIEW-008 미수료자 조회
│               ├── AdminIncompletePage.jsx
│               └── AdminIncompletePage.module.css
├── hooks/
│   ├── useFetch.js                 # 범용 API 조회 훅 (재활용)
│   └── edu/
│       └── useVideoProgress.js     # 영상 30초마다 진도 저장 (복잡한 로직)
├── api/
│   ├── axiosInstance.js            # axios 인스턴스 (공통 설정)
│   ├── authApi.js                  # AUTH 모듈 API
│   ├── docApi.js                   # DOC 모듈 API
│   ├── qnaApi.js                   # QNA 모듈 API
│   └── eduApi.js                   # EDU 모듈 API
│       # getEducations, getEducationDetail, getMaterial
│       # saveVideoProgress, completeStage, getMyProgress
│       # createEducation, updateEducation, deleteEducation
│       # createStage, updateStage, deleteStage
│       # getAdminProgress, getIncomplete
├── stores/
│   └── authStore.js                # 로그인 사용자 정보, JWT 토큰
├── constants/
│   ├── routes.js                   # 라우팅 경로 상수
│   ├── styles.js                   # variant, size 등 스타일 상수
│   └── message.js                  # 에러/안내 메시지 상수
├── utils/
│   └── formatDate.js               # 날짜 포매팅
├── styles/
│   ├── global.css                  # 전역 스타일 + CSS 변수 정의
│   └── common.module.css           # 공통 레이아웃 패턴 (composes로 재활용)
├── __tests__/
│   ├── components/
│   │   └── Button.test.jsx
│   ├── hooks/
│   │   └── useVideoProgress.test.js
│   ├── pages/
│   │   ├── rendering/
│   │   │   ├── EducationListPage.test.jsx
│   │   │   ├── EducationDetailPage.test.jsx
│   │   │   └── MyProgressPage.test.jsx
│   │   └── integration/
│   │       ├── EducationListPage.test.jsx
│   │       └── EducationDetailPage.test.jsx
│   └── utils/
│       └── formatDate.test.js
├── App.jsx
└── main.jsx
```

- **`pages/`**: 기능정의서의 기능 단위로 폴더를 만든다. 페이지명 매핑 표는 기능정의서 확정 후 이 문서에 작성 예정 (팀원마다 번역이 달라지는 것 방지)
- **`hooks/`**: 범용 훅을 기본으로 쓰고, 복잡한 로직이 필요할 때만 기능별 훅을 추가한다
  - **`useFetch.js`** (범용) — API 호출 + 로딩/에러 상태 관리를 하나로 추상화. 단순 조회는 이걸 재활용
  - **`use{기능명}.js`** (기능별) — 디바운싱, 페이지네이션, 여러 API 조합 등 복잡한 로직이 필요한 경우에만 추가

  ```js
  // hooks/useFetch.js — 범용 훅
  const useFetch = (fetchFn, deps = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      setLoading(true);
      fetchFn()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }, deps);

    return { data, loading, error };
  };

  // 사용 예시 — 기능마다 훅 새로 만들 필요 없음
  const { data: document, loading } = useFetch(() => getDocument(id), [id]);
  const { data: onboardings } = useFetch(() => getOnboardings());
  ```
- **`api/`**: 백엔드 도메인 단위로 파일을 만든다 (예: `documentApi.js`, `authApi.js`)
- **`constants/`**: 역할/기능 단위로 파일을 나눈다. `index.js` 하나에 몰아넣지 않는다

  | 파일 | 담는 상수 |
  |------|----------|
  | `routes.js` | 라우팅 경로 (`/documents`, `/admin` 등) |
  | `message.js` | 에러/안내 메시지 문자열 |
  | `api.js` | API BASE_URL, 타임아웃 등 |

- **`utils/`**: 기능 단위로 파일을 나눈다. `index.js` 하나에 몰아넣지 않는다

  | 파일 | 담는 함수 |
  |------|----------|
  | `formatDate.js` | 날짜 포매팅 함수 |
  | `formatPrice.js` | 가격 포매팅 함수 |
  | `validator.js` | 유효성 검사 함수 |

## 네이밍 규칙

| 대상 | 형식 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `DocumentCard.jsx` |
| 페이지 파일 | PascalCase + Page | `DocumentListPage.jsx` |
| 훅 파일 | camelCase + `use` prefix | `useDocumentSearch.js` |
| API 파일 | camelCase + `Api` suffix | `documentApi.js` |
| 스토어 파일 | camelCase + `Store` suffix | `authStore.js` |
| 스토어 훅 | camelCase + `use` prefix + `Store` suffix | `useAuthStore` |
| 유틸 함수 파일 | camelCase | `formatDate.js` |
| CSS 모듈 | 컴포넌트명과 동일 | `DocumentCard.module.css` |
| 상수 | UPPER_SNAKE_CASE | `MAX_SEARCH_RESULTS` |

## 컴포넌트 규칙

- 함수형 컴포넌트만 사용 (클래스형 금지), **`function` 선언식**으로 작성
- 컴포넌트 하나당 파일 하나
- props는 구조 분해 할당으로 받는다
- **버튼, 인풋, 모달 같은 공통 UI는 `components/`에 만들고 최대한 재활용한다** — 같은 UI를 여러 곳에서 새로 만들지 않는다
- **스타일 변경이 필요하면 컴포넌트를 새로 만들지 말고 props로 변형한다**
- **variant, size 같은 스타일 값은 `constants/styles.js`에 상수로 정의한다** — 문자열 오타 방지, 변경 시 한 곳만 수정

```js
// constants/styles.js
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
};

export const BUTTON_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};
```

```jsx
// components/Button/Button.jsx
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../constants/styles';

function Button({
  children,
  variant = BUTTON_VARIANTS.PRIMARY,
  size = BUTTON_SIZES.MEDIUM,
  onClick,
  disabled,
}) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// 사용 예시
<Button variant={BUTTON_VARIANTS.PRIMARY}>저장</Button>
<Button variant={BUTTON_VARIANTS.SECONDARY}>취소</Button>
<Button variant={BUTTON_VARIANTS.DANGER} size={BUTTON_SIZES.SMALL}>삭제</Button>

// ❌ 나쁜 예 — 문자열 직접 사용 (오타 발생 가능)
<Button variant="priamry">저장</Button>

// ❌ 나쁜 예 — 스타일만 다른 컴포넌트를 따로 만들기
function PrimaryButton({ children }) { ... }
function SecondaryButton({ children }) { ... }
```

```jsx
// ✅ props 구조 분해 할당
function DocumentCard({ title, category, updatedAt }) {
  return (
    <div className={styles.card}>
      <span className={styles.category}>{category}</span>
      <h3>{title}</h3>
      <p>{updatedAt}</p>
    </div>
  );
}

// ❌ props를 구조 분해 없이 받는 나쁜 예
function DocumentCard(props) {
  return <div>{props.title}</div>;
}
```

## 훅 규칙

- 커스텀 훅은 `use` prefix 필수
- **훅은 컴포넌트 또는 커스텀 훅 안에서만 호출한다** — 일반 함수 안에서 `useState`, `useEffect` 등 호출 금지
- **훅은 조건문, 반복문, 중첩 함수 안에서 호출하지 않는다** — React가 훅을 호출 순서로 추적하기 때문에 조건에 따라 실행 순서가 달라지면 버그 발생

```jsx
// ❌ 조건문 안에서 훅 호출 — 금지
function DocumentPage({ isLoggedIn }) {
  if (isLoggedIn) {
    const [data, setData] = useState(null);  // 금지
  }
}

// ✅ 최상위에서 호출 후 조건 처리
function DocumentPage({ isLoggedIn }) {
  const [data, setData] = useState(null);  // 항상 같은 순서로 실행

  if (isLoggedIn) {
    // 훅이 아닌 일반 로직은 조건문 안에서 써도 됨
  }
}
```

- **단순 API 조회는 `useFetch` 재활용, 복잡한 로직만 기능별 훅으로 분리**
- 컴포넌트에서 API 직접 호출 금지 — 반드시 훅을 통해 호출

```jsx
// ✅ 단순 조회 — useFetch 재활용
const DocumentDetailPage = ({ id }) => {
  const { data: document, loading, error } = useFetch(
    () => getDocument(id), [id]
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage />;
  return <DocumentDetail document={document} />;
};

// ✅ 복잡한 로직 — 기능별 훅으로 분리
// 디바운싱(Debouncing): 연이어 발생하는 이벤트들 중 마지막 이벤트만 실행되도록 처리해
// 불필요한 함수 호출이나 중복 동작을 방지하는 최적화 기술.
// 예: 검색어를 입력할 때마다 API를 호출하면 "온보딩"을 입력하는 동안
// "온", "온보", "온보딩" 세 번의 API 호출이 발생하는데,
// 디바운싱을 적용하면 입력이 멈춘 후 300ms 뒤에 한 번만 호출됨.
const useDocumentSearch = (keyword) => {
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, loading } = useFetch(
    () => searchDocuments(debouncedKeyword), [debouncedKeyword]
  );

  return { documents: data, loading };
};

// ❌ 나쁜 예 — 컴포넌트에서 API 직접 호출
const DocumentPage = () => {
  useEffect(() => {
    axios.get('/api/documents').then(...);  // 컴포넌트에서 직접 호출 금지
  }, []);
};
```

## API 호출 규칙

- API 호출 함수는 `api/` 폴더에 도메인별로 분리
- 컴포넌트에서 직접 fetch/axios 호출 금지 — 반드시 `api/` 함수를 통해 호출
- **axios 라이브러리를 사용하여 API를 호출한다**

### 패키지 설치

```bash
npm install axios
```

### axios 인스턴스 설정

`api/` 폴더에 axios 인스턴스를 공통으로 만들어두고 도메인별 파일에서 재활용한다. 인스턴스를 쓰면 BASE_URL, 타임아웃, 공통 헤더(JWT 토큰 등)를 한 곳에서 관리할 수 있어서 각 API 파일마다 중복 설정할 필요가 없다.

```js
// api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // 환경변수로 BASE_URL 관리
  timeout: 10000,                               // 10초 타임아웃
});

// 요청 인터셉터 — 모든 요청에 JWT 토큰 자동 첨부
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 — 공통 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response.data,   // 성공: data만 반환 (ApiResponse<T> 구조)
  (error) => {
    if (error.response?.status === 401) {
      // 인증 만료 시 로그아웃 처리
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 도메인별 API 파일

```js
// api/documentApi.js
import axiosInstance from './axiosInstance';

export const getDocument = (id) =>
  axiosInstance.get(`/api/documents/${id}`);

export const getDocuments = (page = 0, size = 10) =>
  axiosInstance.get('/api/documents', { params: { page, size } });

export const searchDocuments = (keyword) =>
  axiosInstance.get('/api/documents/search', { params: { q: keyword } });

export const createDocument = (data) =>
  axiosInstance.post('/api/documents', data);

export const updateDocument = (id, data) =>
  axiosInstance.put(`/api/documents/${id}`, data);

export const deleteDocument = (id) =>
  axiosInstance.delete(`/api/documents/${id}`);
```

### 환경변수 설정

→ [환경 분리](#환경-분리) 섹션 참조. `VITE_API_BASE_URL` 로 BASE_URL을 관리한다.

## 전역 상태관리 (Zustand)

전역 상태는 **Zustand**로 관리한다. 여러 컴포넌트가 공유해야 하는 데이터만 전역 상태로 관리하고, 특정 페이지/컴포넌트에서만 쓰는 데이터는 `useState` 또는 커스텀 훅으로 관리한다.

### 패키지 설치

```bash
npm install zustand
```

### 전역 상태로 관리하는 것 vs 아닌 것

| 전역 상태 (stores/) | 로컬 상태 (useState / 훅) |
|---------------------|--------------------------|
| 로그인한 사용자 정보 | 특정 페이지의 검색 결과 |
| JWT 토큰 | 폼 입력값 |
| 사용자 권한 (ROLE_USER / ROLE_ADMIN) | 모달 열림/닫힘 여부 |

### 폴더 구조

```
stores/
└── authStore.js    # 인증 관련 전역 상태 (사용자 정보, 토큰, 권한)
```

### authStore.js 예시

```js
// stores/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // 상태
  user: null,       // { id, name, role }
  token: null,      // JWT 토큰

  // 액션
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

export default useAuthStore;
```

### 컴포넌트에서 사용 예시

```jsx
// 사용자 이름 표시
function Header() {
  const user = useAuthStore((state) => state.user);

  return <div>{user?.name}님 환영합니다</div>;
}

// 관리자 여부 확인
function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <nav>
      <Link to="/documents">문서</Link>
      {isAdmin && <Link to="/admin">관리자</Link>}
    </nav>
  );
}

// 로그아웃
function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  return <button onClick={logout}>로그아웃</button>;
}
```

> **Zustand 구독 최적화**: `useAuthStore((state) => state.user)` 처럼 필요한 상태만 선택해서 구독한다. `useAuthStore()` 로 전체를 구독하면 관련 없는 상태가 바뀌어도 리렌더링이 발생한다.

## ESLint + Prettier 설정

### ESLint와 Prettier의 역할

| 도구 | 역할 | 예시 |
|------|------|------|
| **ESLint** | 코드 품질 검사 (논리적 문제) | 미사용 변수, 잘못된 훅 사용, `console.log` |
| **Prettier** | 코드 스타일 포매팅 (외형) | 들여쓰기, 따옴표, 세미콜론, 줄바꿈 |

둘을 같이 쓰면 규칙이 충돌할 수 있어서 추가 플러그인으로 충돌을 방지해야 한다:
- `eslint-config-prettier` — ESLint에서 Prettier와 중복되는 규칙을 꺼줌
- `eslint-plugin-prettier` — Prettier 규칙 위반을 ESLint 에러로 표시

### VS Code 익스텐션 설치

에디터에서 실시간으로 오류를 확인하려면 두 익스텐션을 설치한다:
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)

### 패키지 설치

```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks
```

### `.eslintrc.js` 설정

```js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',  // prettier 규칙을 ESLint 에러로 처리 (맨 마지막에 위치)
  ],
  rules: {
    'no-unused-vars': 'error',          // 미사용 변수 금지
    'no-console': 'warn',               // console.log 경고
    'react/react-in-jsx-scope': 'off',  // React 17+ 에서는 import React 불필요
    'react-hooks/rules-of-hooks': 'error',    // 훅 규칙 위반 시 에러
    'react-hooks/exhaustive-deps': 'warn',    // useEffect 의존성 배열 누락 경고
  },
};
```

### `.prettierrc` 설정

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

### `package.json` 스크립트 추가

```json
"scripts": {
  "lint": "eslint src",
  "lint:fix": "eslint src --fix",
  "format": "prettier --write src"
}
```

- `npm run lint` — ESLint 검사
- `npm run lint:fix` — ESLint 자동 수정
- `npm run format` — Prettier 포매팅 일괄 적용

> **주의**: `.prettierrc` 파일이 프로젝트 루트에 있으면 VS Code 익스텐션 설정보다 프로젝트 설정이 우선 적용된다. 팀원 모두 같은 포매팅이 적용되도록 `.prettierrc`는 반드시 Git에 올린다.

## 스타일 규칙

- **CSS Modules 사용** (`*.module.css`) — 컴포넌트와 같은 폴더에 같은 이름으로 만든다
- 전역 스타일은 `styles/global.css` 에만 — 컴포넌트 파일에 전역 스타일 직접 작성 금지
- 인라인 스타일 금지 (`style={{ color: 'red' }}` 형태)
- 클래스명은 **camelCase** 사용 (`styles.cardTitle`, `styles.buttonPrimary`)
- variant, size 같은 스타일 값은 `constants/styles.js` 에 상수로 정의 (컴포넌트 규칙 참조)

```css
/* DocumentCard.module.css */
.card { ... }
.cardTitle { ... }       /* camelCase */
.cardCategory { ... }
```

```jsx
/* DocumentCard.jsx */
import styles from './DocumentCard.module.css';

function DocumentCard({ title, category }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardCategory}>{category}</span>
      <h3 className={styles.cardTitle}>{title}</h3>
    </div>
  );
}
```

### 똑같은 스타일을 여러 곳에서 쓰고 싶은 경우 다음과 같은 방법으로 진행한다

**방법 1: CSS 변수 — 색상, 크기, 간격 등 값 재활용**

`styles/global.css` 에 CSS 변수로 정의하면 어느 CSS 파일에서든 참조할 수 있다.

```css
/* styles/global.css */
:root {
  --color-primary: #3B82F6;
  --color-danger: #EF4444;
  --color-text: #1F2937;
  --border-radius: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}
```

```css
/* 어느 module.css 파일에서든 참조 가능 */
.button {
  background-color: var(--color-primary);
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-md);
}

.card {
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
}
```

**방법 2: `composes` — 클래스 자체를 재활용**

공통으로 쓰는 레이아웃 패턴을 `styles/common.module.css` 에 정의하고 `composes` 로 가져다 쓴다.

```css
/* styles/common.module.css */
.flexCenter {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
}
```

```css
/* components/Button/Button.module.css */
.button {
  composes: flexCenter from '../../styles/common.module.css';
  padding: 8px 16px;
  background-color: var(--color-primary);
}
```

> **언제 뭘 쓰나:**
> - 색상, 크기, 간격 같은 **값**을 통일하고 싶으면 → CSS 변수
> - `display: flex` 같은 **레이아웃 패턴**을 여러 곳에서 쓰고 싶으면 → `composes`

## 기타 규칙

- `console.log` 커밋 금지 (개발 중 사용 후 반드시 제거)
- 미사용 import 금지 (ESLint가 잡아줌)
- 컴포넌트 파일에 비즈니스 로직 직접 작성 금지 — 훅으로 분리
- **`dangerouslySetInnerHTML` 사용 금지** — XSS(크로스 사이트 스크립팅) 취약점 발생 가능. 외부 입력값을 HTML로 렌더링해야 하는 경우 반드시 `DOMPurify`로 sanitize 후 사용

  **패키지 설치:**
  ```bash
  npm install dompurify
  ```

  > **DOMPurify란?** 외부 입력값에 포함된 악성 스크립트(`<script>`, `onerror` 등)를 제거하고 안전한 HTML만 남겨주는 라이브러리. 예를 들어 사용자가 `<img src=x onerror=alert('XSS')>` 를 입력하면 DOMPurify가 `onerror` 속성을 제거해 스크립트 실행을 막아준다.

  ```jsx
  // ❌ 금지 — XSS 취약. 악성 스크립트가 그대로 실행됨
  <div dangerouslySetInnerHTML={{ __html: userInput }} />

  // ✅ DOMPurify로 sanitize 후 사용
  import DOMPurify from 'dompurify';

  function DocumentContent({ content }) {
    const sanitizedContent = DOMPurify.sanitize(content);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
  }
  ```

  - `dangerouslySetInnerHTML` 자체를 쓸 일이 없도록 설계하는 게 우선이고, 불가피하게 써야 할 때만 DOMPurify와 함께 사용한다

## 라우팅 규칙

React Router를 사용한다.

### 패키지 설치

```bash
npm install react-router-dom
```

### 라우팅 구조

라우팅은 `App.jsx` 에서 중앙 관리한다.

```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 인증 필요 라우트 */}
        <Route element={<PrivateRoute />}>
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* 관리자 전용 라우트 */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/documents" element={<AdminDocumentPage />} />
          <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
        </Route>

        {/* 기본 리다이렉트 */}
        <Route path="/" element={<Navigate to="/documents" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 권한 라우트 컴포넌트

로그인 여부, 관리자 여부에 따라 접근을 제한한다.

```jsx
// 로그인 필요 라우트 — 비로그인 시 /login으로 리다이렉트
function PrivateRoute() {
  const token = useAuthStore((state) => state.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// 관리자 전용 라우트 — 일반 사용자 접근 시 /documents로 리다이렉트
function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ROLE_ADMIN';
  return isAdmin ? <Outlet /> : <Navigate to="/documents" replace />;
}
```

### 라우팅 경로 상수

경로 문자열은 `constants/routes.js` 에 상수로 정의한다. 문자열 오타 방지 및 경로 변경 시 한 곳만 수정하면 된다.

```js
// constants/routes.js
export const ROUTES = {
  LOGIN: '/login',
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: (id) => `/documents/${id}`,
  ONBOARDING: '/onboarding',
  ADMIN: {
    DOCUMENTS: '/admin/documents',
    STATISTICS: '/admin/statistics',
  },
};

// 사용 예시
import { ROUTES } from '../../constants/routes';

<Link to={ROUTES.DOCUMENTS}>문서 목록</Link>
<Link to={ROUTES.DOCUMENT_DETAIL(document.id)}>상세 보기</Link>
navigate(ROUTES.LOGIN);
```

## 환경 분리

### 파일 구조

```
프로젝트 루트/
├── .env.local        # 로컬 개발 환경 (Git 업로드 금지 — .gitignore에 추가)
└── .env.production   # 운영 환경
```

### .env.local

```
VITE_API_BASE_URL=http://localhost:8080
```

### .env.production

```
VITE_API_BASE_URL=https://api.도메인.com   # 운영 도메인 확정 후 변경
```

> - Vite 프로젝트는 환경변수 prefix가 `VITE_` 여야 클라이언트에서 접근 가능하다
> - `.env.local` 은 반드시 `.gitignore` 에 추가한다 — **Git에 올라가면 안 됨**
> - `.env.production` 은 Git에 올려도 되지만 민감한 값(API 키 등)은 포함하지 않는다

## 에러 처리 규칙

API 실패, 로딩, 빈 데이터 세 가지 상태를 항상 처리한다.

```jsx
function DocumentListPage() {
  const { data: documents, loading, error } = useFetch(() => getDocuments());

  // 로딩 상태
  if (loading) return <Spinner />;

  // 에러 상태
  if (error) return <ErrorMessage message={error.message} />;

  // 빈 데이터 상태
  if (!documents || documents.length === 0) return <EmptyState message="등록된 문서가 없습니다." />;

  return <DocumentList documents={documents} />;
}
```

- **로딩 상태** — API 호출 중일 때. 스피너나 스켈레톤 UI 표시
- **에러 상태** — API 실패 시. 에러 메시지 표시 (서버 오류 메시지 그대로 노출 금지 — 사용자 친화적 메시지로 변환)
- **빈 데이터 상태** — API 성공했지만 데이터가 없을 때. "등록된 문서가 없습니다" 같은 안내 표시
- 세 가지 상태를 공통 컴포넌트(`Spinner`, `ErrorMessage`, `EmptyState`)로 만들어 재활용한다

## 커밋 전 로컬 체크

push 전에 로컬에서 먼저 확인해서 CI 실패를 줄인다:

```bash
# ESLint 검사
npm run lint

# Prettier 포매팅 확인
npm run format

# 테스트 실행
npm run test
```

## 테스트 규칙

### 테스트 전략

| 종류 | 도구 | 대상 | 작성 의무 | CI 강제 |
|------|------|------|----------|---------|
| 단위 테스트 | Jest | 유틸 함수, 커스텀 훅 | **필수** | 2단계부터 |
| 컴포넌트 테스트 | Jest + RTL | 개별 컴포넌트 렌더링, 사용자 인터랙션 | **필수** | 2단계부터 |
| 페이지 렌더링 테스트 | Jest + RTL | API 없이 페이지 기본 구조가 렌더링되는지 | **필수** | 2단계부터 |
| 통합 테스트 | Jest + RTL + MSW | 페이지 + API 연동, 실제 데이터가 화면에 뜨는지 | **필수** | 2단계부터 |

- **작성 의무**: 기능 구현과 함께 항상 작성해야 한다. CI 강제 시점과 무관
- **CI 강제**: 1단계에선 CI가 테스트 통과를 강제하지 않음. 2단계부터 테스트 미통과 시 merge 불가 ([cicd.md](./cicd.md) 참조)

### 도구 설명

> **Jest** — 테스트 러너. 테스트 파일을 실행하고 결과를 보여준다. `describe`, `it`, `expect` 같은 함수 제공
>
> **React Testing Library (RTL)** — 컴포넌트를 실제 브라우저처럼 렌더링하고 사용자 행위를 시뮬레이션한다. "구현이 아닌 사용자 관점으로 테스트"가 핵심 철학. `render`, `screen`, `userEvent` 제공
>
> **MSW (Mock Service Worker)** — 실제 네트워크 요청을 가로채서 가짜 응답을 반환한다. 백엔드 없이 API 연동 테스트 가능. Mockito의 프론트엔드 버전

### 패키지 설치

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

### 단위 테스트 — 유틸 함수

```js
// __tests__/utils/formatDate.test.js
describe('formatDate', () => {
  it('ISO 날짜 문자열을 YYYY.MM.DD 형식으로 변환한다', () => {
    // given
    const isoDate = '2024-03-15T09:30:00Z';

    // when
    const result = formatDate(isoDate);

    // then
    expect(result).toBe('2024.03.15');
  });

  it('null이 들어오면 빈 문자열을 반환한다', () => {
    expect(formatDate(null)).toBe('');
  });
});
```

### 단위 테스트 — 커스텀 훅

```js
// __tests__/hooks/useDocumentSearch.test.js
import { renderHook, act } from '@testing-library/react';

describe('useDocumentSearch', () => {
  it('키워드가 변경되면 검색 결과가 업데이트된다', async () => {
    // given
    const { result } = renderHook(() => useDocumentSearch(''));

    // when
    await act(async () => {
      result.current.setKeyword('온보딩');
    });

    // then
    expect(result.current.documents).toHaveLength(2);
  });
});
```

### 컴포넌트 테스트

```jsx
// __tests__/components/Button.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('텍스트가 렌더링된다', () => {
    // given & when
    render(<Button>확인</Button>);

    // then
    expect(screen.getByText('확인')).toBeInTheDocument();
  });

  it('클릭 시 onClick 핸들러가 호출된다', async () => {
    // given
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>확인</Button>);

    // when
    await userEvent.click(screen.getByText('확인'));

    // then
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 페이지 렌더링 테스트

API 없이 페이지의 기본 구조(헤더, 검색창, 버튼 등)가 올바르게 렌더링되는지 검증한다.

```jsx
// __tests__/pages/DocumentListPage.test.jsx
import { render, screen } from '@testing-library/react';

describe('DocumentListPage 렌더링', () => {
  it('페이지 제목이 렌더링된다', () => {
    // given & when
    render(<DocumentListPage />);

    // then
    expect(screen.getByText('지식 문서')).toBeInTheDocument();
  });

  it('검색창이 렌더링된다', () => {
    render(<DocumentListPage />);

    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
  });

  it('문서 등록 버튼이 렌더링된다', () => {
    render(<DocumentListPage />);

    expect(screen.getByRole('button', { name: '문서 등록' })).toBeInTheDocument();
  });
});
```

### 통합 테스트 — MSW로 API 모킹

```js
// __tests__/pages/DocumentListPage.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// MSW 서버 설정 — API 응답을 가로채서 가짜 응답 반환
const server = setupServer(
  http.get('/api/documents', () => {
    return HttpResponse.json({
      success: true,
      message: '요청이 정상 처리되었습니다.',
      data: {
        content: [
          { id: 1, title: '온보딩 가이드' },
          { id: 2, title: '업무 매뉴얼' },
        ],
        totalPages: 1,
      },
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DocumentListPage', () => {
  it('문서 목록이 렌더링된다', async () => {
    // given & when
    render(<DocumentListPage />);

    // then — API 응답 후 화면에 나타날 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('온보딩 가이드')).toBeInTheDocument();
      expect(screen.getByText('업무 매뉴얼')).toBeInTheDocument();
    });
  });

  it('API 실패 시 에러 메시지가 렌더링된다', async () => {
    // given — 이 테스트에서만 실패 응답으로 덮어쓰기
    server.use(
      http.get('/api/documents', () => {
        return HttpResponse.json(
          { success: false, message: '일시적인 오류가 발생했습니다.', errorCode: 'SERVER_ERROR' },
          { status: 500 }
        );
      })
    );

    // when
    render(<DocumentListPage />);

    // then
    await waitFor(() => {
      expect(screen.getByText('서버 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });
});
```

### 테스트 작성 규칙

- **기능 구현 후 바로 테스트 작성** — PR에 기능 코드와 테스트 코드를 함께 올린다. CI의 테스트 강제 시점과 무관하게 테스트 코드 작성은 항상 필수다 (CI 단계별 적용 계획은 [cicd.md](./cicd.md) 참조)
- **`describe` / `it` 한국어 작성** — "어떤 상황에서 어떤 결과가 나와야 하는지" 명확히
- **given/when/then 패턴** — 준비/실행/검증 세 단계로 구조화
  - `given`: 테스트 실행을 준비하는 단계 (컴포넌트 렌더링, Mock 설정)
  - `when`: 테스트를 진행하는 단계 (사용자 클릭, 입력 등)
  - `then`: 테스트 결과를 검증하는 단계 (화면에 텍스트가 있는지 등)
- 성공 케이스와 **실패 케이스 모두** 작성 (API 실패, 빈 목록, 권한 없음 등)
- 구현 세부사항이 아닌 **사용자 관점**으로 테스트 — `querySelector` 같은 DOM 직접 접근보다 `screen.getByText`, `screen.getByRole` 사용

### 파일명 규칙

| 대상 | 형식 | 예시 |
|------|------|------|
| 컴포넌트 테스트 | `{컴포넌트명}.test.jsx` | `Button.test.jsx` |
| 훅 테스트 | `{훅명}.test.js` | `useDocumentSearch.test.js` |
| 유틸 테스트 | `{파일명}.test.js` | `formatDate.test.js` |
| 페이지 테스트 | `{페이지명}.test.jsx` | `DocumentListPage.test.jsx` |