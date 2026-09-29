import { app, db } from "../firebase-config.js";
import { auth } from "../auth.js";

import {
    doc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getMessaging,
    getToken
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";

const messaging =
    getMessaging(app);

export async function initialiserNotifications() {

    try {

        console.log("Début notifications");

        const permission =
            await Notification.requestPermission();

        console.log(
            "Permission = ",
            permission
        );

        if (
            permission !== "granted"
        ) {

            console.log(
                "Permission refusée"
            );

            return null;

        }

        const token =
            await getToken(
                messaging,
                {
                    vapidKey:
                        "..."
                }
            );

        console.log(
            "Token = ",
            token
        );

        if (!token) {

            console.log(
                "Token vide"
            );

            return null;

        }

        await setDoc(
            doc(
                db,
                "devices",
                token
            ),
            {
                token,
                utilisateur:
                    auth.currentUser?.email || "",
                nom:
                    auth.currentUser?.displayName || "",
                dateMaj:
                    new Date().toISOString()
            }
        );

        console.log(
            "Document enregistré"
        );

        return token;

    }
    catch(err) {

        console.error(
            "Erreur notifications",
            err
        );

    }

}
