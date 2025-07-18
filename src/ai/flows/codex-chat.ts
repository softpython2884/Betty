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
  query: z.string().describe('The student\'s question or message to Codex.'),
  context: z.string().describe('The context of where the student is in the app (e.g., current page, project name, quest details).'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The previous conversation history.'),
});
export type ChatWithCodexInput = z.infer<typeof ChatWithCodexInputSchema>;

const ChatWithCodexOutputSchema = z.object({
  response: z.string().describe('The AI mentor\'s response.'),
});
export type ChatWithCodexOutput = z.infer<typeof ChatWithCodexOutputSchema>;

export async function chatWithCodex(input: ChatWithCodexInput): Promise<ChatWithCodexOutput> {
  return codexChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codexChatPrompt',
  input: { schema: ChatWithCodexInputSchema },
  output: { schema: ChatWithCodexOutputSchema },
  prompt: `You are Codex, an AI mentor in a coding academy named Betty. Your purpose is to guide students by using the Socratic method. Never give direct answers or solutions. Instead, ask guiding questions, provide hints, and encourage critical thinking to help them discover the solution themselves.

The student is currently interacting with you from this context:
{{context}}

Your conversation history is as follows:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the context and history, respond to the student's latest query in a helpful but guiding manner.

Student's query: "{{query}}"
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
