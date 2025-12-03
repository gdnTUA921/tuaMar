// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAln2Z26v1XkZoMeKEvdU5LrpK6FQGOV_s",
  authDomain: "tua-market.firebaseapp.com",
  databaseURL: "https://tua-market-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tua-market",
  storageBucket: "tua-market.firebasestorage.app",
  messagingSenderId: "68010332147",
  appId: "1:68010332147:web:9bef99a4a4d916a5604c86",
  measurementId: "G-J8LES72LMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const storage = getStorage(app);
//const analytics = getAnalytics(app);
const database = getDatabase(app);
export { database }; //fpr exporting the database
export { auth, googleProvider };
export { storage };