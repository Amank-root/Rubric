
'use server';
/**
 * @fileOverview A Genkit flow for parsing natural language rubrics into a structured JSON format.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RubricCriterionSchema = z.object({
  criterion: z.string().describe('The name of the evaluation criterion.'),
  max_marks: z.number().positive().describe('The maximum marks/points for this criterion.'),
});

const RubricCriteriaSchema = z.array(RubricCriterionSchema);

const ParseRubricInputSchema = z.object({
  rubricText: z.string().describe('The natural language text of the rubric.'),
});

export type ParseRubricInput = z.infer<typeof ParseRubricInputSchema>;
export type ParseRubricOutput = z.infer<typeof RubricCriteriaSchema>;

export type ParseRubricResult = {
  data: ParseRubricOutput | null;
  error: string | null;
};

export async function parseRubric(input: ParseRubricInput): Promise<ParseRubricResult> {
  try {
    const { output } = await parseRubricPrompt(input);
    
    if (!output || output.length === 0) {
      return { data: null, error: "No criteria could be extracted. Please ensure your rubric lists marks clearly, e.g., 'Writing (10 marks)'." };
    }

    return { data: JSON.parse(JSON.stringify(output)), error: null };
  } catch (error: any) {
    console.error("parseRubric Action Error:", error);
    return { data: null, error: error.message || "Failed to parse the rubric format. Try using simpler text." };
  }
}

const parseRubricPrompt = ai.definePrompt({
  name: 'parseRubricPrompt',
  input: { schema: ParseRubricInputSchema },
  output: { schema: RubricCriteriaSchema },
  prompt: `You are an academic assistant specialized in parsing evaluation rubrics.

Extract the criteria and their max marks from the text below. 
Format: JSON array with "criterion" and "max_marks".

RUBRIC TEXT:
{{{rubricText}}}

Rules:
- Default to 10 marks if unspecified.
- Ensure max_marks is always a positive number.`,
});
