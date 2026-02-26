import { config } from 'dotenv';
config();

import '@/ai/flows/parse-rubric-flow.ts';
import '@/ai/flows/provide-multilingual-feedback-flow.ts';
import '@/ai/flows/detect-originality-issues-flow.ts';
import '@/ai/flows/evaluate-assignment-flow.ts';