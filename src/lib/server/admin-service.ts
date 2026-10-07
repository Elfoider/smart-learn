import { FieldValue, FieldPath, Timestamp, type DocumentData, type Transaction, type DocumentReference } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { adminSchemas, type AdminResource } from "@/lib/admin/catalog";
import { AdminError } from "@/lib/server/admin-auth";
const collections = ["courses", "sections", "enrollments", "lessonPlans", "assessments", "materials", "onlineClasses", "grades", "attendance"] as const;
const now = () => FieldValue.serverTimestamp();
function safe(value: unknown): unknown {
    if (value instanceof Timestamp)
        return value.toDate().toISOString();
    if (Array.isArray(value))
        return value.map(safe);
    if (value && typeof value === "object")
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, safe(v)]));
    return value;
}
export function serializeAdminRecord(id: string, data: DocumentData) { return { ...safe(data) as Record<string, unknown>, id }; }
export async function adminList(resource: AdminResource | "adminAudit" | "aiLogs", cursor?: string) {
    const db = getAdminDb();
    if (resource === "settings") {
        const data = (await db.collection("systemSettings").doc("general").get()).data();
        return { records: [{ id: "general", institutionName: "Smart Learn", academicPeriod: "2026-III", supportEmail: "", announcement: "", dailyAiLimit: 50, ...safe(data || {}) as Record<string, unknown> }], nextCursor: null };
    }
    let query = db.collection(resource).orderBy(resource === "adminAudit" || resource === "aiLogs" ? "createdAt" : FieldPath.documentId(), resource === "adminAudit" || resource === "aiLogs" ? "desc" : "asc").limit(51);
    if (cursor) {
        const last = await db.collection(resource).doc(cursor).get();
        if (!last.exists)
            throw new AdminError("El marcador ya no existe. Vuelve a la primera página.", 409);
        query = query.startAfter(last);
    }
    const snap = await query.get();
    return { records: snap.docs.slice(0, 50).map(d => serializeAdminRecord(d.id, d.data())), nextCursor: snap.docs.length > 50 ? snap.docs[49].id : null };
}
export async function adminSummary() {
    const db = getAdminDb();
    const keys = ["users", ...collections, "adminAudit", "aiLogs"];
    const counts = await Promise.all(keys.map(async (name) => [name, (await db.collection(name).count().get()).data().count]));
    const auth = getAdminAuth();
    return { counts: Object.fromEntries(counts), ai: { provider: process.env.AI_PROVIDER || "gemini", model: process.env.OLLAMA_MODEL || "", gatewayConfigured: Boolean(process.env.LOCAL_AI_URL && process.env.LOCAL_AI_TOKEN), fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== "false" }, authAvailable: Boolean(auth), database: "smart-learn-db", generatedAt: new Date().toISOString() };
}
async function checkActor(tx: Transaction, uid: string) {
    const db = getAdminDb();
    const actor = (await tx.get(db.collection("users").doc(uid))).data();
    if (actor?.role !== "admin" || actor.status !== "active")
        throw new AdminError("Tu acceso administrativo cambió. Inicia sesión nuevamente.", 403);
    // Serializa las operaciones administrativas, incluidas promociones y transferencias.
    await tx.get(db.collection("adminControl").doc("writes"));
}
function audit(tx: Transaction, uid: string, resource: string, id: string, reason: string, before: DocumentData | null, after: DocumentData) {
    const db = getAdminDb();
    tx.set(db.collection("adminAudit").doc(), { actorId: uid, resource, recordId: id, action: before ? "update" : "create", reason, before: safe(before), after: safe(after), createdAt: now() });
    tx.set(db.collection("adminControl").doc("writes"), { updatedAt: now(), actorId: uid });
}
const fail = (message: string, status = 409): never => { throw new AdminError(message, status); };
async function getDoc(tx: Transaction, collection: string, id: string) {
    const snap = await tx.get(getAdminDb().collection(collection).doc(id));
    if (!snap.exists)
        fail(`No existe el registro seleccionado en ${collection}.`, 404);
    return snap.data()!;
}
async function activeProfile(tx: Transaction, id: string, role: string) {
    const data = await getDoc(tx, "users", id);
    if (data.role !== role || data.status !== "active")
        fail(`Selecciona un ${role === "teacher" ? "docente" : "estudiante"} activo.`);
    return data;
}
function changed(a: unknown, b: unknown) { return JSON.stringify(a) !== JSON.stringify(b); }
export async function adminSave(uid: string, resource: AdminResource, id: string | null, raw: unknown, reason: string) {
    const parsed = adminSchemas[resource].safeParse(raw);
    if (!parsed.success)
        throw new AdminError(parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).slice(0, 4).join(" · "));
    const data: Record<string, unknown> = { ...parsed.data };
    const db = getAdminDb();
    if (resource === "settings")
        id = "general";
    if (resource === "users" && !id)
        fail("Crea o vincula el usuario mediante su correo.", 400);
    if (resource === "enrollments") {
        const expected = `${data.courseId}--${data.studentId}`;
        if (id && id !== expected)
            fail("La materia y el estudiante de una matrícula no se pueden sustituir.");
        id = expected;
    }
    if (resource === "grades") {
        const expected = `${data.assessmentId}--${data.studentId}`;
        if (id && id !== expected)
            fail("La evaluación y el estudiante de una nota son inmutables.");
        id = expected;
    }
    const collection = db.collection(resource === "settings" ? "systemSettings" : resource);
    const ref = id ? collection.doc(id) : collection.doc();
    return db.runTransaction(async (tx) => {
        await checkActor(tx, uid);
        const oldSnap = await tx.get(ref);
        if (id && !oldSnap.exists && !["enrollments", "grades", "settings"].includes(resource))
            fail("El registro ya no existe.", 404);
        const old = oldSnap.exists ? oldSnap.data()! : null;
        let targetRef = ref;
        let auditBefore = old;
        const patch: Record<string, unknown> = { ...data, updatedAt: now() };
        const extraWrites: {
            ref: DocumentReference;
            data: DocumentData;
        }[] = [];
        if (resource === "users") {
            if (uid === ref.id && (data.role !== "admin" || data.status !== "active"))
                fail("No puedes retirar tu propio acceso administrativo.");
            if (old?.role !== data.role) {
                const courses = await tx.get(db.collection("courses").where("teacherId", "==", ref.id).limit(1));
                const enrolled = await tx.get(db.collection("enrollments").where("studentId", "==", ref.id));
                if (courses.docs.length || enrolled.docs.some(d => d.data().status === "active"))
                    fail("Reasigna sus materias y desactiva sus matrículas antes de cambiar el rol.");
            }
            // El bloqueo de la propia cuenta mantiene al menos un administrador activo.
        }
        else if (resource === "settings") {
            // Solo parámetros académicos; credenciales y endpoints permanecen fuera de Firestore.
        }
        else if (resource === "courses") {
            await activeProfile(tx, String(data.teacherId), "teacher");
            if (old && old.teacherId !== data.teacherId) {
                const related = await Promise.all(collections.filter(n => n !== "courses").map(n => tx.get(db.collection(n).where("courseId", "==", ref.id))));
                const docs = related.flatMap(s => s.docs);
                if (docs.length > 400)
                    fail("Esta materia supera 400 registros asociados. La transferencia requiere una migración planificada.");
                for (const doc of docs)
                    extraWrites.push({ ref: doc.ref, data: { teacherId: data.teacherId, updatedAt: now() } });
                patch.transferredAt = now();
            }
            if (!old) {
                patch.sectionsCount = 0;
                patch.studentsCount = 0;
            }
        }
        else {
            const course = await getDoc(tx, "courses", String(data.courseId));
            patch.teacherId = course.teacherId;
            if (old && old.courseId !== data.courseId)
                fail("La materia de un registro existente no puede cambiar.");
            if (resource === "sections") {
                if (data.startTime && data.endTime && String(data.endTime) <= String(data.startTime))
                    fail("La hora final debe ser posterior al inicio.", 400);
                const registered = await tx.get(db.collection("enrollments").where("sectionId", "==", ref.id));
                if (registered.docs.filter(d => d.data().status === "active").length > Number(data.capacity))
                    fail("La capacidad no puede ser menor que las matrículas activas.");
                if (!old)
                    extraWrites.push({ ref: db.collection("courses").doc(String(data.courseId)), data: { sectionsCount: FieldValue.increment(1), updatedAt: now() } });
            }
            else if (resource === "enrollments") {
                const student = await getDoc(tx, "users", String(data.studentId));
                const section = await getDoc(tx, "sections", String(data.sectionId));
                if (section.courseId !== data.courseId || section.teacherId !== course.teacherId)
                    fail("La sección no pertenece a la materia.");
                if (student.role !== "student")
                    fail("El perfil seleccionado no es estudiante.");
                if (data.status === "active") {
                    if (student.status !== "active" || section.status !== "active" || course.status !== "active")
                        fail("Materia, sección y estudiante deben estar activos para matricular.");
                    const registered = await tx.get(db.collection("enrollments").where("sectionId", "==", String(data.sectionId)));
                    if (registered.docs.filter(d => d.id !== ref.id && d.data().status === "active").length >= Number(section.capacity || 30))
                        fail("La sección alcanzó su capacidad.");
                }
                if (old && old.sectionId !== data.sectionId) {
                    const history = await Promise.all(["grades", "attendance"].map(n => tx.get(db.collection(n).where("courseId", "==", String(data.courseId)).where("studentId", "==", String(data.studentId)).limit(1))));
                    if (history.some(s => s.docs.length))
                        fail("La matrícula tiene notas o asistencia. Conserva su sección para mantener la trazabilidad.");
                }
                patch.studentName = student.name || "Estudiante";
                patch.studentEmail = student.email || "";
                patch.studentPhotoURL = student.photoURL || null;
                patch.id = ref.id;
                if (!old)
                    patch.enrolledAt = now();
                const delta = (data.status === "active" ? 1 : 0) - (old?.status === "active" ? 1 : 0);
                if (delta)
                    extraWrites.push({ ref: db.collection("courses").doc(String(data.courseId)), data: { studentsCount: FieldValue.increment(delta), updatedAt: now() } });
            }
            else if (resource === "grades" || resource === "attendance") {
                const student = await activeProfile(tx, String(data.studentId), "student");
                const enrollment = await getDoc(tx, "enrollments", `${data.courseId}--${data.studentId}`);
                if (enrollment.status !== "active" || enrollment.teacherId !== course.teacherId)
                    fail("Se requiere matrícula activa en esta materia.");
                patch.sectionId = enrollment.sectionId;
                if (old && old.studentId !== data.studentId)
                    fail("El estudiante de este registro no puede cambiar.");
                if (resource === "grades") {
                    const assessment = await getDoc(tx, "assessments", String(data.assessmentId));
                    if (assessment.courseId !== data.courseId || assessment.teacherId !== course.teacherId || (assessment.sectionId && assessment.sectionId !== enrollment.sectionId))
                        fail("La evaluación no corresponde a la matrícula.");
                    const max = Number(assessment.maxScore), score = Number(data.score), weight = Number(assessment.weightPercentage || 0);
                    if (!Number.isFinite(max) || max <= 0 || score > max)
                        fail("La puntuación supera el máximo de la evaluación.", 400);
                    Object.assign(patch, { enrollmentId: `${data.courseId}--${data.studentId}`, studentName: student.name || "Estudiante", studentEmail: student.email || "", assessmentTitle: assessment.title, maxScore: max, weightPercentage: weight, normalizedPercentage: Math.round(score / max * 10000) / 100, weightedPoints: Math.round(score / max * weight * 100) / 100, gradedAt: now(), publishedAt: data.status === "published" ? now() : null });
                }
                else {
                    if (old && old.date !== data.date)
                        fail("La fecha de una asistencia existente no puede cambiar.");
                    if (!old) {
                        targetRef = db.collection("attendance").doc([data.courseId, enrollment.sectionId, data.date, data.studentId].join("--"));
                        auditBefore = (await tx.get(targetRef)).data() || null;
                    }
                }
            }
            else {
                if (data.sectionId) {
                    const section = await getDoc(tx, "sections", String(data.sectionId));
                    if (section.courseId !== data.courseId || section.teacherId !== course.teacherId)
                        fail("La sección no pertenece a la materia.");
                }
                if (resource === "assessments") {
                    if (Number(data.passingScore) > Number(data.maxScore))
                        fail("La puntuación mínima supera el máximo.", 400);
                    const rubric = data.rubric as {
                        id: string;
                        points: number;
                    }[];
                    if (new Set(rubric.map(r => r.id)).size !== rubric.length || rubric.reduce((a, r) => a + r.points, 0) > Number(data.maxScore))
                        fail("La rúbrica contiene criterios repetidos o supera la puntuación máxima.", 400);
                    if (old && ["maxScore", "weightPercentage", "sectionId", "rubric"].some(k => changed(old[k], data[k]))) {
                        const grades = await tx.get(db.collection("grades").where("assessmentId", "==", ref.id).limit(1));
                        if (grades.docs.length)
                            fail("Esta evaluación tiene calificaciones. Su escala, ponderación, sección y rúbrica se conservan.");
                    }
                }
                for (const [start, end] of [["startDate", "endDate"], ["opensAt", "closesAt"]])
                    if (data[start] && data[end] && Date.parse(String(data[end])) < Date.parse(String(data[start])))
                        fail("La fecha final debe ser posterior al inicio.", 400);
                if (data.status === "archived")
                    patch.visibleToStudents = false;
                if (patch.visibleToStudents && !old?.visibleToStudents)
                    patch.publishedAt = now();
            }
        }
        if (!auditBefore)
            patch.createdAt = now();
        for (const write of extraWrites)
            tx.update(write.ref, write.data);
        tx.set(targetRef, patch, { merge: true });
        audit(tx, uid, resource, targetRef.id, reason, auditBefore, { ...auditBefore, ...data, ...Object.fromEntries(Object.entries(patch).filter(([, v]) => !(v instanceof FieldValue))) });
        return { id: targetRef.id };
    });
}
export async function createAdminUser(uid: string, input: {
    email: string;
    name: string;
    role: "admin" | "teacher" | "student";
}, reason: string) {
    const auth = getAdminAuth();
    let account;
    let created = false;
    try {
        account = await auth.getUserByEmail(input.email);
    }
    catch (error) {
        if ((error as {
            code?: string;
        }).code !== "auth/user-not-found")
            throw error;
        account = await auth.createUser({ email: input.email, displayName: input.name });
        created = true;
    }
    if (account.disabled)
        fail("La cuenta de Firebase Authentication está deshabilitada. Revisa su acceso en Firebase Console.");
    const ref = getAdminDb().collection("users").doc(account.uid);
    // No se crean contraseñas ni se modifican cuentas compartidas por otras aplicaciones.
    await getAdminDb().runTransaction(async (tx) => {
        await checkActor(tx, uid);
        const old = await tx.get(ref);
        if (old.exists)
            fail("Este correo ya tiene perfil en Smart Learn. Edítalo en Usuarios.");
        const data = { uid: account.uid, email: account.email || input.email, name: input.name, role: input.role, status: "active", photoURL: account.photoURL || null, createdAt: now(), updatedAt: now() };
        tx.set(ref, data);
        audit(tx, uid, "users", ref.id, reason, null, { uid: ref.id, email: data.email, name: data.name, role: data.role, status: data.status });
    });
    return { id: account.uid, authCreated: created };
}
export async function adminReport() {
    const db = getAdminDb();
    const snapshots = await Promise.all(["courses", "enrollments", "grades", "attendance"].map(n => db.collection(n).limit(5001).get()));
    if (snapshots.some(s => s.docs.length > 5000))
        throw new AdminError("El reporte supera 5000 registros por colección. Exporta por páginas desde cada módulo para revisar todos los datos.", 409);
    const [courses, enrollments, grades, attendance] = snapshots.map(s => s.docs.map(d => ({ ...d.data(), id: d.id } as DocumentData)));
    return { records: courses.map(course => {
            const scored = grades.filter(g => g.courseId === course.id && g.status === "published" && typeof g.score === "number" && typeof g.maxScore === "number" && g.maxScore > 0);
            const marked = attendance.filter(a => a.courseId === course.id);
            return { id: course.id, name: course.name, period: course.period, status: course.status, activeEnrollments: enrollments.filter(e => e.courseId === course.id && e.status === "active").length, publishedGrades: scored.length, averagePercentage: scored.length ? Math.round(scored.reduce((n, g) => n + g.score / g.maxScore * 100, 0) / scored.length * 100) / 100 : null, attendancePercentage: marked.length ? Math.round(marked.filter(a => ["present", "late"].includes(a.status)).length / marked.length * 10000) / 100 : null };
        }), nextCursor: null, generatedAt: new Date().toISOString() };
}
