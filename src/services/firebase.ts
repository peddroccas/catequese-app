import firebase from 'firebase/compat/app'
import 'firebase/compat/auth' // se você estiver usando autenticação
import 'firebase/compat/database'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Inicializar o Firebase
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth() // se estiver usando autenticação
const db = firebase.database()

export { firebase, auth, db }
