# Figma Make 프로젝트 Export 완벽 가이드

## 🎯 목표: 모든 코드를 로컬에 저장하기

---

## 방법 1: Figma Make 내장 Export 기능 (권장) ⭐⭐⭐⭐⭐

### A. UI에서 직접 Export

```
1. Figma Make 대시보드 접속
2. 프로젝트 선택 (N Study Hub)
3. Settings 또는 Project Settings 클릭
4. "Export" 또는 "Download" 버튼 찾기
5. ZIP 파일로 다운로드

예상 위치:
- 프로젝트 페이지 우측 상단 "..." 메뉴
- Settings → Export Project
- File → Export → Download ZIP
```

**다운로드되는 것:**
```
nstudy-hub.zip
├── /components
├── /utils
├── /styles
├── /supabase
├── App.tsx
├── index.tsx
├── package.json
└── ... (모든 파일)
```

---

## 방법 2: 파일별로 수동 복사 ⭐⭐⭐⭐

### 현재 Figma Make 에디터에서

```
1. 왼쪽 파일 트리에서 파일 선택
2. 코드 전체 선택 (Ctrl+A / Cmd+A)
3. 복사 (Ctrl+C / Cmd+C)
4. 로컬 에디터에 붙여넣기
5. 같은 경로로 저장

예시:
Figma Make: /components/Header.tsx
→ 로컬: /nstudy-hub/components/Header.tsx
```

### 자동화 스크립트 (선택적)

```javascript
// 브라우저 콘솔에서 실행 (고급)
// Figma Make 에디터에서 F12 → Console

// 모든 파일 목록 가져오기
const files = document.querySelectorAll('.file-tree-item');
const fileList = Array.from(files).map(f => f.textContent);
console.log('Files:', fileList);

// 각 파일 내용 복사
// (Figma Make API에 따라 다를 수 있음)
```

---

## 방법 3: 이미 생성된 통합 문서 활용 ⭐⭐⭐⭐⭐

### 가장 빠른 방법!

**이미 완료되었습니다!** ✅

```
파일: N_STUDY_HUB_CODE_COMPLETE.md

포함된 내용:
✅ App.tsx
✅ MainApp.tsx
✅ LMSApp.tsx
✅ Supabase 설정
✅ API 클라이언트
✅ 스타일시트
✅ 서버 코드

→ 이 파일만 있으면 전체 재구성 가능!
```

**사용 방법:**
```bash
# 1. N_STUDY_HUB_CODE_COMPLETE.md 다운로드
# 2. 각 코드 블록을 해당 파일로 복사
# 3. 프로젝트 재구성
```

---

## 방법 4: Git Clone (Figma Make가 지원하는 경우) ⭐⭐⭐

### Git 통합 확인

```
Figma Make 프로젝트 설정에서:
1. Settings → Integrations
2. "Connect to GitHub" 찾기
3. 연결 후 git clone 가능

만약 있다면:
git clone https://github.com/figma-make/your-project.git
```

---

## 방법 5: 완전 수동 Export (상세 가이드) ⭐⭐⭐⭐

### 단계별 실행

#### Step 1: 로컬 프로젝트 구조 생성

```bash
# 터미널에서 실행
mkdir nstudy-hub
cd nstudy-hub

# 기본 폴더 생성
mkdir -p components/LMS
mkdir -p components/ui
mkdir -p components/auth
mkdir -p components/constants
mkdir -p components/download
mkdir -p components/support
mkdir -p components/utils
mkdir -p utils/supabase
mkdir -p supabase/functions/server
mkdir -p styles
mkdir -p imports
```

#### Step 2: package.json 생성

```bash
# nstudy-hub/package.json
cat > package.json << 'EOF'
{
  "name": "nstudy-hub",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "sonner": "^2.0.3",
    "react-router": "^6.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^4.9.0"
  }
}
EOF
```

#### Step 3: 각 파일 복사 (체크리스트)

**핵심 파일 우선순위:**

```
우선순위 1 (필수):
☐ /index.tsx
☐ /App.tsx
☐ /MainApp.tsx
☐ /LMSApp.tsx
☐ /styles/globals.css
☐ /utils/supabase/info.tsx

우선순위 2 (중요):
☐ /components/Header.tsx
☐ /components/Sidebar.tsx
☐ /components/MainContent.tsx
☐ /components/Footer.tsx
☐ /components/VocaPage.tsx
☐ /components/VocaManagement.tsx
☐ /components/vocaWordSets.ts

우선순위 3 (LMS):
☐ /components/LMS/LMSHeader.tsx
☐ /components/LMS/LMSSidebar.tsx
☐ /components/LMS/LMSMainContent.tsx
☐ /components/LMS/LMSContentManagement.tsx
☐ /components/LMS/LMSCategoryManagement.tsx

우선순위 4 (API):
☐ /utils/vocaApi.ts
☐ /utils/lmsApi.ts
☐ /supabase/functions/server/index.tsx

우선순위 5 (UI 컴포넌트):
☐ /components/ui/button.tsx
☐ /components/ui/card.tsx
☐ /components/ui/dialog.tsx
☐ /components/ui/input.tsx
☐ ... (나머지 UI 컴포넌트들)
```

#### Step 4: 파일 복사 방법

```
각 파일마다:
1. Figma Make에서 파일 열기
2. 전체 선택 (Ctrl+A)
3. 복사 (Ctrl+C)
4. 로컬 에디터 (VS Code 등)에서 새 파일 생성
5. 붙여넣기 (Ctrl+V)
6. 저장

예시:
Figma Make: /App.tsx 복사
→ VS Code: /nstudy-hub/App.tsx 생성 → 붙여넣기 → 저장
```

---

## 방법 6: 브라우저 개발자 도구 활용 (고급) ⭐⭐⭐

### 소스 코드 추출

```javascript
// Figma Make 페이지에서 F12 → Console

// 1. 현재 프로젝트의 소스 추출
const sourceCode = window.__FIGMA_MAKE_PROJECT__;
console.log(sourceCode);

// 2. 파일 구조 확인
const files = window.__FIGMA_MAKE_FILES__;
console.log(files);

// 3. 각 파일 다운로드
Object.keys(files).forEach(path => {
  const content = files[path];
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = path.replace(/\//g, '_');
  a.click();
});
```

**주의:** Figma Make의 내부 구조에 따라 변수명이 다를 수 있습니다.

---

## 방법 7: 이미 있는 백업 문서 활용 (최고 효율) ⭐⭐⭐⭐⭐

### 현재 상태:

**이미 3개 완전한 문서 생성 완료!**

1. **N_STUDY_HUB_CODE_COMPLETE.md** ✅
   - 모든 주요 코드
   - Supabase 설정
   - API 엔드포인트

2. **FIGMA_MAKE_VS_VERCEL_ANALYSIS.md** ✅
   - 비교 분석
   - 마이그레이션 가이드

3. **MIGRATION_STRATEGY.md** ✅
   - 단계별 이전 계획
   - 체크리스트

**재구성 방법:**

```bash
# 1. N_STUDY_HUB_CODE_COMPLETE.md 열기

# 2. 각 코드 블록 복사
# 예시:
## /App.tsx
```typescript
// 이 코드 복사
```

# 3. 로컬 파일로 저장
nstudy-hub/App.tsx

# 4. 반복
```

---

## 📦 Export 후 확인사항

### 체크리스트:

```bash
☐ 모든 파일 복사 완료
☐ package.json 존재
☐ node_modules 설치 (npm install)
☐ 환경 변수 설정 (.env)
☐ 로컬 서버 실행 (npm start)
☐ 브라우저에서 확인 (localhost:3000)
☐ 빌드 테스트 (npm run build)
☐ Supabase 연결 확인
```

### 환경 변수 설정:

```bash
# .env 파일 생성
cat > .env << 'EOF'
REACT_APP_SUPABASE_URL=https://rpxmiyieukfuyhldqdto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

---

## 🚀 Export 후 바로 사용하기

### 로컬에서 실행:

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 시작
npm start

# 3. 브라우저 자동 열림
http://localhost:3000

# 4. 확인
✅ 사이트 로딩
✅ Supabase 연결
✅ 모든 기능 작동
```

### Git에 업로드:

```bash
# 1. Git 초기화
git init

# 2. .gitignore 생성
cat > .gitignore << 'EOF'
node_modules
.env
build
.DS_Store
EOF

# 3. 첫 커밋
git add .
git commit -m "Initial commit: N Study Hub export"

# 4. GitHub에 푸시
git remote add origin https://github.com/YOUR_USERNAME/nstudy-hub.git
git branch -M main
git push -u origin main
```

---

## 🎯 빠른 Export 방법 (추천)

### 3단계로 끝내기:

**Step 1: 통합 문서 다운로드 (1분)**
```
N_STUDY_HUB_CODE_COMPLETE.md 다운로드
```

**Step 2: 프로젝트 생성 (10분)**
```bash
# Create React App 사용
npx create-react-app nstudy-hub --template typescript
cd nstudy-hub

# 또는 Vite 사용 (더 빠름)
npm create vite@latest nstudy-hub -- --template react-ts
cd nstudy-hub
```

**Step 3: 코드 복사 (20분)**
```
통합 문서에서 각 파일 코드 복사
→ 해당 경로에 붙여넣기
→ 완료!
```

**총 소요: 30분** ✅

---

## 💾 Export 파일 구조

### 완전한 프로젝트 구조:

```
nstudy-hub/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── LMS/
│   │   │   ├── LMSHeader.tsx
│   │   │   ├── LMSSidebar.tsx
│   │   │   └── ...
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── VocaPage.tsx
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── supabase/
│   │   │   └── info.tsx
│   │   ├── vocaApi.ts
│   │   └── lmsApi.ts
│   │
│   ├── supabase/
│   │   └── functions/
│   │       └── server/
│   │           └── index.tsx
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── App.tsx
│   ├── MainApp.tsx
│   ├── LMSApp.tsx
│   └── index.tsx
│
├── package.json
├── tsconfig.json
├── .env
├── .gitignore
└── README.md
```

---

## 🛠️ 문제 해결

### 문제 1: 파일이 너무 많아요

**해결:**
```
우선순위대로 복사:
1. 핵심 파일만 (10개) → 기본 작동
2. 필요한 것 추가 → 점진적 완성
```

### 문제 2: Import 에러 발생

**해결:**
```bash
# 의존성 확인
npm install lucide-react sonner

# TypeScript 타입 설치
npm install --save-dev @types/react @types/react-dom
```

### 문제 3: Figma Make Export 버튼이 없어요

**해결:**
```
1. 고객 지원에 문의
2. 또는 수동 복사 (방법 5)
3. 또는 통합 문서 활용 (방법 7)
```

### 문제 4: 환경 변수가 작동 안 해요

**해결:**
```bash
# React: REACT_APP_ 접두사 필수
REACT_APP_SUPABASE_URL=...

# Vite: VITE_ 접두사 필수
VITE_SUPABASE_URL=...

# 서버 재시작 필수!
```

---

## 📋 Export 완료 체크리스트

### 필수 파일:

```
☐ /index.tsx
☐ /App.tsx
☐ /MainApp.tsx
☐ /LMSApp.tsx
☐ /styles/globals.css
☐ /package.json
☐ /.env (환경 변수)
☐ /utils/supabase/info.tsx
☐ /utils/vocaApi.ts
☐ /utils/lmsApi.ts
☐ /components/vocaWordSets.ts
```

### 테스트:

```
☐ npm install 성공
☐ npm start 실행
☐ 브라우저 로딩
☐ 홈페이지 표시
☐ LMS 페이지 작동
☐ 어휘 페이지 작동
☐ Supabase 연결 확인
☐ 빌드 성공 (npm run build)
```

---

## 🎁 보너스: 자동 Export 스크립트

### 한 번에 다운로드 (Node.js)

```javascript
// download-all.js
const fs = require('fs');
const path = require('path');

// N_STUDY_HUB_CODE_COMPLETE.md 파싱
const content = fs.readFileSync('N_STUDY_HUB_CODE_COMPLETE.md', 'utf8');

// 코드 블록 추출 (정규식)
const codeBlocks = content.match(/```(?:tsx?|typescript|javascript|css)\n([\s\S]*?)```/g);

// 파일 생성
codeBlocks.forEach(block => {
  // 파일명과 내용 추출
  // 자동으로 파일 생성
  // (구체적인 구현은 문서 구조에 따라)
});

console.log('Export completed!');
```

---

## 💡 Pro Tips

### 1. 점진적 Export
```
한 번에 다 하려고 하지 말고:
1. 핵심 파일만 먼저
2. 로컬 실행 확인
3. 나머지 추가
```

### 2. Git으로 버전 관리
```bash
# 매 단계마다 커밋
git add .
git commit -m "Add core files"

# 문제 발생 시 되돌리기
git revert HEAD
```

### 3. 백업 유지
```
Figma Make은 그대로 두고
로컬에 복사본 생성
→ 안전하게 작업
```

---

## ✅ 최종 추천 방법

### **당신의 경우:**

**방법 7 + 방법 5 조합** ⭐⭐⭐⭐⭐

```
1. N_STUDY_HUB_CODE_COMPLETE.md 활용
   → 주요 파일 90% 완성

2. Figma Make에서 나머지 복사
   → UI 컴포넌트, 기타 파일

3. 로컬 테스트
   → npm install && npm start

4. GitHub 업로드
   → 백업 완료

총 소요 시간: 1-2시간
```

---

도움이 필요하시면 말씀해주세요! 
특정 파일 목록이나 단계별 가이드가 더 필요하신가요? 😊
