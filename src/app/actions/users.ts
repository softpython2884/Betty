
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type UpdateUserData = {
    name: string;
    title: string;
};

export async function updateUser(userId: string, data: UpdateUserData): Promise<{ success: boolean; message: string }> {
    try {
        const result = await db.update(users)
            .set({
                name: data.name,
                title: data.title,
            })
            .where(eq(users.id, userId));

        if (result.changes === 0) {
            return { success: false, message: "User not found or no changes made." };
        }

        revalidatePath("/profile");
        return { success: true, message: "Profile updated successfully." };

    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}
