import { db } from "../firebase-config.js";

import {
    doc,
    getDoc,
    getDocs,
    setDoc,
    collection,
    addDoc,
    updateDoc
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

export async function chargerMouvementsMois(mois) {

    const snapshot = await getDocs(
        collection(
            db,
            "mois",
            mois,
            "mouvements"
        )
    );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function modifierMouvement(
    mois,
    id,
    valeurs
) {

    await updateDoc(
        doc(
            db,
            "mois",
            mois,
            "mouvements",
            id
        ),
        valeurs
    );

}
