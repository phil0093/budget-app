import { db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function ajouterMouvementMois(
    mois,
    mouvement
) {

    await addDoc(
        collection(
            db,
            "mois",
            mois,
            "mouvements"
        ),
        mouvement
    );

}
export async function moisExiste(mois) {

    const snapshot = await getDoc(
        doc(db, "mois", mois)
    );

    return snapshot.exists();
}

export async function creerMois(mois) {

    await setDoc(
        doc(db, "mois", mois),
        {
            initialise: true,
            dateCreation: new Date().toISOString()
        }
    );

}
