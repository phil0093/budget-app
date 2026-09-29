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

    const permission =
        await Notification.requestPermission();

    if (
        permission !== "granted"
    ) {

        alert(
            "Notifications refusées"
        );

        return null;

    }

    const token =
        await getToken(
            messaging,
            {
                vapidKey:
                    "BA65h3QaFlA-leZVFxMwq5UTqHD6dYgJ-tgRP7XBzKBjK4wM8xbQN3LzQRNRjBmGzskIoI7vgZsRrl2SjyYoXCQ"
            }
        );

    await setDoc(
        doc(
            db,
            "devices",
            token
        ),
        {
            token,
            dateMaj:
                new Date().toISOString()
        }
    );

    alert(
        "Notifications activées"
    );

    return token;

}
