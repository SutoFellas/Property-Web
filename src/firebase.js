// Firebase ana yapılandırma ve modül dışa aktarımları
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAzcOFTStRXmgORtEywiez3ofDTzYMifp8",
  authDomain: "property-utku.firebaseapp.com",
  projectId: "property-utku",
  storageBucket: "property-utku.firebasestorage.app",
  messagingSenderId: "332430622726",
  appId: "1:332430622726:web:0b685ad58220afd71b8387",
  measurementId: "G-6NRYNVK94E"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Servisleri başlat ve dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 