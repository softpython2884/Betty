'use server';
/**
 * @fileOverview The main AI agent for Codex, the Socratic mentor.
 *
 * - chatWithCodex - A function that handles the chat interaction.
 * - ChatWithCodexInput - The input type for the chatWithCodex function.
 * - ChatWithCodexOutput - The return type for the chatWithCodex function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatWithCodexInputSchema = z.object({
  query: z.string().describe('La question ou le message de l\'étudiant à Codex.'),
  context: z.string().describe('Le contexte de l\'endroit où se trouve l\'étudiant dans l\'application (par exemple, page actuelle, nom du projet, détails de la quête).'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('L\'historique de la conversation précédente.'),
});
export type ChatWithCodexInput = z.infer<typeof ChatWithCodexInputSchema>;

const ChatWithCodexOutputSchema = z.object({
  response: z.string().describe('La réponse du mentor IA.'),
});
export type ChatWithCodexOutput = z.infer<typeof ChatWithCodexOutputSchema>;

export async function chatWithCodex(input: ChatWithCodexInput): Promise<ChatWithCodexOutput> {
  return codexChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codexChatPrompt',
  input: { schema: ChatWithCodexInputSchema },
  output: { schema: ChatWithCodexOutputSchema },
  prompt: `Tu es Codex, un mentor IA au sein de Holberton Schools. Ton objectif est de guider les étudiants en utilisant la méthode socratique. Ne donne jamais de réponses ou de solutions directes. Au lieu de cela, pose des questions pertinentes, donne des indices et encourage la pensée critique pour les aider à découvrir la solution par eux-mêmes. Tu dois répondre exclusivement en français.

L'étudiant interagit actuellement avec toi depuis ce contexte :
{{context}}

Votre historique de conversation est le suivant :
{{#each history}}
- {{role}}: {{content}}
{{/each}}

En te basant sur le contexte et l'historique, réponds à la dernière question de l'étudiant de manière utile mais directrice.

Question de l'étudiant : "{{query}}"
`,
});

const codexChatFlow = ai.defineFlow(
  {
    name: 'codexChatFlow',
    inputSchema: ChatWithCodexInputSchema,
    outputSchema: ChatWithCodexOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
