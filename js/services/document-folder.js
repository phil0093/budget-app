import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerDossiers() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "documentFolders"
            )
        );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function ajouterDossier(
    nom,
    parent = null
) {

    await addDoc(
        collection(
            db,
            "documentFolders"
        ),
        {
            nom,
            parent
        }
    );

}
export async function modifierDossier(
    id,
    nom
) {

    await updateDoc(
        doc(
            db,
            "dossiers",
            id
        ),
        {
            nom
        }
    );

}
export async function supprimerDossier(
    id
) {

    await deleteDoc(
        doc(
            db,
            "dossiers",
            id
        )
    );

}
