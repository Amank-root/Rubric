# RubricAI – Smart Academic Evaluation

RubricAI is a full-stack web application that lets educators evaluate student assignments against custom rubrics using Google's Gemini AI (via Genkit). Upload documents in bulk, get structured per-criterion scores with actionable feedback, detect originality issues, and archive every report in a private evaluation library.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| AI | [Genkit](https://firebase.google.com/docs/genkit) + Google Gemini (`@genkit-ai/google-genai`) |
| Database | Firebase Firestore (evaluations) · PostgreSQL via Prisma (auth) |
| Auth | Firebase Anonymous Auth + [better-auth](https://github.com/better-auth/better-auth) |
| File Storage | Cloudinary (PDF / DOCX / TXT uploads) |
| UI | shadcn/ui (Radix UI primitives) + Tailwind CSS |
| Deployment | Firebase App Hosting |

## Features

- **AI-Powered Grading** — Gemini evaluates each submission criterion-by-criterion against your rubric, assigning scores and writing targeted feedback.
- **Rubric Parser** — Paste any free-form rubric text; a dedicated Genkit flow structures it into scored criteria automatically.
- **Bulk Processing** — Upload multiple assignments (PDF, DOCX, TXT) in one batch and process them sequentially with live progress feedback.
- **Originality / Integrity Detection** — Pattern-based analysis flags submissions as `low risk`, `moderate risk`, or `needs review`.
- **Multilingual Feedback** — Generate all feedback in **English** or **Hindi**.
- **Evaluation Library** — Every report is saved to Firestore under the user's private namespace and browsable from the `/library` page.
- **Detailed Report View** — Per-criterion breakdown, overall summary, score totals, and integrity badge at `/evaluation/[id]`.
- **Secure by Default** — Firestore security rules enforce strict user-ownership; no cross-user data access is possible.

## Project Structure

```
src/
├── ai/
│   ├── flows/
│   │   ├── parse-rubric-flow.ts              # Structures free-form rubric text
│   │   ├── evaluate-assignment-flow.ts       # Scores assignment against rubric
│   │   ├── detect-originality-issues-flow.ts # Originality analysis
│   │   └── provide-multilingual-feedback-flow.ts
│   └── genkit.ts                             # Genkit + Gemini configuration
├── app/
│   ├── (root)/
│   │   ├── page.tsx                          # Main evaluation workspace
│   │   ├── library/page.tsx                  # Evaluation history archive
│   │   └── evaluation/[id]/                  # Individual report view
│   └── (auth)/api/                           # better-auth API routes
├── components/
│   ├── EvaluationForm.tsx
│   ├── EvaluationResults.tsx
│   ├── EvaluationHistory.tsx
│   └── Header.tsx
├── firebase/                                 # Firestore hooks & Firebase config
└── prisma/schema.prisma                      # User / Session / Account models
```

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (recommended) or npm
- A Google Cloud / Firebase project
- A Cloudinary account (free tier works)
- A PostgreSQL database (for better-auth sessions)

### 1. Install dependencies

```bash
pnpm install
# or
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Google Gemini / Genkit
GEMINI_API_KEY=your_gemini_api_key

# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# PostgreSQL (for better-auth)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# better-auth
BETTER_AUTH_SECRET=a_long_random_secret
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Set up the database

```bash
pnpm prisma migrate deploy
# or for local development
pnpm prisma migrate dev
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the Genkit developer UI alongside the app:

```bash
pnpm genkit:dev
```

## Deployment (Firebase App Hosting)

This project is optimised for **Firebase App Hosting**, which provides zero-config CI/CD from GitHub.

### 1. Push your code to GitHub

### 2. Initialise App Hosting

```bash
firebase init apphosting
```

Follow the prompts to link your GitHub repository and create a backend.

### 3. Add secrets in the Firebase Console

Navigate to **App Hosting → Backend Settings → Environment Variables** and add all keys from your `.env` file.

### 4. Deploy

Any push to your `main` branch triggers an automatic build and deployment. You can also deploy manually:

```bash
firebase deploy
```

## Firestore Security

All evaluation data is stored under `/users/{userId}/...`. The `firestore.rules` file enforces:

- Only the authenticated owner can read or write their own documents.
- Every document must contain a `userId` field matching the path to prevent spoofing.
- A catch-all `deny` rule blocks access to any unmatched path.

---

Built with [Next.js](https://nextjs.org/), [Genkit](https://firebase.google.com/docs/genkit), and [Firebase](https://firebase.google.com/).
