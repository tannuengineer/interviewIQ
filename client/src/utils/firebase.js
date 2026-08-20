import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyACcYZ40hbay_kzmk06u_-91-1IlzI0-p8",
    authDomain: "interviewiq-103a0.firebaseapp.com",
    projectId: "interviewiq-103a0",
    storageBucket: "interviewiq-103a0.firebasestorage.app",
    messagingSenderId: "858443713459",
    appId: "1:858443713459:web:1e7f31c62be7f1c460d9c6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});