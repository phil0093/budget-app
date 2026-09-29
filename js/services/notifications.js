import { app, db }
from "../firebase-config.js";

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

    alert(
        "Permission actuelle : " +
        Notification.permission
    );

    const permission =
        await Notification.requestPermission();

    alert(
        "Résultat : " +
        permission
    );

    if (
        permission !== "granted"
    ) {

        alert(
            "Notifications refusées"
        );

        return null;

    }

    alert(
        "Notifications autorisées"
    );

    return null;

}
