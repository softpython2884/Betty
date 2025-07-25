
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
    positionTop: z.string().describe("La position verticale de la quête sur la carte, en pourcentage (ex: '10%')."),
    positionLeft: z.string().describe("La position horizontale de la quête sur la carte, en pourcentage (ex: '50%')."),
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

**Crucialement**, tu dois aussi définir la position de chaque quête sur une carte en 2D. Utilise les champs \`positionTop\` et \`positionLeft\` pour cela.
- Les positions doivent être des chaînes de caractères en pourcentage (ex: "15%", "80%").
- Organise les quêtes verticalement, en commençant par le haut (\`positionTop\` faible) et en descendant (\`positionTop\` élevé).
- Tu peux utiliser \`positionLeft\` pour créer des branches ou un chemin qui serpente. Par exemple, une quête de base pourrait être à 50% left, et deux quêtes suivantes pourraient être à 30% et 70% left respectivement.
- Garde une marge d'au moins 10% sur les bords (ne va pas en dessous de 10% ou au-dessus de 90%).

Objectif du Cursus :
"{{curriculumGoal}}"

Pour chaque quête, fournis un titre, une courte description, une catégorie, une valeur d'XP appropriée, et les positions top/left. Assure-toi que les titres sont engageants et thématiques.
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
