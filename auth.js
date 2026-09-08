import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const utilisateursAutorises = [
  "ton.adresse@gmail.com",
  "adresse.epouse@gmail.com"
];

window.loginGoogle = async function () {

  try {

    const result = await signInWithPopup(
      auth,
      provider
    );

    const email = result.user.email;

    if (!utilisateursAutorises.includes(email)) {

      alert("Utilisateur non autorisé");

      await signOut(auth);

      return;
    }

  } catch (e) {

    console.error(e);
  }
};

window.logout = async function () {

  await signOut(auth);

};

onAuthStateChanged(auth, user => {

  if (user) {

    document.getElementById("userInfo").innerHTML =
      `${user.displayName}`;

    document.getElementById("loginBtn").style.display =
      "none";

    document.getElementById("logoutBtn").style.display =
      "inline-block";

    window.currentUser = user;

  } else {

    window.currentUser = null;

    document.getElementById("userInfo").innerHTML =
      "Non connecté";

    document.getElementById("loginBtn").style.display =
      "inline-block";

    document.getElementById("logoutBtn").style.display =
      "none";
  }

});
``
