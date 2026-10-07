import { initializeApp,cert,applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore,FieldValue } from "firebase-admin/firestore";
const args=process.argv.slice(2),option=key=>args.includes(key)?args[args.indexOf(key)+1]:undefined;
const uid=option("--uid"),projectId=option("--project")||process.env.FIREBASE_PROJECT_ID;
if(!uid||!projectId||!/^[a-zA-Z0-9_-]{1,128}$/.test(uid)) throw Error("Uso: npm run admin:bootstrap -- --project smart-savings-4be47 --uid UID [--apply]");
if(!args.includes("--apply")) {console.log(`Vista previa: se otorgará rol admin activo al UID ${uid}, solo en smart-learn-db del proyecto ${projectId}. No se realizó conexión ni escritura. Debe ser una cuenta existente sin materias ni matrículas activas. Añade --apply para el primer administrador.`);process.exit(0);}
if(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID!==projectId) throw Error("El proyecto solicitado no coincide con FIREBASE_PROJECT_ID.");
const credential=process.env.FIREBASE_CLIENT_EMAIL&&process.env.FIREBASE_PRIVATE_KEY?cert({projectId,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,"\n")}):applicationDefault();
const app=initializeApp({projectId,credential}),db=getFirestore(app,"smart-learn-db");
const account=await getAuth(app).getUser(uid);
if(account.disabled||!account.email) throw Error("La cuenta debe estar habilitada y tener correo electrónico.");
await db.runTransaction(async tx=>{
  const ref=db.collection("users").doc(uid),profile=(await tx.get(ref)).data();
  await tx.get(db.collection("adminControl").doc("writes"));
  const admins=await tx.get(db.collection("users").where("role","==","admin"));
  if(admins.docs.some(d=>d.data().status==="active")) throw Error("Ya existe un administrador activo. Inicia sesión con esa cuenta para gestionar usuarios.");
  const courses=await tx.get(db.collection("courses").where("teacherId","==",uid).limit(1));
  const enrollments=await tx.get(db.collection("enrollments").where("studentId","==",uid));
  if(courses.docs.length||enrollments.docs.some(d=>d.data().status==="active")) throw Error("Usa una cuenta administrativa independiente sin materias o matrículas activas.");
  const data={uid,name:profile?.name||account.displayName||account.email.split("@")[0],email:account.email,role:"admin",status:"active",updatedAt:FieldValue.serverTimestamp()};
  if(!profile)data.createdAt=FieldValue.serverTimestamp();
  tx.set(ref,data,{merge:true});
  tx.set(db.collection("adminControl").doc("writes"),{actorId:uid,updatedAt:FieldValue.serverTimestamp()});
  tx.set(db.collection("adminAudit").doc(),{actorId:uid,resource:"users",recordId:uid,action:"bootstrap",reason:"Creación inicial del administrador mediante credenciales de despliegue",before:profile?{role:profile.role,status:profile.status}:null,after:{role:"admin",status:"active"},createdAt:FieldValue.serverTimestamp()});
});
console.log("Administrador inicial creado en smart-learn-db. Cierra y vuelve a iniciar sesión en Smart Learn.");
