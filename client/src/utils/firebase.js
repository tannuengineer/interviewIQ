import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-f6a4e.firebaseapp.com",
  projectId: "interviewiq-f6a4e",
  storageBucket: "interviewiq-f6a4e.firebasestorage.app",
  messagingSenderId: "875202036667",
  appId: "1:875202036667:web:8857d0a67f2b6456e67a9e",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// ⭐ Ye 3 lines add karo
provider.setCustomParameters({
    prompt: "select_account",
});

export { auth, provider };