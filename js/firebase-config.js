import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore
} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2MRLuuhnYaB8xe7VoHh4koTt0UeU6kcU",
  authDomain: "budget-metp.firebaseapp.com",
  projectId: "budget-metp",
  storageBucket: "budget-metp.firebasestorage.app",
  messagingSenderId: "311289372367",
  appId: "1:311289372367:web:baa3d20ce527dfc645e1ba"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { app };
