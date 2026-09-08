import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs
} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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

    const snapshot = await getDocs(
        collection(
            db,
            "budgets",
            mois,
            "depenses"
        )
    );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}
