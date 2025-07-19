// @/lib/flowup.ts
"use server";

import { getCurrentUser } from "./session";

const FLOWUP_API_URL = process.env.FLOWUP_API_URL;
const FLOWUP_API_TOKEN = process.env.FLOWUP_API_TOKEN;

interface FlowUpProject {
    uuid: string;
    name: string;
    description: string;
    isPrivate: boolean;
    // ... any other fields the API returns
}

interface FlowUpMember {
    uuid: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
}

async function callFlowUpApi(action: string, payload: object): Promise<any> {
    if (!FLOWUP_API_URL || !FLOWUP_API_TOKEN) {
        throw new Error("FlowUp API environment variables are not configured.");
    }

    try {
        const response = await fetch(FLOWUP_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FLOWUP_API_TOKEN}`
            },
            body: JSON.stringify({ action, payload }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle FlowUp's specific consent error
            if (response.status === 403 && data.message?.includes('consent')) {
                 console.warn(`FlowUp consent required for user: ${(payload as any).userUuid}`);
                 // This specific error should be handled by the UI to guide the user.
                 throw new Error(`Consentement requis dans FlowUp pour l'utilisateur. Veuillez autoriser l'accès dans vos paramètres FlowUp.`);
            }
            throw new Error(data.message || `FlowUp API Error: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error(`Error calling FlowUp API action "${action}":`, error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export async function createFlowUpProject(name: string, description: string): Promise<FlowUpProject | null> {
    const user = await getCurrentUser();
    
    if (!user || !user.flowUpUuid) {
        throw new Error("Impossible de créer le projet : L'utilisateur n'est pas authentifié ou son UUID FlowUp n'est pas configuré dans son profil.");
    }

    const payload = {
        userUuid: user.flowUpUuid,
        name,
        description,
        isPrivate: true,
    };

    try {
        const result = await callFlowUpApi("createProject", payload);
        return result as FlowUpProject;
    } catch (error) {
        console.error("Failed to create project via FlowUp API:", error);
        throw error; // Rethrow to be caught by the calling function
    }
}


export async function addMemberToFlowUpProject(projectUuid: string, emailToInvite: string): Promise<any> {
    const user = await getCurrentUser();
    if (!user || !user.flowUpUuid) {
         throw new Error("Action non autorisée : L'utilisateur n'est pas authentifié ou son UUID FlowUp n'est pas configuré.");
    }

    const payload = {
        userUuid: user.flowUpUuid,
        projectUuid,
        emailToInvite,
        role: "editor", // Default role
    };

    return await callFlowUpApi("addMember", payload);
}

export async function listFlowUpProjectMembers(projectUuid: string): Promise<FlowUpMember[]> {
    const user = await getCurrentUser();
     if (!user || !user.flowUpUuid) {
        // Silently fail for this read-only operation to avoid breaking the project page for users without a linked UUID
        console.warn(`Cannot list members for project ${projectUuid}: User is not authenticated or their FlowUp UUID is not configured.`);
        return [];
    }

    const payload = {
        userUuid: user.flowUpUuid,
        projectUuid,
    };

    try {
        const result = await callFlowUpApi("listMembers", payload);
        if (result && Array.isArray(result.members)) {
             return result.members as FlowUpMember[];
        }
        return [];
    } catch(e) {
        console.error(`Could not list members for project ${projectUuid}`, e);
        // Return empty array on error to prevent page crash
        return [];
    }
}
