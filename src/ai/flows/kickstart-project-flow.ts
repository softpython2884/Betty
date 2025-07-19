'use server';
/**
 * @fileOverview AI agent to generate project details from a simple idea.
 *
 * - kickstartProjectFlow - A function that generates a project name, description, and README.
 * - KickstartProjectInput - The input type for the kickstartProjectFlow function.
 * - KickstartProjectOutput - The return type for the kickstartProjectFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const KickstartProjectInputSchema = z.object({
  idea: z.string().describe('Une brève description de l\'idée de projet.'),
});
export type KickstartProjectInput = z.infer<typeof KickstartProjectInputSchema>;

const KickstartProjectOutputSchema = z.object({
  projectName: z.string().describe('Un nom de projet créatif et concis, en 2-4 mots maximum.'),
  projectDescription: z.string().describe('Une description claire et attrayante du projet, en 1-2 phrases.'),
  readmeContent: z.string().describe('Le contenu Markdown complet pour un fichier README.md de base pour ce projet. Doit inclure un titre, une description, et des sections pour les fonctionnalités et les technologies.'),
});
export type KickstartProjectOutput = z.infer<typeof KickstartProjectOutputSchema>;

export async function kickstartProject(input: KickstartProjectInput): Promise<KickstartProjectOutput> {
  return kickstartProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'kickstartProjectPrompt',
  input: { schema: KickstartProjectInputSchema },
  output: { schema: KickstartProjectOutputSchema },
  prompt: `Tu es un expert en gestion de projet logiciel et un mentor pour Holberton Schools. Ta tâche est de transformer une idée de projet simple en une base de projet solide.

À partir de l'idée fournie, génère les éléments suivants en français :
1.  **Un nom de projet (projectName)** : Il doit être créatif, mémorable et court (2 à 4 mots maximum).
2.  **Une description de projet (projectDescription)** : Une phrase ou deux qui résument l'objectif du projet de manière attrayante.
3.  **Un contenu de README (readmeContent)** : Un fichier README.md complet au format Markdown. Il doit inclure le nom du projet comme titre principal (`# nom_du_projet`), la description que tu as générée, une section "## Fonctionnalités" avec une liste d'au moins 3 fonctionnalités clés déduites de l'idée, et une section "## Technologies" avec une liste de technologies probables. Les blocs de code (si applicable) doivent être en anglais.

Idée de projet de l'étudiant : "{{idea}}"
`,
});

const kickstartProjectFlow = ai.defineFlow(
  {
    name: 'kickstartProjectFlow',
    inputSchema: KickstartProjectInputSchema,
    outputSchema: KickstartProjectOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
