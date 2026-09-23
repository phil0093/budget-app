import { chargerDepenses } from "./services/depenses.js";
import { chargerRecurrentes } from "./services/recurrentes.js";
import { chargerMouvementsMois } from "./services/mois.js";

export async function calculerBudget(mois) {

    let recettes = 0;

    let recurrentes = 0;

    let depensesCourantes = 0;

    const mouvements =
        await chargerMouvementsMois(
            mois
        );

    mouvements.forEach(m => {

        if (m.type === "recette") {

            recettes += m.montant;

        } else {

            recurrentes += m.montant;

        }

    });

    const depenses =
        await chargerDepenses(
            mois
        );

    depenses.forEach(d => {

        depensesCourantes +=
            d.montant;

    });

    return (
        recettes
        -
        recurrentes
        -
        depensesCourantes
    );

}
