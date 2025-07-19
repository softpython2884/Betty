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
    const userUuid = process.env.FLOWUP_ADMIN_UUID;
    
    if (!userUuid) {
        throw new Error("FlowUp Admin UUID is not configured in environment variables.");
    }

    const payload = {
        userUuid,
        name,
        description,
        isPrivate: true,
    };

    try {
        const result = await callFlowUpApi("createProject", payload);
        // The API returns the project object directly at the root.
        if (result && result.uuid) {
            return result as FlowUpProject;
        } else {
            console.error("FlowUp API did not return a project object in the expected format.", result);
            return null;
        }
    } catch (error) {
        console.error("Failed to create project via FlowUp API:", error);
        return null;
    }
}


export async function addMemberToFlowUpProject(projectUuid: string, emailToInvite: string): Promise<any> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }
    
    const actionUserUuid = process.env.FLOWUP_ADMIN_UUID;
     if (!actionUserUuid) {
        throw new Error("FlowUp Admin UUID is not configured in environment variables.");
    }

    const payload = {
        userUuid: actionUserUuid,
        projectUuid,
        emailToInvite,
        role: "editor", // Default role
    };

    return await callFlowUpApi("addMember", payload);
}

export async function listFlowUpProjectMembers(projectUuid: string): Promise<FlowUpMember[]> {
    const user = await getCurrentUser();
     if (!user) {
        throw new Error("User not authenticated.");
    }
    
    const actionUserUuid = process.env.FLOWUP_ADMIN_UUID;
     if (!actionUserUuid) {
        throw new Error("FlowUp Admin UUID is not configured in environment variables.");
    }

    const payload = {
        userUuid: actionUserUuid,
        projectUuid,
    };

    try {
        const result = await callFlowUpApi("listMembers", payload);
        return result.members as FlowUpMember[];
    } catch(e) {
        console.error(`Could not list members for project ${projectUuid}`, e);
        // Return empty array on error to prevent page crash
        return [];
    }
}
