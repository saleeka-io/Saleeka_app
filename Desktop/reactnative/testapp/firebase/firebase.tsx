// src/firebase/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDAJ8CI7pIbkb_C_wBKd-62HN0h-s3qa4U",

  authDomain: "saleeka-fbe0c.firebaseapp.com",

  projectId: "saleeka-fbe0c",

  storageBucket: "saleeka-fbe0c.appspot.com",

  messagingSenderId: "8812673758",

  appId: "1:8812673758:web:117b26b82284a9f9c7e04f",

  measurementId: "G-RL50FGSS0R"

};


function createFirebaseApp(): FirebaseApp {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    } else {
        return getApps()[0]; // Return the already initialized app
    }
}

const app = createFirebaseApp();
const auth = getAuth(app);

export { app, auth };
