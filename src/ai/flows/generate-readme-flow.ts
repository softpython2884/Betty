'use server';
/**
 * @fileOverview AI agent to generate a README.md file from a project description.
 *
 * - generateReadme - A function that generates a README file.
 * - GenerateReadmeInput - The input type for the generateReadme function.
 * - GenerateReadmeOutput - The return type for the generateReadme function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateReadmeInputSchema = z.object({
  projectDescription: z.string().describe('Une description détaillée de ce que fait le projet, ses technologies et son objectif.'),
  fileStructure: z.string().optional().describe('Une représentation de la structure des fichiers du projet (par exemple, la sortie de la commande `tree`).'),
});
export type GenerateReadmeInput = z.infer<typeof GenerateReadmeInputSchema>;

const GenerateReadmeOutputSchema = z.object({
  readmeContent: z.string().describe('Le contenu complet du fichier README.md généré, formaté en Markdown.'),
});
export type GenerateReadmeOutput = z.infer<typeof GenerateReadmeOutputSchema>;

export async function generateReadme(input: GenerateReadmeInput): Promise<GenerateReadmeOutput> {
  return generateReadmeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReadmePrompt',
  input: { schema: GenerateReadmeInputSchema },
  output: { schema: GenerateReadmeOutputSchema },
  prompt: `Tu es un ingénieur logiciel expérimenté chargé de rédiger une documentation claire et professionnelle pour les étudiants de Holberton Schools.

Ta tâche est de générer un fichier README.md complet en français à partir de la description du projet et de sa structure de fichiers. Le README doit être bien structuré et facile à comprendre pour un autre développeur.

Utilise les sections suivantes, si pertinentes :
- Titre du Projet
- Description (un ou deux paragraphes)
- Fonctionnalités
- Technologies utilisées
- Installation et Lancement
- Structure des Fichiers (si fournie)
- Auteurs

Description du Projet:
"{{projectDescription}}"

{{#if fileStructure}}
Structure des Fichiers:
\`\`\`
{{fileStructure}}
\`\`\`
{{/if}}

Génère maintenant le contenu Markdown pour le fichier README.md. Assure-toi que les blocs de code (comme les commandes d'installation) sont en anglais, car c'est la norme.
`,
});

const generateReadmeFlow = ai.defineFlow(
  {
    name: 'generateReadmeFlow',
    inputSchema: GenerateReadmeInputSchema,
    outputSchema: GenerateReadmeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
