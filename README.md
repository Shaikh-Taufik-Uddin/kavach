# KAVACH (Zero-Knowledge Evidence Engine) - Master Context

## 🏗️ Architecture & Boundaries
- **System:** Next.js 14 App Router, Tailwind CSS, Firebase v10, WebCrypto API, Gemini 2.5 Flash.
- **Rule:** Strict Folder Isolation. 
  - Dev 1: `components/`, `styles/` (UI only)
  - Dev 2: `lib/utils/`, `lib/ai/` (Logic/Parsers only)
  - Dev 3: `app/`, `lib/crypto/`, `lib/firebase/` (Integration & Security)

## 🚀 Progress Tracker
- [x] **Phase 1:** Data Contracts (`lib/types`) & Firebase Init (`lib/firebase/config.ts`)
- [x] **Phase 2:** Zero-Knowledge Crypto Engine (`lib/crypto/webcrypto.ts`)
- [x] **Phase 3:** Multi-Tenancy & Auth State (`lib/firebase/auth.ts`, `lib/firebase/auth-context.tsx`)
- [x] **Phase 4:** Firestore Vault Layer (`lib/firebase/firestore.ts`)
- [x] **Phase 5:** Student Submission Pipeline (`app/student/submit`)
- [x] **Phase 6:** HR Admin Dashboard (`app/admin/dashboard`)
