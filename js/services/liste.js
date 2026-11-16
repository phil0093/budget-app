import { db } from "../firebase-config.js";


import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc
} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerListes() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "listes"
            )
        );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function sauvegarderListe(
    nom,
    lignes
) {

    await setDoc(
        doc(
            db,
            "listes",
            nom
        ),
        {
            nom,
            lignes
        }
    );

}

export async function supprimerListe(nom) {

    await deleteDoc(
        doc(
            db,
            "listes",
            nom
        )
    );

}

window.migrerListes =
async function() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "listesCourses"
            )
        );

    for (const documentAncien of snapshot.docs) {

        await setDoc(
            doc(
                db,
                "listes",
                documentAncien.id
            ),
            documentAncien.data()
        );

    }

    console.log(
        "Migration terminée"
    );

};
