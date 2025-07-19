'use server';
/**
 * @fileOverview AI agent to generate a daily treasure hunt.
 *
 * - generateTreasureHunt - A function that generates an HTML page with a hidden flag.
 * - GenerateTreasureHuntInput - The input type for the function.
 * - GenerateTreasureHuntOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTreasureHuntInputSchema = z.object({
  theme: z.string().describe('Le thème de la page web à générer (ex: "Portfolio de photographe", "Page de produit pour une boisson énergisante", "Blog de voyage").'),
});
export type GenerateTreasureHuntInput = z.infer<typeof GenerateTreasureHuntInputSchema>;

const GenerateTreasureHuntOutputSchema = z.object({
  htmlContent: z.string().describe("Le contenu HTML complet de la page. Doit inclure le CSS et le JS (si nécessaire) dans des balises <style> et <script> à l'intérieur du HTML."),
  flag: z.string().describe("Le mot secret caché dans le code. Doit être unique et difficile à deviner, sous la forme 'B3TTY-FLAG-XXXX'."),
  hint: z.string().describe("Un indice pour aider l'utilisateur à trouver où le flag est caché (ex: 'Vérifiez les commentaires dans le code source', 'Une variable CSS semble intéressante...')."),
});
export type GenerateTreasureHuntOutput = z.infer<typeof GenerateTreasureHuntOutputSchema>;

export async function generateTreasureHunt(input: GenerateTreasureHuntInput): Promise<GenerateTreasureHuntOutput> {
  return generateTreasureHuntFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTreasureHuntPrompt',
  input: { schema: GenerateTreasureHuntInputSchema },
  output: { schema: GenerateTreasureHuntOutputSchema },
  prompt: `Tu es un développeur web créatif qui prépare une chasse au trésor quotidienne pour des étudiants en code.

Ta tâche est de générer une page web complète (HTML, CSS et JS dans un seul fichier) sur un thème donné.

Thème : "{{theme}}"

Dans le code source de cette page (pas le texte visible), tu dois cacher un "flag" secret. Le flag doit être au format B3TTY-FLAG-XXXX où XXXX est une chaîne de caractères aléatoires.

Tu dois également fournir un indice sur la manière de trouver le flag.

Voici quelques idées pour cacher le flag :
- Dans un commentaire HTML (<!-- ... -->)
- Dans un commentaire CSS (/* ... */)
- Dans une variable CSS personnalisée (--secret-variable: '...')
- Dans un attribut de données sur un élément HTML (data-secret="...")
- Dans une chaîne de caractères dans une balise <script>

**Instructions Importantes:**
1.  Génère un document HTML complet et valide.
2.  Le CSS doit être dans une balise <style>.
3.  Le JavaScript (si tu en utilises) doit être dans une balise <script>.
4.  Assure-toi que la page est visuellement simple mais fonctionnelle.
5.  Le flag doit être présent dans le code source mais pas facilement visible sur la page rendue.
6.  Fournis l'indice et le flag dans les champs appropriés de l'objet de sortie JSON.
`,
});

const generateTreasureHuntFlow = ai.defineFlow(
  {
    name: 'generateTreasureHuntFlow',
    inputSchema: GenerateTreasureHuntInputSchema,
    outputSchema: GenerateTreasureHuntOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
