'use server';
/**
 * @fileOverview AI agent to simulate a technical or behavioral interview.
 *
 * - simulateInterview - A function that handles the chat interaction for the interview.
 * - SimulateInterviewInput - The input type for the function.
 * - SimulateInterviewOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SimulateInterviewInputSchema = z.object({
  jobDescription: z.string().describe("La description du poste pour lequel l'étudiant s'entraîne."),
  interviewType: z.enum(["technical", "behavioral"]).describe("Le type d'entretien (technique ou comportemental)."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('L\'historique de la conversation précédente.'),
});
export type SimulateInterviewInput = z.infer<typeof SimulateInterviewInputSchema>;

const SimulateInterviewOutputSchema = z.object({
  response: z.string().describe("La question ou le feedback du recruteur IA."),
  isFinished: z.boolean().describe("Indique si l'entretien est terminé."),
});
export type SimulateInterviewOutput = z.infer<typeof SimulateInterviewOutputSchema>;

export async function simulateInterview(input: SimulateInterviewInput): Promise<SimulateInterviewOutput> {
  return interviewSimulatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewSimulatorPrompt',
  input: { schema: SimulateInterviewInputSchema },
  output: { schema: SimulateInterviewOutputSchema },
  prompt: `Tu es un recruteur expérimenté pour une entreprise de technologie de premier plan. Ton rôle est de mener un entretien d'embauche {{interviewType}} avec un étudiant de Holberton Schools pour le poste suivant :
"{{jobDescription}}"

Ton objectif est de poser des questions pertinentes, d'évaluer les réponses de l'étudiant et de fournir un feedback constructif.

**Instructions:**
1.  Commence l'entretien par une question d'introduction si l'historique est vide.
2.  Pose une seule question à la fois.
3.  Si l'entretien est technique, pose des questions sur les algorithmes, les structures de données, ou des problèmes de conception liés aux technologies du poste.
4.  Si l'entretien est comportemental, utilise la méthode STAR (Situation, Tâche, Action, Résultat) pour évaluer les expériences passées.
5.  Après 4-5 questions, conclus l'entretien en donnant un bref feedback et en remerciant l'étudiant. Quand tu conclus, mets le champ 'isFinished' à 'true'.
6.  Réponds exclusivement en français.

Historique de la conversation:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Réponse/Question du recruteur :
`,
});

const interviewSimulatorFlow = ai.defineFlow(
  {
    name: 'interviewSimulatorFlow',
    inputSchema: SimulateInterviewInputSchema,
    outputSchema: SimulateInterviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
