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
  code: z.string().describe('Le code actuel dans le CodeSpace.'),
  error: z.string().describe('Le message d\'erreur, s\'il y en a un, dans le CodeSpace.'),
  task: z.string().describe('La tâche actuelle sur laquelle l\'étudiant travaille.'),
});
export type GenerateCodeHintsInput = z.infer<typeof GenerateCodeHintsInputSchema>;

const GenerateCodeHintsOutputSchema = z.object({
  hint: z.string().describe('Un indice utile pour guider l\'étudiant.'),
  question: z.string().describe('Une question directrice pour inciter l\'étudiant à réfléchir de manière critique.'),
});
export type GenerateCodeHintsOutput = z.infer<typeof GenerateCodeHintsOutputSchema>;

export async function generateCodeHints(input: GenerateCodeHintsInput): Promise<GenerateCodeHintsOutput> {
  return generateCodeHintsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeHintsPrompt',
  input: {schema: GenerateCodeHintsInputSchema},
  output: {schema: GenerateCodeHintsOutputSchema},
  prompt: `Tu es un mentor IA qui assiste un étudiant de Holberton Schools dans un CodeSpace. Tu dois répondre en français.

L'étudiant travaille sur la tâche suivante : {{{task}}}

Le code actuel est :
\`\`\`
{{{code}}}
\`\`\`

Le code a actuellement cette erreur, s'il y en a une :
{{{error}}}

Fournis un unique indice utile pour guider l'étudiant vers une solution.
Pose également une unique question directrice pour inciter l'étudiant à réfléchir de manière critique au problème.

Assure-toi que l'indice et la question ne donnent pas directement la réponse, mais encouragent plutôt l'étudiant à apprendre et à déboguer de manière autonome.

Formate ta réponse en tant qu'objet JSON avec les clés "hint" et "question".
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
