import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc
} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerListesCourses() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "listesCourses"
            )
        );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function sauvegarderListeCourses(
    nom,
    lignes
) {

    await setDoc(
        doc(
            db,
            "listesCourses",
            nom
        ),
        {
            nom,
            lignes
        }
    );

}

export async function supprimerListeCourses(nom) {

    await deleteDoc(
        doc(
            db,
            "listesCourses",
            nom
        )
    );

}
