import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    setDoc,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function sauverMenu(
    date,
    midi,
    soir
) {

    await setDoc(
        doc(
            db,
            "menus",
            date
        ),
        {
            date,
            midi,
            soir
        }
    );

}

export async function chargerMenus() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "menus"
            )
        );

    const menus = {};

    snapshot.forEach(doc => {

        menus[doc.id] =
            doc.data();

    });

    return menus;

}

export async function supprimerMenusAnciens() {

    const aujourdHui =
        new Date()
        .toISOString()
        .split("T")[0];

    const snapshot =
        await getDocs(
            collection(
                db,
                "menus"
            )
        );

    for (const document of snapshot.docs) {

        if (
            document.id <
            aujourdHui
        ) {

            await deleteDoc(
                doc.ref
            );

        }

    }

}
