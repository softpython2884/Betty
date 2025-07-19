
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export type UserWithRole = Omit<User, 'password' | 'flowUpUuid' | 'mustChangePassword' | 'createdAt' | 'flowUpFpat'>;

export type InviteUserInput = {
    name: string;
    email: string;
    role: 'student' | 'professor';
};

export type InviteUserResult = {
    email: string;
    password?: string;
};

export async function getAllUsers(): Promise<UserWithRole[]> {
    const userList = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        level: users.level,
        xp: users.xp,
        orbs: users.orbs,
        title: users.title,
        avatar: users.avatar,
    }).from(users);

    return userList;
}

export async function inviteUser(data: InviteUserInput): Promise<{ success: boolean; message: string; result?: InviteUserResult }> {
    try {
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, data.email),
        });

        if (existingUser) {
            return { success: false, message: 'User with this email already exists.' };
        }

        const temporaryPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        await db.insert(users).values({
            id: uuidv4(),
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            status: 'invited',
            createdAt: new Date(),
            mustChangePassword: true,
        });

        revalidatePath('/admin/users');

        return {
            success: true,
            message: 'User invited successfully.',
            result: { email: data.email, password: temporaryPassword },
        };
    } catch (error: any) {
        console.error('Error inviting user:', error);
        return { success: false, message: `An internal server error occurred: ${error.message}` };
    }
}


type UpdateUserData = {
    name?: string;
    avatar?: string;
    flowUpUuid?: string;
    flowUpFpat?: string;
};

export async function updateUser(userId: string, data: UpdateUserData): Promise<{ success: boolean; message: string }> {
    try {
        const result = await db.update(users)
            .set(data)
            .where(eq(users.id, userId));

        if (result.changes === 0) {
            return { success: false, message: "User not found or no changes made." };
        }

        revalidatePath("/profile");
        revalidatePath(`/profile/${userId}`);
        revalidatePath('/dashboard');
        return { success: true, message: "Profile updated successfully." };

    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

export type UpdateUserByAdminInput = {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'professor' | 'admin';
    status: 'active' | 'invited';
};

export async function updateUserByAdmin(data: UpdateUserByAdminInput): Promise<{ success: boolean; message: string }> {
    try {
        const result = await db.update(users)
            .set({
                name: data.name,
                email: data.email,
                role: data.role,
                status: data.status,
            })
            .where(eq(users.id, data.id));
        
        if (result.changes === 0) {
            return { success: false, message: "User not found or no changes made." };
        }
        
        revalidatePath('/admin/users');
        return { success: true, message: "User updated successfully." };

    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { success: false, message: "This email is already in use by another user." };
        }
        console.error("Error updating user by admin:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

export async function resetUserPassword(userId: string): Promise<{ success: boolean; message: string; result?: InviteUserResult }> {
    try {
        const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        const temporaryPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        await db.update(users).set({
            password: hashedPassword,
            mustChangePassword: true
        }).where(eq(users.id, userId));

        revalidatePath('/admin/users');

        return {
            success: true,
            message: 'Password reset successfully.',
            result: { email: user.email, password: temporaryPassword },
        };
    } catch (error: any) {
        console.error('Error resetting password:', error);
        return { success: false, message: `An internal server error occurred: ${error.message}` };
    }
}

export async function changePassword(userId: string, newPassword: string): Promise<{ success: boolean, message: string }> {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.update(users)
            .set({ 
                password: hashedPassword,
                mustChangePassword: false 
            })
            .where(eq(users.id, userId));

        return { success: true, message: 'Password updated successfully!' };
    } catch (error) {
        console.error("Error changing password:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}
