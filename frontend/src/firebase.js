// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmJPZdLfb6sL5A340O9U0-PRQa3iRMzEc",
  authDomain: "tapro-7042f.firebaseapp.com",
  projectId: "tapro-7042f",
  storageBucket: "tapro-7042f.firebasestorage.app",
  messagingSenderId: "486536030888",
  appId: "1:486536030888:web:ff0d2f18ad12eaa9a2f09d",
  measurementId: "G-Z08YTZYQFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
//const db = getFirestore(app); 

export { auth };