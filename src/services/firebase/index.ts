import  admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import seedDatabase from "../localDb/seed";

if (process.env.NODE_ENV === "test") {
  console.log("initialize");
  admin.initializeApp({
    projectId: "sandworm-8aa45",
    storageBucket: "sandworm-8aa45.appspot.com",
  });
}

if (!admin.apps.length && process.env.NODE_ENV === "development") {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log("using Firebase **emulator** DB");

    admin.initializeApp({
      projectId: "sandworm-8aa45",
      storageBucket: "sandworm-8aa45.appspot.com",
    });
    seedDatabase().then(() => console.log("seeded database"));
  } else {
    // console.log("initialize 2");

    // admin.initializeApp({
    //    projectId: "sandworm-8aa45",
    //   storageBucket: "sandworm-8aa45.appspot.com",
    // });
  }
} else if (!admin.apps.length && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log("using Firebase live DB");
  console.log("initialize 3");
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "sandworm-8aa45.appspot.com",
  });
}

const app = admin.apps[0];

const auth = getAuth();

const db = getFirestore();

console.log("🔥 Using Firestore Emulator for testing...");
db.settings({
  host: "localhost:8080",
  ssl: false,
});

export { admin, auth, db, app };
