import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function chargerCourses() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "courses"
            )
        );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function sauvegarderCourse(
    nom,
    rayons
) {

    await setDoc(
        doc(
            db,
            "courses",
            nom
        ),
        {
            nom,
            rayons
        }
    );

}

export async function supprimerCourse(
    nom
) {

    await deleteDoc(
        doc(
            db,
            "courses",
            nom
        )
    );

}
