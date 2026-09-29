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

    alert(
        "Notifications v5"
    );
    
    try {

        alert("1");

        const permission =
            await Notification.requestPermission();

        alert("2 : " + permission);

        const registration =
            await navigator.serviceWorker.register(
                "./firebase-messaging-sw.js"
            );

        alert("3");

        alert("3.1");

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
        
        alert("3.2");
        
        const token =
            await tokenPromise;
        
        alert("3.3");

        alert("4");

        await setDoc(
            doc(
                db,
                "devices",
                token
            ),
            {
                token
            }
        );

        alert("5");

    }
    catch(err) {

        alert(
            "ERREUR : " +
            err.message
        );

    }

}
