import { db }
from "../firebase-config.js";

import {
    collection,
    getDocs,
    addDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerPersonnes() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "personnes"
            )
        );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function ajouterPersonne(nom) {

    await addDoc(
        collection(
            db,
            "personnes"
        ),
        {
            nom
        }
    );

}
