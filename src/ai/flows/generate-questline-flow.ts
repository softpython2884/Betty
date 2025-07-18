
'use server';
/**
 * @fileOverview AI agent to generate a full questline for a curriculum.
 *
 * - generateQuestline - A function that generates a series of quests.
 * - GenerateQuestlineInput - The input type for the generateQuestline function.
 * - GenerateQuestlineOutput - The return type for the generateQuestline function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateQuestlineInputSchema = z.object({
  curriculumGoal: z.string().describe('The main learning objective for the entire curriculum.'),
});
export type GenerateQuestlineInput = z.infer<typeof GenerateQuestlineInputSchema>;

const QuestSchema = z.object({
    title: z.string().describe('The compelling and thematic title of the quest.'),
    description: z.string().describe('A brief, engaging description of the quest\'s purpose and story.'),
    category: z.enum(["Core", "Frontend", "Backend", "Tools", "Library", "Weekly"]).describe('The category of the quest.'),
    xp: z.number().int().positive().describe('The experience points awarded for completing the quest, typically between 50 and 500.'),
});

export const GenerateQuestlineOutputSchema = z.object({
  quests: z.array(QuestSchema).describe('An array of 5 to 10 generated quests that form a coherent learning path.'),
});
export type GenerateQuestlineOutput = z.infer<typeof GenerateQuestlineOutputSchema>;

export async function generateQuestline(input: GenerateQuestlineInput): Promise<GenerateQuestlineOutput> {
  return generateQuestlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestlinePrompt',
  input: { schema: GenerateQuestlineInputSchema },
  output: { schema: GenerateQuestlineOutputSchema },
  prompt: `You are a curriculum designer for a gamified coding academy. Your task is to generate a series of quests that form a coherent learning path based on a given curriculum goal.

Generate between 5 and 10 quests. The quests should logically build upon each other, starting simple and increasing in complexity.

Curriculum Goal:
"{{curriculumGoal}}"

For each quest, provide a title, a short description, a category, and an appropriate XP value. Ensure the titles are engaging and thematic.
`,
});

const generateQuestlineFlow = ai.defineFlow(
  {
    name: 'generateQuestlineFlow',
    inputSchema: GenerateQuestlineInputSchema,
    outputSchema: GenerateQuestlineOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
