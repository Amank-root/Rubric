
'use server';
/**
 * @fileOverview This file implements a Genkit flow for evaluating a student's assignment against a structured rubric.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CriterionEvaluationSchema = z.object({
  criterion: z.string().describe('The name of the rubric criterion.'),
  max_marks: z.number().describe('The maximum marks for this criterion.'),
  score: z.number().describe('The score awarded for this criterion.'),
  feedback: z.string().describe('2-3 lines of justification for the score.'),
  suggestions: z.string().describe('Specific, actionable improvement suggestions for this criterion.'),
});

const EvaluateAssignmentInputSchema = z.object({
  assignmentText: z.string().describe('The full text content of the student assignment.'),
  rubricDescription: z.string().describe('A text description of the rubric criteria and their marks.'),
  outputLanguage: z.enum(['English', 'Hindi']).default('English').describe('The language for feedback.'),
});
export type EvaluateAssignmentInput = z.infer<typeof EvaluateAssignmentInputSchema>;

const EvaluateAssignmentOutputSchema = z.object({
  evaluation: z.array(CriterionEvaluationSchema).describe('An array containing the evaluation for each criterion.'),
  overall_summary: z.string().describe('A brief overall summary of the assignment performance.'),
  integrity_flag: z.string().describe('An indicator for originality.'),
});
export type EvaluateAssignmentOutput = z.infer<typeof EvaluateAssignmentOutputSchema>;

/**
 * Result pattern for safe Server Action responses.
 */
export type EvaluateAssignmentResult = {
  data: EvaluateAssignmentOutput | null;
  error: string | null;
};

export async function evaluateAssignment(input: EvaluateAssignmentInput): Promise<EvaluateAssignmentResult> {
  try {
    const { output } = await evaluateAssignmentPrompt(input);
    
    if (!output) {
      return { data: null, error: 'AI failed to generate a response. Please check your API configuration.' };
    }

    // Normalize integrity flag safely
    let flag = (output.integrity_flag || 'low risk').toLowerCase();
    if (!flag.includes('low') && !flag.includes('moderate') && !flag.includes('review')) {
      flag = 'needs review';
    } else if (flag.includes('low')) {
      flag = 'low risk';
    } else if (flag.includes('moderate')) {
      flag = 'moderate risk';
    } else {
      flag = 'needs review';
    }

    const data = JSON.parse(JSON.stringify({
      ...output,
      integrity_flag: flag
    }));

    return { data, error: null };
  } catch (error: any) {
    console.error("evaluateAssignment Action Error:", error);
    return { 
      data: null, 
      error: error.message || "The AI evaluator encountered a processing error. This may be due to a very large input or service timeout." 
    };
  }
}

const evaluateAssignmentPrompt = ai.definePrompt({
  name: 'evaluateAssignmentPrompt',
  input: {schema: EvaluateAssignmentInputSchema},
  output: {schema: EvaluateAssignmentOutputSchema},
  prompt: `You are an academic evaluator. 

Evaluate the student submission strictly according to the following rubric.
Be constructive and neutral. Provide all feedback and suggestions in {{{outputLanguage}}}.

RUBRIC CRITERIA:
{{{rubricDescription}}}

STUDENT SUBMISSION:
---
{{{assignmentText}}}
---

For each criterion:
1. Assign a score out of the max marks.
2. Provide a brief justification (2-3 lines).
3. Suggest 1-2 specific steps for improvement.

Also provide an 'integrity_flag' based on the text patterns (e.g., "low risk", "moderate risk", or "needs review").

Return the result in the requested JSON format.`,
});
