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

// Remplace ces adresses par les vraies
const utilisateursAutorises = [
    "philippefrossard0093@gmail.com",
    "marion.gathelier@laposte.net"
];

window.loginGoogle = async function () {

    try {

        const result = await signInWithPopup(
            auth,
            provider
        );

        const email = result.user.email;

        if (!utilisateursAutorises.includes(email)) {

            alert(`Adresse non autorisée : ${email}`);

            await signOut(auth);

            return;
        }

    } catch (e) {

        console.error("Erreur connexion :", e);

        alert("Erreur lors de la connexion Google.");
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
        document.getElementById("logoutBtn");

    if (user) {

        window.currentUser = user;

        if (userInfo) {

            userInfo.innerHTML =
                `${user.displayName}<br>${user.email}`;

        }

        if (loginBtn) {

            loginBtn.style.display = "none";

        }

        if (logoutBtn) {

            logoutBtn.style.display = "inline-block";

        }

        console.log(
            "Connecté :",
            user.displayName,
            user.email,
            user.uid
        );

    } else {

        window.currentUser = null;

        if (userInfo) {

            userInfo.innerHTML = "Non connecté";

        }

        if (loginBtn) {

            loginBtn.style.display = "inline-block";

        }

        if (logoutBtn) {

            logoutBtn.style.display = "none";

        }

    }

});
