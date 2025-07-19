'use server';
/**
 * @fileOverview AI agent to generate a quiz based on a quest's topic.
 *
 * - generateQuiz - A function that generates a quiz with questions and options.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuizInputSchema = z.object({
  questTitle: z.string().describe('Le titre de la quête.'),
  questDescription: z.string().describe('La description de la tâche ou du concept de la quête.'),
  numQuestions: z.number().int().min(1).max(10).describe('Le nombre de questions à générer.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizOptionSchema = z.object({
    text: z.string().describe('Le texte de l\'option de réponse.'),
    isCorrect: z.boolean().describe('Vrai si c\'est la bonne réponse, sinon faux.'),
});

const QuizQuestionSchema = z.object({
    text: z.string().describe('Le texte de la question.'),
    type: z.literal('mcq').describe('Le type de question, toujours "mcq" (choix multiple).'),
    options: z.array(QuizOptionSchema).length(4).describe('Un tableau de 4 options de réponse.'),
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('Un tableau des questions de quiz générées.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `Tu es un professeur assistant pour Holberton Schools. Ta tâche est de créer un quiz pertinent et bien formulé en français pour évaluer la compréhension des étudiants sur une quête spécifique.

Sujet de la Quête (Titre): "{{questTitle}}"
Description/Tâche de la Quête: "{{questDescription}}"

Génère un quiz de {{numQuestions}} questions à choix multiples (QCM) sur ce sujet. 
Pour chaque question :
1.  Pose une question claire et sans ambiguïté.
2.  Propose exactement 4 options de réponse.
3.  Assure-toi qu'une seule de ces options est correcte.
4.  Les options incorrectes (distracteurs) doivent être plausibles mais clairement fausses.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
