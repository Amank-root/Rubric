import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Central Genkit configuration.
 * Uses the Gemini 2.5 Flash model for optimal speed and reasoning.
 */

// Debug log for environment check (Server-side only)
if (typeof window === 'undefined') {
  const hasKey = !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY);
  console.log(`[Genkit Init] API Key present: ${hasKey}`);
}

export const ai = genkit({
  plugins: [
    googleAI() 
  ],
  model: 'googleai/gemini-2.5-flash',
});
