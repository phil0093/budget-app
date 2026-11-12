import { db } from "../firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerRecettes() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "recettes"
            )
        );

    return snapshot.docs.map(
        doc => ({
            id: doc.id,
            ...doc.data()
        })
    );

}

export async function ajouterRecette() {

    await addDoc(
        collection(
            db,
            "recettes"
        ),
        {
            nom: "",
            portions: "",
            tempsPreparation: "",
            tempsCuisson: "",
            ingredients: "",
            etapes: ""
        }
    );

}

export async function modifierRecette(
    id,
    donnees
) {

    await updateDoc(
        doc(
            db,
            "recettes",
            id
        ),
        donnees
    );

}

export async function supprimerRecette(
    id
) {

    await deleteDoc(
        doc(
            db,
            "recettes",
            id
        )
    );

}
