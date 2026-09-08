import { chargerDepenses } from "./depenses.js";
import { chargerRecurrentes } from "./recurrentes.js";

export async function calculerBudget(mois) {

    let revenus = 0;
    let recurrentes = 0;
    let depenses = 0;

    const listeRec =
        await chargerRecurrentes(mois);

    listeRec.forEach(item => {

        if (item.type === "revenu") {
            revenus += item.montant;
        }

        if (item.type === "charge") {
            recurrentes += item.montant;
        }

    });

    const listeDep =
        await chargerDepenses(mois);

    listeDep.forEach(item => {
        depenses += item.montant;
    });

    return revenus
        - recurrentes
        - depenses;
}
