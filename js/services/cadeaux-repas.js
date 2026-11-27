import { db }
from "../firebase-config.js";


import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerCadeauxRepas() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "cadeauxRepas"
            )
        );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function ajouterCadeauRepas(
    donnees
) {

    await addDoc(
        collection(
            db,
            "cadeauxRepas"
        ),
        donnees
    );

}

export async function modifierCadeauRepas(
    id,
    donnees
) {

    await updateDoc(
        doc(
            db,
            "cadeauxRepas",
            id
        ),
        donnees
    );

}

export async function supprimerCadeauRepas(
    id
) {

    await deleteDoc(
        doc(
            db,
            "cadeauxRepas",
            id
        )
    );

}
