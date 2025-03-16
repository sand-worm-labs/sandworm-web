import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

if (process.env.NODE_ENV === "test") {
  // We won't be using firebase for testing for now. At some point,
  // we might want to run tests against the Staging firebase instance.
  // throw new Error(
  //   ` This will connect to the production firestore.
  //     Make sure db/firebase.ts is updated before testing against Firebase`
  // );
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

    // seedDatabase();
  } else {
    admin.initializeApp({
      storageBucket: "sandworm-8aa45.appspot.com",
    });
  }
} else if (!admin.apps.length && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log("using Firebase live DB");
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "sandworm-8aa45.appspot.com",
  });
}

const app = admin.apps[0];

const auth = getAuth();

const db = getFirestore();

if (process.env.NODE_ENV === "test") {
  console.log("🔥 Using Firestore Emulator for testing...");
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
}

export { admin, auth, db, app };
