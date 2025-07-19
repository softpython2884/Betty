
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

const GenerateQuestlineInputSchema = z.object({
  curriculumGoal: z.string().describe('L\'objectif d\'apprentissage principal pour l\'ensemble du cursus.'),
});
export type GenerateQuestlineInput = z.infer<typeof GenerateQuestlineInputSchema>;

const QuestSchema = z.object({
    title: z.string().describe('Le titre captivant et thématique de la quête.'),
    description: z.string().describe('Une description brève et engageante du but et de l\'histoire de la quête.'),
    category: z.enum(["Core", "Frontend", "Backend", "Tools", "Library", "Weekly"]).describe('La catégorie de la quête.'),
    xp: z.number().int().min(1).describe('Les points d\'expérience attribués pour l\'accomplissement de la quête, généralement entre 50 et 500.'),
});

const GenerateQuestlineOutputSchema = z.object({
  quests: z.array(QuestSchema).describe('Un tableau de 5 à 10 quêtes générées qui forment un parcours d\'apprentissage cohérent.'),
});
export type GenerateQuestlineOutput = z.infer<typeof GenerateQuestlineOutputSchema>;

export async function generateQuestline(input: GenerateQuestlineInput): Promise<GenerateQuestlineOutput> {
  return generateQuestlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestlinePrompt',
  input: { schema: GenerateQuestlineInputSchema },
  output: { schema: GenerateQuestlineOutputSchema },
  prompt: `Tu es un concepteur de cursus pour Holberton Schools, une académie de code gamifiée. Ta tâche est de générer une série de quêtes en français qui forment un parcours d'apprentissage cohérent basé sur un objectif de cursus donné.

Génère entre 5 et 10 quêtes. Les quêtes doivent s'appuyer logiquement les unes sur les autres, en commençant par des concepts simples et en augmentant en complexité.

Objectif du Cursus :
"{{curriculumGoal}}"

Pour chaque quête, fournis un titre, une courte description, une catégorie et une valeur d'XP appropriée. Assure-toi que les titres sont engageants et thématiques.
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
