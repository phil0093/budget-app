import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerRecurrentes() {

    const q = query(
        collection(db, "recurrentes"),
        orderBy("libelle")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function ajouterRecurrente(data) {

    await addDoc(
        collection(db, "recurrentes"),
        data
    );
}

export async function supprimerRecurrente(id) {

    await deleteDoc(
        doc(db, "recurrentes", id)
    );
}

export async function modifierRecurrente(
    id,
    valeurs
) {

    await updateDoc(
        doc(db, "recurrentes", id),
        valeurs
    );
}
