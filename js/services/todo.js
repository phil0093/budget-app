import { db } from "../firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerTodo() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "todo"
            )
        );

    return snapshot.docs.map(
        d => ({
            id: d.id,
            ...d.data()
        })
    );

}

export async function ajouterTodo(texte, zone) {

    await addDoc(
        collection(
            db,
            "todo"
        ),
        {
            texte,
            zone,
            terminee: false,
            dateCreation:
                new Date().toISOString(),
            dateTerminee: null
        }
    );

}

export async function modifierTodo(
    id,
    donnees
) {

    await updateDoc(
        doc(
            db,
            "todo",
            id
        ),
        donnees
    );

}

export async function supprimerTodo(id) {

    await deleteDoc(
        doc(
            db,
            "todo",
            id
        )
    );

}
