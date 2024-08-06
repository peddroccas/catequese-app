import firebase from 'firebase/compat/app'
import 'firebase/compat/auth' // se você estiver usando autenticação
import 'firebase/compat/database'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_ApiKey,
  authDomain: import.meta.env.VITE_AuthDomain,
  projectId: import.meta.env.VITE_ProjectId,
  storageBucket: import.meta.env.VITE_StorageBucket,
  messagingSenderId: import.meta.env.VITE_MessagingSenderId,
  appId: import.meta.env.VITE_AppId,
}

// Inicializar o Firebase
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth() // se estiver usando autenticação
const db = firebase.database()

export { firebase, auth, db }
