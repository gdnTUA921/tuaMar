// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9b04QEi7jyX8tguaeqyECbkw0i1l2S_o",
  authDomain: "tuamar-a7cfe.firebaseapp.com",
  databaseURL: "https://tuamar-a7cfe-default-rtdb.firebaseio.com",
  projectId: "tuamar-a7cfe",
  storageBucket: "tuamar-a7cfe.firebasestorage.app",
  messagingSenderId: "388938576760",
  appId: "1:388938576760:web:37c44b8c53762751128e8d",
  measurementId: "G-RLN8MLMM8E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

//const analytics = getAnalytics(app);
const database = getDatabase(app);
export { database }; //fpr exporting the database
export { auth, googleProvider };