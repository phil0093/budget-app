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

export async function chargerNotes() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "notes"
            )
        );

    return snapshot.docs.map(
        doc => ({
            id: doc.id,
            ...doc.data()
        })
    );

}

export async function ajouterNote() {

    await addDoc(
        collection(
            db,
            "notes"
        ),
        {
            titre: "",
            contenu: ""
        }
    );

}

export async function modifierNote(
    id,
    donnees
) {

    await updateDoc(
        doc(
            db,
            "notes",
            id
        ),
        donnees
    );

}

export async function supprimerNote(
    id
) {

    await deleteDoc(
        doc(
            db,
            "notes",
            id
        )
    );

}
