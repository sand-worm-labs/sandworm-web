import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import seedDatabase from "../localDb/seed";

// might reduce the amount of conditions we have to check for. this is currently shit
async function initializeFirebase() {
  if (admin.apps.length) return;

  if (
    process.env.NODE_ENV === "development" &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    console.log("🔥 Firebase: dev env");
    admin.initializeApp({
      projectId: "sandworm-8aa45",
      storageBucket: "sandworm-8aa45.appspot.com",
    });

    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log("🧪 Using Firestore emulator");
      seedDatabase().then(() => console.log("🌱 Seeded DB"));
    }
    return;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const decoded = Buffer.from(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      "base64"
    ).toString("utf-8");
    const serviceAccount = JSON.parse(decoded);

    if (!serviceAccount) {
      throw new Error("❌ Firebase service account not found");
    }

    console.log("🔥 Firebase: prod env with service account", serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "sandworm-8aa45.appspot.com",
    });
    return;
  }

  throw new Error("❌ Firebase init failed: No credentials or env match");
}

initializeFirebase().catch(console.error);

const app = admin.apps[0];
const auth = getAuth();
const db = getFirestore();

if (
  process.env.FIRESTORE_EMULATOR_HOST &&
  process.env.NODE_ENV !== "production"
) {
  db.settings({ host: "localhost:8080", ssl: false });
}

export { admin, auth, db, app };
