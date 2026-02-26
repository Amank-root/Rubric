'use server';
/**
 * @fileOverview This file implements a Genkit flow for translating academic feedback and suggestions into multiple languages.
 *
 * - provideMultilingualFeedback - A function that handles the translation of feedback and suggestions.
 * - ProvideMultilingualFeedbackInput - The input type for the provideMultilingualFeedback function.
 * - ProvideMultilingualFeedbackOutput - The return type for the provideMultilingualFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideMultilingualFeedbackInputSchema = z.object({
  feedback: z.string().describe('The original feedback to be translated.'),
  suggestions: z.string().describe('The original suggestions to be translated.'),
  targetLanguage: z
    .string()
    .describe('The target language for the translation (e.g., "Hindi", "English").'),
});
export type ProvideMultilingualFeedbackInput = z.infer<
  typeof ProvideMultilingualFeedbackInputSchema
>;

const ProvideMultilingualFeedbackOutputSchema = z.object({
  translatedFeedback: z.string().describe('The translated feedback.'),
  translatedSuggestions: z.string().describe('The translated suggestions.'),
});
export type ProvideMultilingualFeedbackOutput = z.infer<
  typeof ProvideMultilingualFeedbackOutputSchema
>;

export async function provideMultilingualFeedback(
  input: ProvideMultilingualFeedbackInput
): Promise<ProvideMultilingualFeedbackOutput> {
  return provideMultilingualFeedbackFlow(input);
}

const provideMultilingualFeedbackPrompt = ai.definePrompt({
  name: 'provideMultilingualFeedbackPrompt',
  input: {schema: ProvideMultilingualFeedbackInputSchema},
  output: {schema: ProvideMultilingualFeedbackOutputSchema},
  prompt: `You are an expert translator. Your task is to translate academic feedback and suggestions into the specified target language.

Translate the following feedback and suggestions into {{{targetLanguage}}}. Ensure the translation is accurate and maintains the original meaning and tone.

Original Feedback:
---
{{{feedback}}}
---

Original Suggestions:
---
{{{suggestions}}}
---

Provide the translated feedback and suggestions in the specified JSON format.`,
});

const provideMultilingualFeedbackFlow = ai.defineFlow(
  {
    name: 'provideMultilingualFeedbackFlow',
    inputSchema: ProvideMultilingualFeedbackInputSchema,
    outputSchema: ProvideMultilingualFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await provideMultilingualFeedbackPrompt(input);
    if (!output) {
      throw new Error('Failed to generate translated feedback and suggestions.');
    }
    return output;
  }
);
