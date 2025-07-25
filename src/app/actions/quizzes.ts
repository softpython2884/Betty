
"use server";

import { db } from "@/lib/db";
import { quizzes, quizQuestions, quizOptions, type NewQuiz, type NewQuizQuestion, type NewQuizOption } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export type QuizQuestionWithOptions = NewQuizQuestion & {
    options: NewQuizOption[];
};

export type SaveQuizInput = Omit<NewQuiz, 'id'> & {
    questions: QuizQuestionWithOptions[];
};

export async function saveQuiz(data: SaveQuizInput): Promise<{ success: boolean; message: string }> {
    try {
        const existingQuiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.questId, data.questId),
            with: { questions: { with: { options: true } } }
        });

        if (existingQuiz) {
            await db.transaction(async (tx) => {
                 const questionIds = existingQuiz.questions.map(q => q.id);
                if (questionIds.length > 0) {
                     await tx.delete(quizOptions).where(inArray(quizOptions.questionId, questionIds));
                     await tx.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz.id));
                }
                await tx.delete(quizzes).where(eq(quizzes.id, existingQuiz.id));
            });
        }
        
        await db.transaction(async (tx) => {
            const newQuizId = uuidv4();
            await tx.insert(quizzes).values({
                id: newQuizId,
                title: data.title,
                questId: data.questId,
                passingScore: data.passingScore,
            });

            for (const questionData of data.questions) {
                const newQuestionId = uuidv4();
                await tx.insert(quizQuestions).values({
                    id: newQuestionId,
                    quizId: newQuizId,
                    text: questionData.text,
                    type: questionData.type,
                });

                if (questionData.options && questionData.options.length > 0) {
                    const optionsToInsert = questionData.options.map(opt => ({
                        id: uuidv4(),
                        questionId: newQuestionId,
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                    }));
                    await tx.insert(quizOptions).values(optionsToInsert);
                }
            }
        });
        
        revalidatePath(`/admin/quests/quiz-builder`);
        revalidatePath(`/quests/${data.questId}`);
        
        return { success: true, message: "Quiz sauvegardé avec succès." };

    } catch (error: any) {
        console.error("Error saving quiz:", error);
        return { success: false, message: "Une erreur interne est survenue." };
    }
}

export async function getQuizByQuestId(questId: string) {
    if (!questId) return null;

    try {
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.questId, questId),
            with: {
                questions: {
                    with: {
                        options: true
                    }
                }
            }
        });
        return quiz;
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return null;
    }
}
