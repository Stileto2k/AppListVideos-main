import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJQE0cPpoNUUXb3movbZ3hblNShm9_FGk",
  authDomain: "provavideos.firebaseapp.com",
  projectId: "provavideos",
  storageBucket: "provavideos.firebasestorage.app",
  messagingSenderId: "941352443086",
  appId: "1:941352443086:web:72fb64149e33fe491d849f",
  measurementId: "G-QRZCBJP1K3"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportar la instancia de autenticación y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
