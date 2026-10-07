import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { getDailyAiLimit } from "@/lib/ai/limits";

// Un cupo por solicitud admitida; las solicitudes fallidas también cuentan.
export async function consumeAiUsage(userId: string) {
  const db = getAdminDb();
  const date = new Date().toISOString().slice(0, 10);
  const ref = db.collection("users").doc(userId).collection("aiUsage").doc(date);

  return db.runTransaction(async tx => {
    const configured = (await tx.get(db.collection("systemSettings").doc("general"))).data()?.dailyAiLimit;
    const limit = typeof configured === "number" && Number.isInteger(configured) && configured >= 1 && configured <= 200 ? configured : getDailyAiLimit();
    const stored = (await tx.get(ref)).data()?.count;
    const count = typeof stored === "number" && Number.isFinite(stored) ? Math.max(0, Math.trunc(stored)) : 0;
    if (count >= limit) return { allowed: false, remaining: 0 };
    tx.set(ref, { date, count: count + 1, limit, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { allowed: true, remaining: limit - count - 1 };
  });
}
