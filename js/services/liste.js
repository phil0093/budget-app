import { db } from "../firebase-config.js";


import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
    getDoc,
    updateDoc
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

export async function renommerListe(
    ancienNom,
    nouveauNom
) {

    const ancienDoc =
        await getDoc(
            doc(
                db,
                "listes",
                ancienNom
            )
        );

    if (!ancienDoc.exists()) {
        return;
    }

    const data =
        ancienDoc.data();

    await setDoc(
        doc(
            db,
            "listes",
            nouveauNom
        ),
        {
            ...data,
            nom: nouveauNom
        }
    );

    await deleteDoc(
        doc(
            db,
            "listes",
            ancienNom
        )
    );

}
