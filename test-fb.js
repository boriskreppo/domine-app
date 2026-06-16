/* global process */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6wJSq16Pf4mcz9HUZswwemkhXOcd5Ha8",
  authDomain: "domine-baza.firebaseapp.com",
  projectId: "domine-baza",
  storageBucket: "domine-baza.firebasestorage.app",
  messagingSenderId: "157121073199",
  appId: "1:157121073199:web:ff1b5daae0be78f9c576da",
  measurementId: "G-GXHC02J9DP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  console.log("Testing connection...");
  const docRef = doc(db, 'domine_data', 'test_doc');
  try {
    await setDoc(docRef, { test: "Hello World" });
    console.log("SUCCESS: Write permission granted.");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("SUCCESS: Read permission granted. Data:", docSnap.data());
    } else {
      console.log("ERROR: Document does not exist after writing.");
    }
  } catch (error) {
    console.error("FIREBASE ERROR:", error.code, error.message);
  }
  process.exit();
}

testFirebase();
