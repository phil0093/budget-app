import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    addDoc
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
