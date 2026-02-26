'use server';
/**
 * @fileOverview An AI agent for detecting originality issues in student submissions.
 *
 * - detectOriginalityIssues - A function that handles the originality detection process.
 * - DetectOriginalityIssuesInput - The input type for the detectOriginalityIssues function.
 * - DetectOriginalityIssuesOutput - The return type for the detectOriginalityIssues function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OriginalityFlagSchema = z.enum([
  'low risk',
  'moderate risk',
  'needs review',
]);

const DetectOriginalityIssuesInputSchema = z.object({
  submissionText: z.string().describe('The student submission text.'),
});
export type DetectOriginalityIssuesInput = z.infer<
  typeof DetectOriginalityIssuesInputSchema
>;

const DetectOriginalityIssuesOutputSchema = z.object({
  originalityFlag: OriginalityFlagSchema.describe(
    'A flag indicating the originality risk: "low risk", "moderate risk", or "needs review".'
  ),
  reasoning: z
    .string()
    .describe(
      'Brief reasoning for the originality flag, highlighting patterns or concerns.'
    ),
});
export type DetectOriginalityIssuesOutput = z.infer<
  typeof DetectOriginalityIssuesOutputSchema
>;

export async function detectOriginalityIssues(
  input: DetectOriginalityIssuesInput
): Promise<DetectOriginalityIssuesOutput> {
  return detectOriginalityIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectOriginalityIssuesPrompt',
  input: { schema: DetectOriginalityIssuesInputSchema },
  output: { schema: DetectOriginalityIssuesOutputSchema },
  prompt: `You are an academic integrity assistant. Your task is to analyze student submissions for patterns indicative of AI generation, lack of originality, or overly generic phrasing.
Do NOT claim full plagiarism detection. Focus on identifying patterns that suggest potential issues, such as repetitive phrasing, high predictability language, or generic academic prose.

Based on the SUBMISSION below, provide an 'originalityFlag' and brief 'reasoning'.

SUBMISSION:
{{{submissionText}}}

ORIGINALITY GUIDELINES:
- 'low risk': The text appears to be original and human-written.
- 'moderate risk': The text shows some patterns that might indicate AI generation or lack of originality, such as slightly repetitive structures or generally predictable language, but no strong evidence.
- 'needs review': The text exhibits strong patterns often associated with AI-generated content (e.g., highly formulaic language, specific AI artifacts, overly generic and structured responses without unique insights) or significant lack of original thought.

OUTPUT FORMAT:
Return JSON with:
- originalityFlag: ('low risk' | 'moderate risk' | 'needs review')
- reasoning: (brief explanation for the flag)
`,
});

const detectOriginalityIssuesFlow = ai.defineFlow(
  {
    name: 'detectOriginalityIssuesFlow',
    inputSchema: DetectOriginalityIssuesInputSchema,
    outputSchema: DetectOriginalityIssuesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
