import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    addDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerDocuments() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "documents"
            )
        );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function ajouterDocument(
    documentData
) {

    await addDoc(
        collection(
            db,
            "documents"
        ),
        documentData
    );

}
