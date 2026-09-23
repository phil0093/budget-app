import { db } from "../firebase-config.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerRdvJour(date) {

    const docRef =
        doc(
            db,
            "calendrier",
            date
        );

    const snap =
        await getDoc(
            docRef
        );

    if (!snap.exists()) {

        return [];

    }

    return snap.data().rdvs || [];

}

export async function chargerRdvsMois() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "rdvs"
            )
        );

    const resultat = {};

    snapshot.forEach(doc => {

        const data =
            doc.data();

        const date =
            data.date;

        if (!resultat[date]) {

            resultat[date] = [];

        }

        resultat[date].push({

            id: doc.id,
            ...data

        });

    });

    return resultat;

}

export async function ajouterRdv(date, rdv) {

    const docRef =
        doc(
            db,
            "calendrier",
            date
        );

    const snap =
        await getDoc(
            docRef
        );

    let rdvs = [];

    if (snap.exists()) {

        rdvs =
            snap.data().rdvs || [];

    }

    rdv.id =
        crypto.randomUUID();

    rdvs.push(rdv);

    await setDoc(
        docRef,
        {
            rdvs
        }
    );

}

export async function modifierRdv(
    date,
    id,
    nouvellesValeurs
) {

    const docRef =
        doc(
            db,
            "calendrier",
            date
        );

    const snap =
        await getDoc(
            docRef
        );

    if (!snap.exists()) {
        return;
    }

    const rdvs =
        snap.data().rdvs.map(
            r =>
                r.id === id
                ? {
                    ...r,
                    ...nouvellesValeurs
                }
                : r
        );

    await setDoc(
        docRef,
        {
            rdvs
        }
    );

}

export async function supprimerRdv(
    date,
    id
) {

    const docRef =
        doc(
            db,
            "calendrier",
            date
        );

    const snap =
        await getDoc(
            docRef
        );

    if (!snap.exists()) {
        return;
    }

    const rdvs =
        snap.data().rdvs.filter(
            r => r.id !== id
        );

    await setDoc(
        docRef,
        {
            rdvs
        }
    );

}
