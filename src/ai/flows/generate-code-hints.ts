'use server';

/**
 * @fileOverview Provides hints and guiding questions to students in the CodeSpace.
 *
 * - generateCodeHints - A function that generates code hints and guiding questions.
 * - GenerateCodeHintsInput - The input type for the generateCodeHints function.
 * - GenerateCodeHintsOutput - The return type for the generateCodeHints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeHintsInputSchema = z.object({
  code: z.string().describe('The current code in the CodeSpace.'),
  error: z.string().describe('The error message, if any, in the CodeSpace.'),
  task: z.string().describe('The current task the student is working on.'),
});
export type GenerateCodeHintsInput = z.infer<typeof GenerateCodeHintsInputSchema>;

const GenerateCodeHintsOutputSchema = z.object({
  hint: z.string().describe('A helpful hint to guide the student.'),
  question: z.string().describe('A guiding question to prompt the student to think critically.'),
});
export type GenerateCodeHintsOutput = z.infer<typeof GenerateCodeHintsOutputSchema>;

export async function generateCodeHints(input: GenerateCodeHintsInput): Promise<GenerateCodeHintsOutput> {
  return generateCodeHintsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeHintsPrompt',
  input: {schema: GenerateCodeHintsInputSchema},
  output: {schema: GenerateCodeHintsOutputSchema},
  prompt: `You are an AI mentor assisting a student in a CodeSpace.

The student is working on the following task: {{{task}}}

The current code is:
\`\`\`
{{{code}}}
\`\`\`

The code currently has this error, if any:
{{{error}}}

Provide a single helpful hint to guide the student towards a solution.
Also, ask a single guiding question to prompt the student to think critically about the problem.

Ensure that the hint and question do not directly give away the answer, but rather encourage the student to learn and debug independently.

Format your response as a JSON object with "hint" and "question" keys.
`, 
});

const generateCodeHintsFlow = ai.defineFlow(
  {
    name: 'generateCodeHintsFlow',
    inputSchema: GenerateCodeHintsInputSchema,
    outputSchema: GenerateCodeHintsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
