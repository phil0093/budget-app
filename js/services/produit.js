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

export async function chargerProduits() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "produits"
            )
        );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function ajouterProduit(
    nom,
    rayon
) {

    await addDoc(
        collection(
            db,
            "produits"
        ),
        {
            nom,
            rayon
        }
    );

}
export async function modifierProduit(
    id,
    donnees
) {

    await updateDoc(
        doc(
            db,
            "produits",
            id
        ),
        donnees
    );

}
export async function supprimerProduit(
    id
) {

    await deleteDoc(
        doc(
            db,
            "produits",
            id
        )
    );

}
