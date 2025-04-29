import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import seedDatabase from "../localDb/seed";

const baseConfig = {
  projectId: "sandworm-8aa45",
  storageBucket: "sandworm-8aa45.appspot.com",
};

if (!admin.apps.length) {
  if (process.env.NODE_ENV === "test") {
    console.log("🔥 Initializing Firebase for tests");
    admin.initializeApp(baseConfig);
  } else if (process.env.NODE_ENV === "development") {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log("🔥 Using Firebase emulator DB");
      admin.initializeApp(baseConfig);
      seedDatabase().then(() => console.log("🌱 Seeded database"));
    } else {
      console.log("🔥 Initializing Firebase for dev (non-emulator)");
      admin.initializeApp(baseConfig);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("🔥 Using Firebase live DB");
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: baseConfig.storageBucket,
    });
  } else {
    console.error("❌ Firebase failed to initialize: missing credentials");
  }
}

const app = admin.apps[0];
const auth = getAuth();
const db = getFirestore();

if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log("🔥 Using Firestore Emulator for testing...");
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
}

export { admin, auth, db, app };
