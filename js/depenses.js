import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function ajouterDepenseFirestore(depense) {

    await addDoc(
        collection(
            db,
            "budgets",
            depense.mois,
            "depenses"
        ),
        depense
    );
}

export async function chargerDepenses(mois) {

    const q = query(
        collection(
            db,
            "budgets",
            mois,
            "depenses"
        ),
        orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function supprimerDepenseFirestore(
    mois,
    depenseId
) {

    await deleteDoc(
        doc(
            db,
            "budgets",
            mois,
            "depenses",
            depenseId
        )
    );

}

export async function modifierDepenseFirestore(
    mois,
    depenseId,
    nouvellesValeurs
) {

    await updateDoc(
        doc(
            db,
            "budgets",
            mois,
            "depenses",
            depenseId
        ),
        nouvellesValeurs
    );

}
