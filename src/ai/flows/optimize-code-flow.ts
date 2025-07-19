'use server';
/**
 * @fileOverview AI agent to analyze and suggest optimizations for a code snippet.
 *
 * - optimizeCode - A function that returns optimization suggestions.
 * - OptimizeCodeInput - The input type for the optimizeCode function.
 * - OptimizeCodeOutput - The return type for the optimizeCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OptimizeCodeInputSchema = z.object({
  code: z.string().describe('Le morceau de code à optimiser.'),
  language: z.string().describe('Le langage de programmation du code (ex: "JavaScript", "Python").'),
});
export type OptimizeCodeInput = z.infer<typeof OptimizeCodeInputSchema>;

const OptimizeCodeOutputSchema = z.object({
  optimizedCode: z.string().describe("La version optimisée et refactorisée du code."),
  explanation: z.string().describe("Une explication détaillée des changements effectués et pourquoi ils améliorent le code (performance, lisibilité, maintenabilité)."),
});
export type OptimizeCodeOutput = z.infer<typeof OptimizeCodeOutputSchema>;

export async function optimizeCode(input: OptimizeCodeInput): Promise<OptimizeCodeOutput> {
  return optimizeCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCodePrompt',
  input: { schema: OptimizeCodeInputSchema },
  output: { schema: OptimizeCodeOutputSchema },
  prompt: `Tu es un ingénieur logiciel senior spécialisé dans la relecture de code et l'optimisation. Ta tâche est d'analyser le morceau de code {{language}} fourni, de le refactoriser pour améliorer sa performance, sa lisibilité et sa maintenabilité, puis d'expliquer tes changements.

Réécris le code en appliquant les meilleures pratiques. Ensuite, fournis une explication claire et concise des modifications apportées.

Code original:
\`\`\`{{language}}
{{code}}
\`\`\`
`,
});

const optimizeCodeFlow = ai.defineFlow(
  {
    name: 'optimizeCodeFlow',
    inputSchema: OptimizeCodeInputSchema,
    outputSchema: OptimizeCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
