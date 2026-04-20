
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interview-iq-7ce29.firebaseapp.com",
  projectId: "interview-iq-7ce29",
  storageBucket: "interview-iq-7ce29.firebasestorage.app",
  messagingSenderId: "4218224192",
  appId: "1:4218224192:web:059c445c12472e25fde9a5",
  measurementId: "G-JGWNYHYH4H"
};

console.log("Firebase Init: API Key present?", !!firebaseConfig.apiKey);
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' });

export { auth, provider }