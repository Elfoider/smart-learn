import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateAcademicText } from "@/lib/ai/generation";
async function record(userId: string, feature: string, outcome: string, provider: string, model: string) {
    try {
        await getAdminDb().collection("aiLogs").add({ userId, feature, outcome, provider, model, createdAt: FieldValue.serverTimestamp() });
    }
    catch {
        console.error("ai/log-write-failed");
    }
}
export async function generateLoggedAcademicText(userId: string, feature: string, input: Parameters<typeof generateAcademicText>[0]) {
    try {
        const result = await generateAcademicText(input);
        await record(userId, feature, "success", result.provider, result.model);
        return result;
    }
    catch (error) {
        await record(userId, feature, "failed", process.env.AI_PROVIDER || "gemini", process.env.OLLAMA_MODEL || "");
        throw error;
    }
}
