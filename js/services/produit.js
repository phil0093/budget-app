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

    nom = nom.trim();

    const snapshot =
        await getDocs(
            collection(
                db,
                "produits"
            )
        );

    const existe =
        snapshot.docs.some(doc => {

            const data = doc.data();

            return (
                data.rayon === rayon
                &&
                data.nom
                    .trim()
                    .toLowerCase()
                    ===
                nom
                    .trim()
                    .toLowerCase()
            );

        });

    if (existe) {
        return;
    }

    await addDoc(
        collection(
            db,
            "produits"
        ),
        {
            nom,
            rayon,
            dateAjout:
                new Date()
                    .toISOString()
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
        {
            ...donnees,

            dateAjout:
                new Date()
                    .toISOString()
        }
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
