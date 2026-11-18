import { db } from "../firebase-config.js";


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

export async function chargerDernieresDepenses(
    nombre = 30
) {

    let toutesDepenses = [];

    let date =
        new Date();

    while (
        toutesDepenses.length < nombre
    ) {

        const mois =
            date
            .toISOString()
            .substring(0, 7);

        try {

            const snapshot =
                await getDocs(

                    query(

                        collection(
                            db,
                            "budgets",
                            mois,
                            "depenses"
                        ),

                        orderBy(
                            "date",
                            "desc"
                        )

                    )

                );

            toutesDepenses.push(

                ...snapshot.docs.map(
                    doc => ({

                        id: doc.id,

                        ...doc.data()

                    })
                )

            );

        } catch {

        }

        date.setMonth(
            date.getMonth() - 1
        );

        if (
            date.getFullYear() < 2020
        ) {
            break;
        }

    }

    toutesDepenses.sort(
        (a, b) =>
            b.date.localeCompare(
                a.date
            )
    );

    return toutesDepenses;

}
