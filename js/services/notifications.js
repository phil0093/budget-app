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

        const permission =
            await Notification.requestPermission();

        const registration =
            await navigator.serviceWorker.register(
                "./firebase-messaging-sw.js"
            );

        const tokenPromise =
            getToken(
                messaging,
                {
                    vapidKey:
                        "BA65h3QaFlA-leZVFxMwq5UTqHD6dYgJ-tgRP7XBzKBjK4wM8xbQN3LzQRNRjBmGzskIoI7vgZsRrl2SjyYoXCQ",
                    serviceWorkerRegistration:
                        registration
                }
            );
        
        const token =
            await tokenPromise;
        
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
                dateMaj:
                    new Date().toISOString(),
                test:
                    "VERSION_PUSH_V1"
            }
        );
        
    }
    catch(err) {

        alert(
            "ERREUR : " +
            err.message
        );

    }

}
