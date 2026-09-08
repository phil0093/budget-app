import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore
} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "XXX",

    authDomain: "XXX",

    projectId: "XXX",

    storageBucket: "XXX",

    messagingSenderId: "XXX",

    appId: "XXX"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
