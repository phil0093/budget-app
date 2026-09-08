import { app } from "./firebase-config.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const auth = getAuth(app);

export { auth };

const provider = new GoogleAuthProvider();

// Remplacer par vos vraies adresses Gmail
const utilisateursAutorises = [
    "philippe@gmail.com",
    "epouse@gmail.com"
];

window.loginGoogle = async function () {

    try {

        const result = await signInWithPopup(
            auth,
            provider
        );

        const email = result.user.email;

        if (!utilisateursAutorises.includes(email)) {

            alert(
                `L'adresse ${email} n'est pas autorisée.`
            );

            await signOut(auth);

            return;
        }

    } catch (e) {

        console.error("Erreur connexion :", e);

        alert(
            "Erreur lors de la connexion Google."
        );
    }
};

window.logout = async function () {

    try {

        await signOut(auth);

    } catch (e) {

        console.error("Erreur déconnexion :", e);

    }

};

onAuthStateChanged(auth, user => {

    const userInfo =
        document.getElementById("userInfo");

    const loginBtn =
        document.getElementById("loginBtn");

    const logoutBtn =
