'use server';
/**
 * @fileOverview AI agent to assist professors in grading student projects.
 *
 * - gradeProject - A function that provides an initial grade and feedback.
 * - GradeProjectInput - The input type for the gradeProject function.
 * - GradeProjectOutput - The return type for the gradeProject function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GradeProjectInputSchema = z.object({
  questTitle: z.string().describe('Le titre de la quête ou de la tâche originale.'),
  questDescription: z.string().describe('La description complète de ce que l\'étudiant devait accomplir.'),
  projectTitle: z.string().describe('Le titre du projet soumis par l\'étudiant.'),
  projectDocuments: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })).describe('Une liste de documents ou de fichiers de code que l\'étudiant a produits dans son projet.'),
});
export type GradeProjectInput = z.infer<typeof GradeProjectInputSchema>;

const GradeProjectOutputSchema = z.object({
  suggestedGrade: z.number().int().min(0).max(100).describe('Une note suggérée sur 100 pour le projet.'),
  strengths: z.array(z.string()).describe('Une liste des points forts et des aspects bien réussis du projet.'),
  improvements: z.array(z.string()).describe('Une liste des points à améliorer ou des erreurs à corriger.'),
  feedback: z.string().describe('Un brouillon de feedback constructif et encourageant pour l\'étudiant, rédigé en français.'),
});
export type GradeProjectOutput = z.infer<typeof GradeProjectOutputSchema>;

export async function gradeProject(input: GradeProjectInput): Promise<GradeProjectOutput> {
  return gradeProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeProjectPrompt',
  input: { schema: GradeProjectInputSchema },
  output: { schema: GradeProjectOutputSchema },
  prompt: `Tu es un professeur assistant IA pour Holberton Schools. Ton rôle est d'aider les professeurs à évaluer les projets des étudiants. Tu dois être juste, constructif et encourageant. Tu dois répondre exclusivement en français.

Analyse le projet soumis en te basant sur les exigences de la quête originale.

**Détails de la Quête Originale:**
- Titre: {{questTitle}}
- Objectif: {{questDescription}}

**Détails du Projet de l'Étudiant:**
- Titre: {{projectTitle}}

**Contenu du Projet (Documents/Fichiers):**
{{#each projectDocuments}}
- **Document: {{title}}**
  \`\`\`
  {{content}}
  \`\`\`
{{/each}}

**Ta Tâche:**
1.  **Évalue le travail** : Compare le contenu du projet avec l'objectif de la quête.
2.  **Suggère une note** : Propose une note sur 100, en justifiant implicitement ton choix à travers tes observations.
3.  **Identifie les points forts** : Liste les aspects où l'étudiant a excellé.
4.  **Identifie les points à améliorer** : Liste les domaines où il y a des erreurs, des oublis ou des possibilités d'amélioration.
5.  **Rédige un brouillon de feedback** : Écris un commentaire global qui résume tes observations. Il doit être encourageant, commencer par les points positifs, puis aborder les points à améliorer de manière constructive.

Fournis ta réponse sous forme d'objet JSON.
`,
});

const gradeProjectFlow = ai.defineFlow(
  {
    name: 'gradeProjectFlow',
    inputSchema: GradeProjectInputSchema,
    outputSchema: GradeProjectOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
