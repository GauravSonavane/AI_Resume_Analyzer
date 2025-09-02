// ~/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAy-9Xk1BVgfhyxtzB7qifV6MtM9suHGng",
    authDomain: "resumap.firebaseapp.com",
    projectId: "resumap",
    storageBucket: "resumap.firebasestorage.app",
    messagingSenderId: "702797807",
    appId: "1:702797807:web:f238271fc93fdebeec081a",
    measurementId: "G-RQQDXBN482"
};

export const app = initializeApp(firebaseConfig);

// Only initialize analytics in the browser
export let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
            console.log("Firebase Analytics enabled");
        } else {
            console.log("Firebase Analytics not supported in this environment");
        }
    });
}
