import { db } from "./firebase-config.js";

import {
    getDocs,
    collection
} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerRecurrentes(mois) {

    const snapshot = await getDocs(
        collection(
            db,
            "budgets",
            mois,
            "recurrentes"
        )
    );

    return snapshot.docs.map(doc => doc.data());
}
