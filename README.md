# RubricAI – Smart Academic Evaluation

RubricAI is a powerful Next.js application designed for educators and students to evaluate assignments against custom rubrics using Genkit AI. It features batch processing, Cloudinary file storage, and academic integrity monitoring.

## Features
- **AI-Powered Grading**: Intelligent evaluation based on your specific rubric criteria.
- **Bulk Processing**: Upload and analyze multiple assignments (PDF, DOCX, TXT) simultaneously.
- **Originality Detection**: Pattern-based indicators for potential AI usage or lack of originality.
- **Cloud Storage**: Seamless integration with Cloudinary for permanent document storage.
- **Multilingual Support**: Generate feedback in English or Hindi.
- **Evaluation Library**: A secure archive of all your past reports stored in Firestore.

## Getting Started

1. **Environment Variables**:
   Ensure you have the following keys in your environment (or `.env` file):
   - `GEMINI_API_KEY`: For Genkit AI processing.
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary unsigned upload preset.
   - `FIREBASE_PROJECT_ID`: Your Firebase Project ID.
   - `FIREBASE_API_KEY`: Your Firebase API Key.
   - (And other Firebase config vars found in `src/firebase/config.ts`)

2. **Run Locally**:
   ```bash
   npm install
   npm run dev
   ```

## Hosting on Firebase

This project is optimized for **Firebase App Hosting**. Follow these steps to deploy:

### 1. Prerequisite
Ensure your code is pushed to a **GitHub repository**.

### 2. Initialize App Hosting
Run the following command in your terminal and follow the prompts to connect your GitHub repo and create a backend:
```bash
firebase init apphosting
```

### 3. Configure Environment Variables
Go to the [Firebase Console](https://console.firebase.google.com/), select your project, navigate to **App Hosting**, select your backend settings, and add your `GEMINI_API_KEY` and Cloudinary credentials to the environment variables section.

### 4. Deploy
Once initialized, any push to your main branch will trigger an automatic build and deployment:
```bash
git add .
git commit -m "Deploy to Firebase"
git push origin main
```

Alternatively, if you are using the classic Firebase Hosting with Web Frameworks support, you can use:
```bash
firebase deploy
```

---
Built with Next.js, Genkit, and Firebase Studio.
