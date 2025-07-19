'use server';
/**
 * @fileOverview AI agent to explain a programming concept in simple terms.
 *
 * - explainConcept - A function that explains a given concept.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainConceptInputSchema = z.object({
  concept: z.string().describe('Le concept de programmation que l\'étudiant souhaite comprendre.'),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z.string().describe('L\'explication du concept en français simple, avec des exemples de code si nécessaire.'),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: { schema: ExplainConceptInputSchema },
  output: { schema: ExplainConceptOutputSchema },
  prompt: `Tu es un mentor IA pour les étudiants de Holberton Schools. Ta tâche est d'expliquer des concepts de programmation complexes de la manière la plus simple et la plus claire possible, en français.

Utilise des analogies, des métaphores et des exemples de code simples (en anglais) pour illustrer ton propos. L'objectif est de rendre le concept accessible à un débutant complet.

Explique le concept suivant :
"{{concept}}"

Ton explication doit être structurée et facile à lire.
`,
});

const explainConceptFlow = ai.defineFlow(
  {
    name: 'explainConceptFlow',
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
