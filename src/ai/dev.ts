'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/explain-code-snippet.ts';
import '@/ai/flows/generate-code-hints.ts';
import '@/ai/flows/codex-chat.ts';
import '@/ai/flows/generate-questline-flow.ts';
import '@/ai/flows/generate-readme-flow.ts';
import '@/ai/flows/explain-concept-flow.ts';
import '@/ai/flows/generate-quiz-flow.ts';
import '@/ai/flows/grade-project-flow.ts';
import '@/ai/flows/kickstart-project-flow.ts';
import '@/ai/flows/generate-treasure-hunt-flow.ts';
import '@/ai/flows/optimize-code-flow.ts';
import '@/ai/flows/interview-simulator-flow.ts';
