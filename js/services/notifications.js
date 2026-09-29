import { app } from "../firebase-config.js";

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

    if (permission !== "granted") {

        console.log("Notifications refusées");

        return null;

    }

    const token =
        await getToken(messaging, {
                vapidKey:
                    "BA65h3QaFlA-leZVFxMwq5UTqHD6dYgJ-tgRP7XBzKBjK4wM8xbQN3LzQRNRjBmGzskIoI7vgZsRrl2SjyYoXCQ"
            }
        );

    console.log("Token :", token);

    return token;

}
